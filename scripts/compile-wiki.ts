#!/usr/bin/env bun
// ============================================
// WIKI COMPILER — v3.0 (graph-native)
// ============================================
// Reads raw/signals.json → LLM compiles articles →
// builds graph.json (nodes + edges + communities) →
// filesystem wiki in public/wiki/
//
// Borrows from graphify:
//   - EXTRACTED / INFERRED / AMBIGUOUS confidence on edges
//   - graph.json for BFS traversal in query route
//   - community detection (simple degree-based clustering)
//   - god nodes (highest-degree concepts)
//
// Input:  src/raw/signals.json  ← human edits here only
// Output: public/wiki/          ← LLM owns this entirely
//         public/wiki/graph.json ← graph for agent traversal
// ============================================

import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import signals from '../src/raw/signals.json';

const DRY_RUN = process.argv.includes('--dry-run');
const WIKI_ROOT = join(import.meta.dir, '..', 'public', 'wiki');
const COMPILED_AT = new Date().toISOString();

// ---- AI ----
const openai = createOpenAI({
  baseURL: process.env.AI_GATEWAY_BASE_URL ?? 'https://api.openai.com/v1',
  apiKey: process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY ?? '',
});

async function llm(prompt: string, system: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { text } = await generateText({
        model: openai.chat('anthropic/claude-sonnet-4-5'),
        system,
        prompt,
        maxTokens: 2000,
      });
      return text.trim();
    } catch (e: any) {
      if (attempt === retries) throw e;
      const wait = attempt * 4000;
      console.warn(`  ⚠ LLM timeout (attempt ${attempt}/${retries}), retrying in ${wait/1000}s...`);
      await new Promise(r => setTimeout(r, wait));
    }
  }
  return '';
}

// ---- File helpers ----
function writeWiki(path: string, content: string) {
  const full = join(WIKI_ROOT, path);
  if (DRY_RUN) { console.log(`[DRY RUN] ${path}`); return; }
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, 'utf-8');
  console.log(`  ✓ ${path}`);
}

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ============================================
// GRAPH BUILDER (graphify-inspired)
// ============================================

type Confidence = 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS';

interface GraphNode {
  id: string;           // slug
  label: string;        // human name
  type: 'signal' | 'person' | 'org' | 'domain' | 'project' | 'concept';
  wikiPath?: string;    // path to wiki article e.g. "orgs/lion-circuits.md"
  signalIds: string[];  // which signals reference this node
  degree?: number;      // computed after build
  community?: number;   // computed after clustering
}

interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  confidence: Confidence;
  signalId?: string;    // which signal this was extracted from
}

interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  meta: {
    compiledAt: string;
    totalSignals: number;
    godNodes: string[];        // highest-degree node ids
    communities: number;
  };
}

