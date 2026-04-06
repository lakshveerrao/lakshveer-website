#!/usr/bin/env bun
// ============================================
// WIKI HEALTH CHECK — v1.0
// ============================================
// Scans wiki for inconsistencies, missing backlinks,
// orphaned articles, and suggests enhancements.
//
// Usage:
//   bun scripts/health-wiki.ts
// ============================================

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

const WIKI_ROOT = join(import.meta.dir, '..', 'public', 'wiki');

const openai = createOpenAI({
  baseURL: process.env.AI_GATEWAY_BASE_URL ?? 'https://api.openai.com/v1',
  apiKey: process.env.AI_GATEWAY_API_KEY ?? process.env.OPENAI_API_KEY ?? '',
});

function getAllWikiFiles(): { path: string; content: string }[] {
  const files: { path: string; content: string }[] = [];
  const walk = (dir: string, prefix: string) => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        walk(join(dir, entry.name), `${prefix}${entry.name}/`);
      } else if (entry.name.endsWith('.md') && !entry.name.startsWith('2')) {
        // skip query files (dated)
        const content = readFileSync(join(dir, entry.name), 'utf-8');
        files.push({ path: `${prefix}${entry.name}`, content });
      }
    }
  };
  walk(WIKI_ROOT, '');
  return files;
}

function checkBacklinks(files: { path: string; content: string }[]): string[] {
  const issues: string[] = [];
  const allPaths = new Set(files.map(f => f.path));

  for (const file of files) {
    const links = [...file.content.matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1]);
    for (const link of links) {
      const linkedPath = link.endsWith('.md') ? link : `${link}.md`;
      if (!allPaths.has(linkedPath)) {
        issues.push(`Broken backlink in ${file.path}: [[${link}]] → file not found`);
      }
    }
  }
  return issues;
}

function checkOrphans(files: { path: string; content: string }[]): string[] {
  const linked = new Set<string>();
  for (const file of files) {
    const links = [...file.content.matchAll(/\[\[([^\]]+)\]\]/g)].map(m => m[1]);
    for (const link of links) {
      linked.add(link.endsWith('.md') ? link : `${link}.md`);
    }
  }

  const orphans: string[] = [];
  for (const file of files) {
    if (file.path !== 'index.md' && !linked.has(file.path)) {
      orphans.push(`Orphaned article: ${file.path} — not linked from anywhere`);
    }
  }
  return orphans;
}

async function llmHealthCheck(files: { path: string; content: string }[]): Promise<string> {
  const fileList = files.map(f => `${f.path}: ${f.content.slice(0, 200).replace(/\n/g, ' ')}...`).join('\n');

  const { text } = await generateText({
    model: openai.chat('anthropic/claude-sonnet-4-5'),
    system: `You are a wiki quality analyst. Find problems and suggest improvements. Be specific and actionable.`,
    prompt: `Analyze this personal wiki about Lakshveer Rao for quality issues.

Articles in wiki:
${fileList}

Identify:
1. Articles that seem incomplete or too thin
2. Important topics that should have articles but don't
3. Data inconsistencies across articles
4. Suggested new queries to run to enhance the wiki

Format as clean markdown with sections.`,
    maxTokens: 1500,
  });

  return text.trim();
}

async function main() {
  console.log('\n🏥 Wiki Health Check\n');

  const files = getAllWikiFiles();
  if (files.length === 0) {
    console.error('Wiki is empty. Run: bun scripts/compile-wiki.ts');
    process.exit(1);
  }

  console.log(`📚 Found ${files.length} articles\n`);

  // Structural checks
  const backlinkIssues = checkBacklinks(files);
  const orphans = checkOrphans(files);

  if (backlinkIssues.length > 0) {
    console.log('🔗 Backlink Issues:');
    backlinkIssues.forEach(i => console.log(`  ${i}`));
  } else {
    console.log('✓ All backlinks valid');
  }

  if (orphans.length > 0) {
    console.log('\n👻 Orphaned Articles:');
    orphans.forEach(i => console.log(`  ${i}`));
  } else {
    console.log('✓ No orphaned articles');
  }

  // LLM health analysis
  console.log('\n🧠 Running LLM analysis...');
  const llmAnalysis = await llmHealthCheck(files);

  const report = `# Wiki Health Report
*Generated: ${new Date().toISOString()}*

## Structural Issues

### Broken Backlinks (${backlinkIssues.length})
${backlinkIssues.length ? backlinkIssues.map(i => `- ${i}`).join('\n') : '- None found ✓'}

### Orphaned Articles (${orphans.length})
${orphans.length ? orphans.map(i => `- ${i}`).join('\n') : '- None found ✓'}

## LLM Quality Analysis

${llmAnalysis}
`;

  // Save report
  const reportPath = join(WIKI_ROOT, 'meta', 'health-report.md');
  writeFileSync(reportPath, report, 'utf-8');

  console.log('\n' + '='.repeat(60));
  console.log(llmAnalysis);
  console.log('='.repeat(60));
  console.log(`\n📁 Report saved to: meta/health-report.md`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
