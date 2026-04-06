#!/usr/bin/env bun
// ============================================
// WIKI QUERY — v1.0
// ============================================
// Agent reads index.md → drills into articles → answers
// Outputs filed back into wiki/queries/
//
// Usage:
//   bun scripts/query-wiki.ts "What is Lakshveer's strongest domain?"
//   bun scripts/query-wiki.ts "Who are the key people in his story?"
//   bun scripts/query-wiki.ts --no-save "Quick question"
// ============================================

import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const WIKI_ROOT = join(import.meta.dir, '..', 'public', 'wiki');
const SAVE = !process.argv.includes('--no-save');
const QUERY = process.argv.slice(2).filter(a => !a.startsWith('--')).join(' ');

if (!QUERY) {
  console.error('Usage: bun scripts/query-wiki.ts "your question"');
  process.exit(1);
}

const openai = createOpenAI({
  baseURL: process.env.AI_GATEWAY_BASE_URL ?? 'https://api.openai.com/v1',
  apiKey: process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY ?? '',
});

// ---- Read wiki files ----
function readWikiFile(relativePath: string): string | null {
  const fullPath = join(WIKI_ROOT, relativePath);
  if (!existsSync(fullPath)) return null;
  return readFileSync(fullPath, 'utf-8');
}

function listWikiDir(relativeDir: string): string[] {
  const fullPath = join(WIKI_ROOT, relativeDir);
  if (!existsSync(fullPath)) return [];
  return readdirSync(fullPath).filter(f => f.endsWith('.md'));
}

// ---- Agent: reads index, decides which files to pull ----
async function agentNavigate(query: string): Promise<string[]> {
  const index = readWikiFile('index.md');
  if (!index) {
    console.error('Wiki not compiled yet. Run: bun scripts/compile-wiki.ts');
    process.exit(1);
  }

  const { text } = await generateText({
    model: openai.chat('anthropic/claude-sonnet-4-5'),
    system: `You are a research agent navigating a personal knowledge wiki about Lakshveer Rao.
You have access to a filesystem-structured wiki. Your job is to identify which wiki files are relevant to answer a query.
Return ONLY a JSON array of file paths relative to the wiki root (e.g. ["people/s-somanath.md", "projects/circuitheroes.md"])
Return only valid JSON, nothing else.`,
    prompt: `Query: "${query}"

Wiki index:
${index}

Based on the query and the index, which wiki files should I read to answer this well?
Include meta files if the query is broad. Include specific article files if the query is targeted.
Return up to 8 most relevant file paths as a JSON array.`,
  });

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Fallback: read narrative + index
    return ['meta/narrative.md', 'meta/connections.md'];
  }
}

// ---- Agent: reads files, answers query ----
async function agentAnswer(query: string, filePaths: string[]): Promise<string> {
  const fileContents: string[] = [];

  for (const fp of filePaths) {
    const content = readWikiFile(fp);
    if (content) {
      fileContents.push(`\n\n---\n## FILE: ${fp}\n${content}`);
    }
  }

  const { text } = await generateText({
    model: openai.chat('anthropic/claude-sonnet-4-5'),
    system: `You are answering questions about Lakshveer Rao using his personal knowledge wiki.
Be factual, dense, and cite signal IDs when relevant.
Format your response as clean markdown.
Start with a direct answer, then provide supporting evidence from the wiki.`,
    prompt: `Query: "${query}"

Wiki articles read:
${fileContents.join('\n')}

Answer the query. Be specific and cite evidence from the wiki articles.
Format as markdown with clear sections.`,
    maxTokens: 2000,
  });

  return text.trim();
}

// ---- Slug for filename ----
function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50);
}

// ---- Main ----
async function main() {
  console.log(`\n🔍 Query: "${QUERY}"\n`);

  // Step 1: Agent navigates to relevant files
  process.stdout.write('🗂  Navigating wiki... ');
  const filePaths = await agentNavigate(QUERY);
  console.log(`Reading ${filePaths.length} articles: ${filePaths.join(', ')}`);

  // Step 2: Agent reads and answers
  process.stdout.write('🧠 Thinking... ');
  const answer = await agentAnswer(QUERY, filePaths);
  console.log('done\n');

  // Output
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const querySlug = slugify(QUERY);
  const outputFilename = `${timestamp}-${querySlug}.md`;

  const fullOutput = `# Query: ${QUERY}
*Filed: ${new Date().toISOString()}*
*Articles read: ${filePaths.join(', ')}*

---

${answer}

---
*This query output is part of the wiki. It enriches future queries.*`;

  // Save to wiki/queries/
  if (SAVE) {
    const queriesDir = join(WIKI_ROOT, 'queries');
    mkdirSync(queriesDir, { recursive: true });
    writeFileSync(join(queriesDir, outputFilename), fullOutput, 'utf-8');
    console.log(`\n📁 Filed to: wiki/queries/${outputFilename}`);
  }

  // Print to stdout
  console.log('\n' + '='.repeat(60));
  console.log(answer);
  console.log('='.repeat(60) + '\n');
}

main().catch(err => {
  console.error('Query error:', err);
  process.exit(1);
});
