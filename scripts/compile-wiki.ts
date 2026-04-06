#!/usr/bin/env bun
// ============================================
// WIKI COMPILER — v1.0
// ============================================
// Reads signals.json (raw/) → uses LLM to compile
// a filesystem-native wiki in public/wiki/
//
// Philosophy (Karpathy + Farza pattern):
//   - LLM owns the wiki. Human only adds to raw/.
//   - Wiki is built for agents to navigate, not humans.
//   - index.md is the entry point — an agent starts here.
//   - Backlinks connect everything.
//   - Queries filed back in enhance the wiki over time.
//
// Usage:
//   bun scripts/compile-wiki.ts           # full compile
//   bun scripts/compile-wiki.ts --dry-run # preview, no writes
// ============================================

import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import signals from '../src/data/signals.json';

// ---- Config ----
const DRY_RUN = process.argv.includes('--dry-run');
const WIKI_ROOT = join(import.meta.dir, '..', 'public', 'wiki');
const COMPILED_AT = new Date().toISOString();

// ---- AI Client ----
const openai = createOpenAI({
  baseURL: process.env.AI_GATEWAY_BASE_URL ?? 'https://api.openai.com/v1',
  apiKey: process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY ?? '',
});

async function llm(prompt: string, systemPrompt: string): Promise<string> {
  const { text } = await generateText({
    model: openai.chat('anthropic/claude-sonnet-4-5'),
    system: systemPrompt,
    prompt,
    maxTokens: 2000,
  });
  return text.trim();
}