function buildGraph(
  sigs: any[],
  orgs: string[],
  domains: string[],
  projects: string[],
  people: string[],
  concepts: any[]
): Graph {
  const nodes = new Map<string, GraphNode>();
  const edges: GraphEdge[] = [];
  const edgeSet = new Set<string>(); // dedup

  function addNode(id: string, label: string, type: GraphNode['type'], wikiPath?: string) {
    if (!nodes.has(id)) {
      nodes.set(id, { id, label, type, wikiPath, signalIds: [] });
    }
  }

  function addEdge(source: string, target: string, relation: string, confidence: Confidence, signalId?: string) {
    if (source === target) return;
    const key = `${source}→${target}:${relation}`;
    const keyRev = `${target}→${source}:${relation}`;
    if (edgeSet.has(key) || edgeSet.has(keyRev)) return;
    edgeSet.add(key);
    edges.push({ source, target, relation, confidence, signalId });
  }

  // ---- Seed nodes from entity lists ----
  people.forEach(p => addNode(slug(p), p, 'person', `people/${slug(p)}.md`));
  orgs.forEach(o => addNode(slug(o), o, 'org', `orgs/${slug(o)}.md`));
  domains.forEach(d => addNode(slug(d), d, 'domain', `domains/${slug(d)}.md`));
  projects.forEach(p => addNode(slug(p), p, 'project', `projects/${slug(p)}.md`));
  concepts.forEach(c => addNode(c.slug, c.name, 'concept', `concepts/${c.slug}.md`));

  // Lakshveer is always the central node
  addNode('lakshveer', 'Lakshveer Rao', 'person', 'people/lakshveer.md');

  // ---- Extract edges from signals ----
  for (const sig of sigs) {
    const sigOrgs = (sig.organizations ?? []).map((o: string) => slug(o));
    const sigDomains = (sig.domains ?? []).map((d: string) => slug(d));
    const sigEntities = (sig.entities ?? []);

    // Signal → org: EXTRACTED (directly stated in signal)
    for (const orgId of sigOrgs) {
      if (nodes.has(orgId)) {
        nodes.get(orgId)!.signalIds.push(sig.id);
        addEdge('lakshveer', orgId, 'associated_with', 'EXTRACTED', sig.id);
      }
    }

    // Signal → domain: EXTRACTED
    for (const domId of sigDomains) {
      if (nodes.has(domId)) {
        nodes.get(domId)!.signalIds.push(sig.id);
        addEdge('lakshveer', domId, 'active_in', 'EXTRACTED', sig.id);
      }
    }

    // Org → domain co-occurrence within same signal: INFERRED
    for (const orgId of sigOrgs) {
      for (const domId of sigDomains) {
        if (nodes.has(orgId) && nodes.has(domId)) {
          addEdge(orgId, domId, 'operates_in', 'INFERRED', sig.id);
        }
      }
    }

    // Org → org co-occurrence within same signal: INFERRED
    for (let i = 0; i < sigOrgs.length; i++) {
      for (let j = i + 1; j < sigOrgs.length; j++) {
        if (nodes.has(sigOrgs[i]) && nodes.has(sigOrgs[j])) {
          addEdge(sigOrgs[i], sigOrgs[j], 'co_appeared', 'INFERRED', sig.id);
        }
      }
    }

    // Entity mentions: EXTRACTED if org/person, AMBIGUOUS if unclear
    for (const e of sigEntities) {
      const eSlug = slug(e);
      if (nodes.has(eSlug)) {
        nodes.get(eSlug)!.signalIds.push(sig.id);
      }
    }

    // Project → domain: EXTRACTED
    for (const proj of projects) {
      if ((sig.title + sig.rawText).includes(proj)) {
        const projSlug = slug(proj);
        for (const domId of sigDomains) {
          if (nodes.has(domId)) {
            addEdge(projSlug, domId, 'belongs_to', 'EXTRACTED', sig.id);
          }
        }
        addEdge('lakshveer', projSlug, 'built', 'EXTRACTED', sig.id);
      }
    }

    // Concept → signal signals: INFERRED
    for (const c of concepts) {
      if (c.relatedSignalIds?.includes(sig.id)) {
        addEdge('lakshveer', c.slug, 'exhibits', 'INFERRED', sig.id);
        for (const orgId of sigOrgs) {
          if (nodes.has(orgId)) addEdge(c.slug, orgId, 'manifested_via', 'INFERRED', sig.id);
        }
      }
    }
  }

  // ---- Compute degree ----
  const degree = new Map<string, number>();
  for (const e of edges) {
    degree.set(e.source, (degree.get(e.source) ?? 0) + 1);
    degree.set(e.target, (degree.get(e.target) ?? 0) + 1);
  }
  for (const [id, node] of nodes) {
    node.degree = degree.get(id) ?? 0;
  }

  // ---- Simple community detection (label propagation approximation) ----
  // Assign community = community of highest-degree neighbor, iterate 3x
  const communityMap = new Map<string, number>();
  let communityId = 0;
  for (const id of nodes.keys()) communityMap.set(id, communityId++);

  const adjacency = new Map<string, string[]>();
  for (const e of edges) {
    if (!adjacency.has(e.source)) adjacency.set(e.source, []);
    if (!adjacency.has(e.target)) adjacency.set(e.target, []);
    adjacency.get(e.source)!.push(e.target);
    adjacency.get(e.target)!.push(e.source);
  }

  // 3 iterations of label propagation
  for (let iter = 0; iter < 3; iter++) {
    for (const [id] of nodes) {
      const neighbors = adjacency.get(id) ?? [];
      if (neighbors.length === 0) continue;
      // pick community of highest-degree neighbor
      const best = neighbors
        .filter(n => nodes.has(n))
        .sort((a, b) => (nodes.get(b)?.degree ?? 0) - (nodes.get(a)?.degree ?? 0))[0];
      if (best) communityMap.set(id, communityMap.get(best) ?? communityMap.get(id)!);
    }
  }

  // Renumber communities 0..N
  const communityRemap = new Map<number, number>();
  let nextCommunity = 0;
  for (const [id, node] of nodes) {
    const old = communityMap.get(id)!;
    if (!communityRemap.has(old)) communityRemap.set(old, nextCommunity++);
    node.community = communityRemap.get(old)!;
  }

  // ---- God nodes (top 8 by degree) ----
  const godNodes = [...nodes.values()]
    .filter(n => n.id !== 'lakshveer') // exclude central — it's always #1
    .sort((a, b) => (b.degree ?? 0) - (a.degree ?? 0))
    .slice(0, 8)
    .map(n => n.id);

  // ---- Build community index (id → community) for the graph ----
  const communityIndex: Record<string, number> = {};
  for (const [id, node] of nodes) {
    communityIndex[id] = node.community ?? 0;
  }

  // ---- Build community list: [{ id, nodeIds }] ----
  const communityGroups = new Map<number, string[]>();
  for (const [id, node] of nodes) {
    const c = node.community ?? 0;
    if (!communityGroups.has(c)) communityGroups.set(c, []);
    communityGroups.get(c)!.push(id);
  }
  const communities = [...communityGroups.entries()].map(([id, nodeIds]) => ({
    id,
    nodeIds,
    size: nodeIds.length,
  }));

  return {
    nodes: [...nodes.values()],
    edges,
    communities,
    meta: {
      compiledAt: COMPILED_AT,
      totalSignals: sigs.length,
      godNodes,
      communities: nextCommunity,
    },
  };
}

