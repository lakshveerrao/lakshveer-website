#!/usr/bin/env bun
// ============================================
// WIKI COMPILER — v2.0 (parallel)
// ============================================
// Reads raw/signals.json → LLM compiles →
// filesystem wiki in public/wiki/
//
// Pattern: Karpathy (raw/ → wiki/) + Farza (built for agents)
// Input:  src/raw/signals.json  ← human edits here only
// Output: public/wiki/          ← LLM owns this entirely
//
// Usage:
//   bun scripts/compile-wiki.ts           # full compile
//   bun scripts/compile-wiki.ts --dry-run # preview, no writes
// ============================================

import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
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

async function llm(prompt: string, system: string): Promise<string> {
  const { text } = await generateText({
    model: openai.chat('anthropic/claude-sonnet-4-5'),
    system,
    prompt,
    maxTokens: 2000,
  });
  return text.trim();
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

// ---- System prompt ----
const SYSTEM = `You are compiling a personal knowledge wiki about Lakshveer Rao — a 16-year-old Indian maker and entrepreneur from Hyderabad.

This wiki is built FOR AGENTS to read, not humans. Dense, factual, structured markdown.
Rules:
- ## Summary — 2-3 sentences max
- ## Signals — cite signal IDs as backlinks  
- ## Related Articles — [[path]] style links
- Facts only. No marketing. No fluff.
- Dates matter. Signal IDs are source of truth.`;

// ---- Entity extraction ----
function extractEntities(sigs: any[]) {
  const projects = new Set<string>();
  const orgs = new Set<string>();
  const domains = new Set<string>();
  const people = new Set<string>();

  const PROJECT_KEYWORDS = ['CircuitHeroes', 'Drishtikon Yantra', 'Drishtikon', 'MotionX', 'Beats in Brief', 'StartupPedia'];

  for (const s of sigs) {
    for (const o of s.organizations ?? []) if (o?.trim()) orgs.add(o.trim());
    for (const d of s.domains ?? []) if (d?.trim()) domains.add(d.trim());
    for (const kw of PROJECT_KEYWORDS) {
      if ((s.title + s.rawText).includes(kw)) projects.add(kw);
    }
    for (const e of s.entities ?? []) {
      if (['S. Somanath'].some(p => e.includes(p))) people.add(e);
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

// ---- Article generators ----
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

// ---- Parallel compile ----
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

// ---- Main ----
async function main() {
  console.log(`\n🧠 Wiki Compiler v2 — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  console.log(`📦 ${signals.length} signals | ⚡ parallel compilation\n`);

  const { people, projects, orgs, domains } = extractEntities(signals as any[]);

  console.log(`Entities: ${people.length} people, ${projects.length} projects, ${orgs.length} orgs, ${domains.length} domains\n`);

  const t0 = Date.now();

  // ---- Parallel: people + projects + orgs + domains ----
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

  // ---- Concepts (emergent — needs all signals, sequential) ----
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

  // ---- Meta articles (parallel) ----
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
  ]);

  // ---- Index ----
  console.log('\n📋 Building index...');

  const indexContent = `# Lakshveer Rao — Personal Knowledge Wiki
*Agent entry point. Start here.*

## About
This wiki is LLM-compiled from \`src/raw/signals.json\`.
Built for agents to navigate — not for humans to read.
Human adds to raw/. LLM owns wiki/. Never the other way around.

Source: \`signals.json\` — ${signals.length} signals — compiled ${COMPILED_AT}

## How to Navigate
1. Read this index
2. Follow [[backlinks]] into article directories
3. /meta/ articles have compiled analysis

## People
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
- Articles: ${people.length + projects.length + orgs.length + domains.length + concepts.length + 3}
- Compiled: ${COMPILED_AT}

---
*LLM-owned. Do not edit manually.*
*Update: edit \`src/raw/signals.json\` → \`bun run wiki:compile\`*
*Query: \`bun run wiki:query "your question"\`*`;

  writeWiki('index.md', indexContent);

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  const total = people.length + projects.length + orgs.length + domains.length + concepts.length + 3;
  console.log(`\n✅ Done in ${elapsed}s — ${total} articles written to public/wiki/`);
}

main().catch(e => { console.error(e); process.exit(1); });