// ---- Helpers ----
function writeWiki(relativePath: string, content: string) {
  const fullPath = join(WIKI_ROOT, relativePath);
  if (DRY_RUN) {
    console.log(`[DRY RUN] Would write: ${relativePath}`);
    console.log(content.slice(0, 300) + '\n...\n');
    return;
  }
  mkdirSync(dirname(fullPath), { recursive: true });
  writeFileSync(fullPath, content, 'utf-8');
  console.log(`✓ ${relativePath}`);
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function signalSummaryBlock(sig: any): string {
  return `- **[${sig.id}]** ${sig.title} *(${sig.date})*`;
}

// ---- Extract entities from signals ----
function extractEntities(signals: any[]) {
  const people = new Set<string>();
  const projects = new Set<string>();
  const orgs = new Set<string>();
  const domains = new Set<string>();

  const PROJECT_KEYWORDS = ['CircuitHeroes', 'Drishtikon', 'MotionX', 'Beats in Brief', 'StartupPedia', 'Farzapedia'];
  const PERSON_KEYWORDS = ['S. Somanath', 'Lakshveer'];

  for (const sig of signals) {
    for (const entity of sig.entities ?? []) {
      if (PERSON_KEYWORDS.some(p => entity.includes(p.split(' ')[1] || p))) {
        if (entity !== 'Lakshveer') people.add(entity);
      }
    }
    for (const org of sig.organizations ?? []) {
      if (org && org.trim()) orgs.add(org.trim());
    }
    for (const domain of sig.domains ?? []) {
      if (domain && domain.trim()) domains.add(domain.trim());
    }
    // Extract projects from titles and entities
    for (const keyword of PROJECT_KEYWORDS) {
      if (sig.title?.includes(keyword) || sig.rawText?.includes(keyword)) {
        projects.add(keyword);
      }
    }
    for (const entity of sig.entities ?? []) {
      if (PROJECT_KEYWORDS.some(p => entity.includes(p))) {
        projects.add(entity);
      }
    }
  }

  return { people: [...people], projects: [...projects], orgs: [...orgs], domains: [...domains] };
}

// ---- System prompt for all wiki articles ----
const WIKI_SYSTEM = `You are compiling a personal knowledge wiki about Lakshveer Rao — a 16-year-old Indian maker, builder, and entrepreneur from Hyderabad.

This wiki is built FOR AGENTS to read, not for humans. Write in a dense, factual, well-structured markdown format.
Rules:
- Always include a ## Summary section (2-3 sentences max)
- Always include a ## Signals section listing relevant signal IDs as backlinks
- Always include a ## Related Articles section with [[wiki-path]] style backlinks
- Use ## headers for sections, never ###
- Be factual — only use what's in the signals provided
- No fluff, no filler, no marketing language
- Dates matter — include them
- Signal IDs are the source of truth — cite them`;

const SIGNALS_CONTEXT = JSON.stringify(signals, null, 2);

// ============================================
// ARTICLE GENERATORS
// ============================================

async function compilePerson(name: string, relatedSignals: any[]): Promise<string> {
  const sigBlock = relatedSignals.map(signalSummaryBlock).join('\n');
  return llm(
    `Write a wiki article for this person: "${name}"
Related signals:
${sigBlock}

Full signal data for context:
${JSON.stringify(relatedSignals, null, 2)}

Format:
# ${name}
*Person*

## Summary
[2-3 sentences]

## Role in Lakshveer's Story
[How they connect to Lakshveer's journey]

## Signals
[List signal IDs as: - [[signals/${slug(name)}]] sig-id — one line description]

## Related Articles
[Backlinks to orgs, projects, domains]

---
*Compiled: ${COMPILED_AT}*`,
    WIKI_SYSTEM
  );
}

async function compileProject(name: string, relatedSignals: any[]): Promise<string> {
  const sigBlock = relatedSignals.map(signalSummaryBlock).join('\n');
  return llm(
    `Write a wiki article for this project: "${name}"
Related signals:
${sigBlock}

Full signal data:
${JSON.stringify(relatedSignals, null, 2)}

Format:
# ${name}
*Project*

## Summary
[What it is, 2-3 sentences]

## Status & Timeline
[Key dates and milestones from signals]

## Impact
[Measurable outcomes from signals — numbers, awards, recognition]

## Signals
[List signal IDs]

## Related Articles
[Backlinks to people, orgs, domains]

---
*Compiled: ${COMPILED_AT}*`,
    WIKI_SYSTEM
  );
}

async function compileOrg(name: string, relatedSignals: any[]): Promise<string> {
  const sigBlock = relatedSignals.map(signalSummaryBlock).join('\n');
  return llm(
    `Write a wiki article for this organization: "${name}"
Related signals:
${sigBlock}

Full signal data:
${JSON.stringify(relatedSignals, null, 2)}

Format:
# ${name}
*Organization*

## Summary
[What the org is and its relevance to Lakshveer]

## Relationship with Lakshveer
[Nature of the relationship, what happened]

## Signals
[List signal IDs]

## Related Articles
[Backlinks]

---
*Compiled: ${COMPILED_AT}*`,
    WIKI_SYSTEM
  );
}

async function compileDomain(name: string, relatedSignals: any[]): Promise<string> {
  const sigBlock = relatedSignals.map(signalSummaryBlock).join('\n');
  return llm(
    `Write a wiki article for this domain/area: "${name}"
Related signals:
${sigBlock}

Format:
# ${name}
*Domain*

## Summary
[What this domain means in Lakshveer's context]

## Evidence
[Key signals that demonstrate depth in this domain]

## Trajectory
[How involvement in this domain has evolved over time]

## Signals
[List signal IDs]

## Related Articles
[Backlinks to projects, people, orgs]

---
*Compiled: ${COMPILED_AT}*`,
    WIKI_SYSTEM
  );
}

async function compileConcepts(allSignals: any[]): Promise<string[]> {
  const raw = await llm(
    `Analyze ALL of these signals about Lakshveer and identify 3-5 emergent CONCEPTS or narrative arcs.
These should be non-obvious connections and patterns — things that aren't stated explicitly in any single signal but emerge from the full picture.

All signals:
${SIGNALS_CONTEXT}

Return a JSON array of objects with: { name: string, slug: string, summary: string, relatedSignalIds: string[], relatedArticles: string[] }
Return only valid JSON, nothing else.`,
    `You are an intelligence analyst studying a person's signal data to find emergent narrative patterns. Return only valid JSON.`
  );

  let concepts: any[] = [];
  try {
    const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    concepts = JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse concepts JSON:', raw.slice(0, 200));
    return [];
  }

  const articles: string[] = [];
  for (const concept of concepts) {
    const content = await llm(
      `Write a wiki article for this emergent concept: "${concept.name}"

Summary: ${concept.summary}
Related signals: ${concept.relatedSignalIds.join(', ')}

Full signals for context:
${JSON.stringify(allSignals.filter(s => concept.relatedSignalIds.includes(s.id)), null, 2)}

Format:
# ${concept.name}
*Concept — Emergent Pattern*

## Summary
[What this concept is — 2-3 sentences]

## Evidence
[Signal-by-signal evidence for this pattern]

## Significance
[Why this matters for Lakshveer's trajectory]

## Signals
[List signal IDs]

## Related Articles
[Backlinks]

---
*Compiled: ${COMPILED_AT}*`,
      WIKI_SYSTEM
    );
    writeWiki(`concepts/${concept.slug}.md`, content);
    articles.push(concept.name);
  }
  return articles;
}

async function compileNarrative(allSignals: any[]): Promise<string> {
  return llm(
    `Write the master narrative article for Lakshveer Rao's personal wiki.
This is the "about" article — the compiled story from all signals.
It should read like a Wikipedia biography section — factual, dense, chronological.

All signals:
${SIGNALS_CONTEXT}

Format:
# Lakshveer Rao — Narrative
*Meta Article*

## Who He Is
[2-3 sentence factual summary]

## Timeline
[Chronological key events from signals, with dates]

## The Arc
[The narrative thread — where he started, where he's going, based on signals only]

## By the Numbers
[Quantifiable facts: projects built, awards, reach, etc.]

## Signals
[All signal IDs]

## Related Articles
[Links to all major people, projects, orgs, concepts]

---
*Compiled: ${COMPILED_AT}*`,
    WIKI_SYSTEM
  );
}

async function compileGaps(allSignals: any[]): Promise<string> {
  return llm(
    `Analyze Lakshveer's signal data and identify:
1. Information gaps — what's missing that would strengthen the picture
2. Inconsistencies — conflicting or unclear data
3. Underrepresented domains — areas that seem important but have thin signal coverage
4. Suggested new articles — topics that should exist in the wiki but don't yet

All signals:
${SIGNALS_CONTEXT}

Format:
# Gaps & Health Check
*Meta — Wiki Health*

## Information Gaps
[List with brief explanations]

## Inconsistencies
[List with signal IDs]

## Underrepresented Domains
[Domains with only 1-2 signals]

## Suggested Articles to Create
[New article candidates with justification]

## Questions to Answer
[Questions that, if answered, would most improve the wiki]

---
*Compiled: ${COMPILED_AT}*`,
    WIKI_SYSTEM
  );
}

async function compileConnections(allSignals: any[]): Promise<string> {
  return llm(
    `Analyze Lakshveer's signal data and find non-obvious connections between entities.
Look for: shared organizations, overlapping domains, temporal correlations, people who bridge multiple signals.

All signals:
${SIGNALS_CONTEXT}

Format:
# Non-Obvious Connections
*Meta — Intelligence Layer*

## Entity Bridges
[Entities that appear across multiple unrelated signals]

## Temporal Correlations
[Events that happened close together — what might be cause/effect]

## Domain Convergences
[Where separate domain threads are converging]

## Hypothesis: What's Next
[Based on signal patterns, what would logically come next]

---
*Compiled: ${COMPILED_AT}*`,
    WIKI_SYSTEM
  );
}

// ============================================
// INDEX BUILDER
// ============================================

function buildIndex(
  people: string[],
  projects: string[],
  orgs: string[],
  domains: string[],
  concepts: string[],
  totalSignals: number
): string {
  const formatList = (items: string[], dir: string) =>
    items.map(n => `- [[${dir}/${slug(n)}]] — ${n}`).join('\n');

  return `# Lakshveer Rao — Personal Knowledge Wiki
*Agent entry point. Start here.*

## About
This wiki is compiled by an LLM from raw signal data about Lakshveer Rao.
It is built for agents to navigate, not for humans to read.
Source of truth: \`signals.json\` (${totalSignals} signals as of ${COMPILED_AT})

## How to Navigate
1. Read this index
2. Follow backlinks into specific article directories
3. Meta articles in /meta/ provide compiled analysis

## People
${formatList(people, 'people')}

## Projects
${formatList(projects, 'projects')}

## Organizations
${formatList(orgs, 'orgs')}

## Domains
${formatList(domains, 'domains')}

## Concepts (Emergent Patterns)
${formatList(concepts, 'concepts')}

## Meta Articles
- [[meta/narrative]] — Full compiled narrative + timeline
- [[meta/gaps]] — Information gaps, health check
- [[meta/connections]] — Non-obvious entity connections

## Stats
- Total signals: ${totalSignals}
- Last compiled: ${COMPILED_AT}
- Articles: ${people.length + projects.length + orgs.length + domains.length + concepts.length + 3}

---
*This wiki is LLM-owned. Do not edit manually.*
*To update: add signals to signals.json, then run \`bun scripts/compile-wiki.ts\`*`;
}

// ============================================
// MAIN COMPILE LOOP
// ============================================

async function main() {
  console.log(`\n🧠 Wiki Compiler — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`📦 ${signals.length} signals loaded\n`);

  const { people, projects, orgs, domains } = extractEntities(signals as any[]);

  console.log(`Entities found:`);
  console.log(`  People: ${people.join(', ')}`);
  console.log(`  Projects: ${projects.join(', ')}`);
  console.log(`  Orgs: ${orgs.join(', ')}`);
  console.log(`  Domains: ${domains.join(', ')}\n`);

  // Helper: find signals related to a search term
  const relatedSignals = (term: string) =>
    (signals as any[]).filter(
      s =>
        s.entities?.some((e: string) => e.toLowerCase().includes(term.toLowerCase())) ||
        s.organizations?.some((o: string) => o.toLowerCase().includes(term.toLowerCase())) ||
        s.domains?.some((d: string) => d.toLowerCase().includes(term.toLowerCase())) ||
        s.title?.toLowerCase().includes(term.toLowerCase()) ||
        s.rawText?.toLowerCase().includes(term.toLowerCase())
    );

  // -- People --
  console.log('📝 Compiling people articles...');
  for (const person of people) {
    const rel = relatedSignals(person);
    const content = await compilePerson(person, rel);
    writeWiki(`people/${slug(person)}.md`, content);
  }

  // -- Projects --
  console.log('\n📝 Compiling project articles...');
  for (const project of projects) {
    const rel = relatedSignals(project);
    const content = await compileProject(project, rel);
    writeWiki(`projects/${slug(project)}.md`, content);
  }

  // -- Orgs --
  console.log('\n📝 Compiling org articles...');
  for (const org of orgs) {
    const rel = relatedSignals(org);
    const content = await compileOrg(org, rel);
    writeWiki(`orgs/${slug(org)}.md`, content);
  }

  // -- Domains --
  console.log('\n📝 Compiling domain articles...');
  for (const domain of domains) {
    const rel = relatedSignals(domain);
    const content = await compileDomain(domain, rel);
    writeWiki(`domains/${slug(domain)}.md`, content);
  }

  // -- Concepts (emergent) --
  console.log('\n🔍 Identifying emergent concepts...');
  const conceptNames = await compileConcepts(signals as any[]);
  console.log(`  Found: ${conceptNames.join(', ')}`);

  // -- Meta articles --
  console.log('\n📊 Compiling meta articles...');

  const narrative = await compileNarrative(signals as any[]);
  writeWiki('meta/narrative.md', narrative);

  const gaps = await compileGaps(signals as any[]);
  writeWiki('meta/gaps.md', gaps);

  const connections = await compileConnections(signals as any[]);
  writeWiki('meta/connections.md', connections);

  // -- Index --
  console.log('\n📋 Building index...');
  const indexContent = buildIndex(people, projects, orgs, domains, conceptNames, signals.length);
  writeWiki('index.md', indexContent);

  console.log(`\n✅ Wiki compiled — ${DRY_RUN ? 'DRY RUN complete' : `written to public/wiki/`}`);
  console.log(`   ${people.length} people + ${projects.length} projects + ${orgs.length} orgs + ${domains.length} domains + ${conceptNames.length} concepts + 3 meta`);
}

main().catch(err => {
  console.error('Compiler error:', err);
  process.exit(1);
});