// ============================================
// ENTITY EXTRACTION
// ============================================

const PROJECT_KEYWORDS = ['CircuitHeroes', 'Drishtikon Yantra', 'Drishtikon', 'MotionX', 'Beats in Brief', 'StartupPedia'];

function extractEntities(sigs: any[]) {
  const projects = new Set<string>();
  const orgs = new Set<string>();
  const domains = new Set<string>();
  const people = new Set<string>();

  for (const s of sigs) {
    for (const o of s.organizations ?? []) if (o?.trim()) orgs.add(o.trim());
    for (const d of s.domains ?? []) if (d?.trim()) domains.add(d.trim());
    for (const kw of PROJECT_KEYWORDS) {
      if ((s.title + s.rawText).includes(kw)) projects.add(kw);
    }
    for (const e of s.entities ?? []) {
      if (['S. Somanath', 'Lakshveer'].some(p => e.includes(p))) people.add(e);
    }
  }
  return {
    people: [...people],
    projects: [...projects],
    orgs: [...orgs],
    domains: [...domains],
  };
}

function related(sigs: any[], term: string) {
  return sigs.filter(s =>
    [s.title, s.rawText, ...(s.entities ?? []), ...(s.organizations ?? []), ...(s.domains ?? [])]
      .join(' ').toLowerCase().includes(term.toLowerCase())
  );
}

// ============================================
// ARTICLE GENERATORS
// ============================================

const SYSTEM = `You are compiling a personal knowledge wiki about Lakshveer Rao — an 8-year-old Indian hardware founder and maker from Hyderabad.

This wiki is built FOR AGENTS to read, not humans. Dense, factual, structured markdown.
Rules:
- ## Summary — 2-3 sentences max
- ## Signals — cite signal IDs as backlinks
- ## Related Articles — [[path]] style links
- Facts only. No marketing. No fluff.
- Dates matter. Signal IDs are source of truth.`;

function articlePrompt(type: string, name: string, sigs: any[], format: string) {
  return `Write a wiki article for this ${type}: "${name}"

Related signals:
${sigs.map(s => `- [${s.id}] ${s.title} (${s.date})`).join('\n')}

Signal data:
${JSON.stringify(sigs, null, 2)}

${format}

---
*Compiled: ${COMPILED_AT}*`;
}

const PERSON_FORMAT = (name: string) => `# ${name}\n*Person*\n\n## Summary\n## Role in Lakshveer's Story\n## Signals\n## Related Articles`;
const PROJECT_FORMAT = (name: string) => `# ${name}\n*Project*\n\n## Summary\n## Status & Timeline\n## Impact\n## Signals\n## Related Articles`;
const ORG_FORMAT = (name: string) => `# ${name}\n*Organization*\n\n## Summary\n## Relationship with Lakshveer\n## Signals\n## Related Articles`;
const DOMAIN_FORMAT = (name: string) => `# ${name}\n*Domain*\n\n## Summary\n## Evidence\n## Trajectory\n## Signals\n## Related Articles`;

// ============================================
// PARALLEL COMPILE
// ============================================

async function parallelCompile<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  concurrency = 6
) {
  const queue = [...items];
  const workers = Array(Math.min(concurrency, queue.length)).fill(null).map(async () => {
    while (queue.length) {
      const item = queue.shift()!;
      await fn(item);
    }
  });
  await Promise.all(workers);
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log(`\n🧠 Wiki Compiler v3 — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`📦 ${signals.length} signals | ⚡ parallel compilation | 🕸️ graph-native\n`);

  const { people, projects, orgs, domains } = extractEntities(signals as any[]);
  console.log(`Entities: ${people.length} people, ${projects.length} projects, ${orgs.length} orgs, ${domains.length} domains\n`);

  const t0 = Date.now();

  // ---- Step 1: Compile articles (parallel) ----
  console.log('📝 Compiling articles (parallel)...');

  await Promise.all([
    parallelCompile(people, async (name) => {
      const sigs = related(signals as any[], name);
      const content = await llm(articlePrompt('person', name, sigs, PERSON_FORMAT(name)), SYSTEM);
      writeWiki(`people/${slug(name)}.md`, content);
    }),
    parallelCompile(projects, async (name) => {
      const sigs = related(signals as any[], name);
      const content = await llm(articlePrompt('project', name, sigs, PROJECT_FORMAT(name)), SYSTEM);
      writeWiki(`projects/${slug(name)}.md`, content);
    }),
    parallelCompile(orgs, async (name) => {
      const sigs = related(signals as any[], name);
      const content = await llm(articlePrompt('organization', name, sigs, ORG_FORMAT(name)), SYSTEM);
      writeWiki(`orgs/${slug(name)}.md`, content);
    }),
    parallelCompile(domains, async (name) => {
      const sigs = related(signals as any[], name);
      const content = await llm(articlePrompt('domain/area', name, sigs, DOMAIN_FORMAT(name)), SYSTEM);
      writeWiki(`domains/${slug(name)}.md`, content);
    }),
  ]);

  // ---- Step 2: Emergent concepts ----
  console.log('\n🔍 Identifying emergent concepts...');
  const conceptsRaw = await llm(
    `Analyze ALL signals about Lakshveer. Find 4-5 emergent narrative arcs — non-obvious patterns not stated in any single signal.

All signals:
${JSON.stringify(signals, null, 2)}

Return JSON array: [{ name, slug, summary, relatedSignalIds: string[] }]
Return only valid JSON, no markdown fences.`,
    `You are an intelligence analyst finding emergent patterns. Return only valid JSON array.`
  );

  let concepts: any[] = [];
  try {
    concepts = JSON.parse(conceptsRaw.replace(/```json\n?|```\n?/g, '').trim());
  } catch {
    console.error('Concept parse failed — skipping');
  }

  await parallelCompile(concepts, async (c) => {
    const sigs = (signals as any[]).filter(s => c.relatedSignalIds?.includes(s.id));
    const content = await llm(
      `Write a wiki article for this emergent concept: "${c.name}"
Summary: ${c.summary}
Related signals: ${c.relatedSignalIds?.join(', ')}
Signal data: ${JSON.stringify(sigs, null, 2)}

Format:
# ${c.name}
*Concept — Emergent Pattern*

## Summary
## Evidence
## Significance
## Signals
## Related Articles

---
*Compiled: ${COMPILED_AT}*`,
      SYSTEM
    );
    writeWiki(`concepts/${c.slug}.md`, content);
  });

  console.log(`  Found: ${concepts.map((c: any) => c.name).join(', ')}`);

  // ---- Step 3: Meta articles (parallel) ----
  console.log('\n📊 Compiling meta articles (parallel)...');
  const SIGS_CTX = JSON.stringify(signals, null, 2);

  await Promise.all([
    (async () => {
      const content = await llm(
        `Write the master narrative article for Lakshveer Rao's wiki. Factual, dense, chronological. Wikipedia biography style.

All signals:
${SIGS_CTX}

Format:
# Lakshveer Rao — Narrative
*Meta Article*

## Summary
## Timeline
## The Arc
## By the Numbers
## Signals
## Related Articles

---
*Compiled: ${COMPILED_AT}*`,
        SYSTEM
      );
      writeWiki('meta/narrative.md', content);
    })(),

    (async () => {
      const content = await llm(
        `Analyze Lakshveer's signals. Find: information gaps, inconsistencies, underrepresented domains, suggested new articles.

All signals:
${SIGS_CTX}

Format:
# Gaps & Health Check
*Meta — Wiki Health*

## Information Gaps
## Inconsistencies
## Underrepresented Domains
## Suggested Articles
## Questions to Answer

---
*Compiled: ${COMPILED_AT}*`,
        SYSTEM
      );
      writeWiki('meta/gaps.md', content);
    })(),

    (async () => {
      const content = await llm(
        `Find non-obvious connections between entities in Lakshveer's signals. Entity bridges, temporal correlations, domain convergences, predictions.

All signals:
${SIGS_CTX}

Format:
# Non-Obvious Connections
*Meta — Intelligence Layer*

## Entity Bridges
## Temporal Correlations
## Domain Convergences
## Hypothesis: What's Next

---
*Compiled: ${COMPILED_AT}*`,
        SYSTEM
      );
      writeWiki('meta/connections.md', content);
    })(),

    // ---- Central subject article ----
    (async () => {
      const content = await llm(
        `Write the central wiki article for Lakshveer Rao himself. This is the most important article.

All signals:
${SIGS_CTX}

Format:
# Lakshveer Rao
*Person — Central Subject*

## Identity
## What He Builds
## Key Numbers
## Institutional Recognition
## Voice of the Ecosystem
## Timeline
## Active Systems
## Signals

---
*Compiled: ${COMPILED_AT}*`,
        SYSTEM
      );
      writeWiki('people/lakshveer.md', content);
      console.log('  ✓ people/lakshveer.md');
    })(),
  ]);

  // ---- Step 4: Build graph ----
  console.log('\n🕸️  Building graph.json...');
  const graph = buildGraph(signals as any[], orgs, domains, projects, people, concepts);

  // Log god nodes
  const godNodeLabels = graph.meta.godNodes
    .map(id => graph.nodes.find(n => n.id === id)?.label ?? id);
  console.log(`  God nodes: ${godNodeLabels.join(', ')}`);
  console.log(`  Communities: ${graph.meta.communities}`);
  console.log(`  Nodes: ${graph.nodes.length} | Edges: ${graph.edges.length}`);

  writeWiki('graph.json', JSON.stringify(graph, null, 2));

  // ---- Step 5: Index ----
  console.log('\n📋 Building index...');

  const indexContent = `# Lakshveer Rao — Personal Knowledge Wiki
*Agent entry point. Start here.*

## About
This wiki is LLM-compiled from \`src/raw/signals.json\`.
Built for agents to navigate — not for humans to read.
Human adds to raw/. LLM owns wiki/. Never the other way around.

Source: \`signals.json\` — ${signals.length} signals — compiled ${COMPILED_AT}

## Graph
- [[graph.json]] — knowledge graph (BFS/DFS traversal, god nodes, communities)
- God nodes (highest-degree): ${godNodeLabels.slice(0, 5).join(', ')}
- Communities detected: ${graph.meta.communities}

## How to Navigate
1. Read this index
2. Load graph.json for BFS traversal
3. Follow [[backlinks]] into article directories
4. /meta/ articles have compiled analysis

## People
- [[people/lakshveer]] — Lakshveer Rao (central subject)
${people.map(n => `- [[people/${slug(n)}]] — ${n}`).join('\n')}

## Projects
${projects.map(n => `- [[projects/${slug(n)}]] — ${n}`).join('\n')}

## Organizations
${orgs.map(n => `- [[orgs/${slug(n)}]] — ${n}`).join('\n')}

## Domains
${domains.map(n => `- [[domains/${slug(n)}]] — ${n}`).join('\n')}

## Concepts (Emergent Patterns)
${concepts.map((c: any) => `- [[concepts/${c.slug}]] — ${c.name}`).join('\n')}

## Meta
- [[meta/narrative]] — Full narrative + timeline
- [[meta/gaps]] — Gaps, health check
- [[meta/connections]] — Non-obvious connections + predictions

## Stats
- Signals: ${signals.length}
- Articles: ${people.length + projects.length + orgs.length + domains.length + concepts.length + 4}
- Graph nodes: ${graph.nodes.length}
- Graph edges: ${graph.edges.length}
- Compiled: ${COMPILED_AT}

---
*LLM-owned. Do not edit manually.*`;

  writeWiki('index.md', indexContent);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const total = people.length + projects.length + orgs.length + domains.length + concepts.length + 4;
  console.log(`\n✅ Done in ${elapsed}s — ${total} articles + graph.json written to public/wiki/`);
}

main().catch(e => { console.error(e); process.exit(1); });
