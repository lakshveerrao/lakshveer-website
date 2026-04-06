// ============================================
// WIKI API ROUTES
// POST /api/wiki/query — agent queries the wiki
// ============================================
// The wiki lives in public/wiki/ as LLM-compiled markdown.
// This route reads those files and runs the same agent logic
// as scripts/query-wiki.ts — but from the browser.
//
// Pattern: index.md → agent picks relevant files → reads + answers
// ============================================

import { Hono } from 'hono';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

interface Env {
  AI_GATEWAY_BASE_URL: string;
  AI_GATEWAY_API_KEY: string;
  ASSETS: { fetch: (req: Request) => Promise<Response> };
}

export const wikiRoutes = new Hono<{ Bindings: Env }>();

// ---- Read a wiki file from static assets ----
async function readWikiFile(path: string, env: Env): Promise<string | null> {
  try {
    const url = new URL(`https://placeholder/wiki/${path}`);
    const req = new Request(url.toString());
    const res = await env.ASSETS.fetch(req);
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ---- POST /api/wiki/query ----
wikiRoutes.post('/query', async (c) => {
  const { question } = await c.req.json().catch(() => ({ question: '' }));
  if (!question?.trim()) {
    return c.json({ error: 'question required' }, 400);
  }

  const openai = createOpenAI({
    baseURL: c.env.AI_GATEWAY_BASE_URL,
    apiKey: c.env.AI_GATEWAY_API_KEY,
  });

  // Step 1: Read index
  const indexContent = await readWikiFile('index.md', c.env);
  if (!indexContent) {
    return c.json({ error: 'Wiki not compiled. Run: bun run wiki:compile' }, 404);
  }

  // Step 2: Agent picks relevant files
  const { text: filesRaw } = await generateText({
    model: openai.chat('anthropic/claude-haiku-4-5'),
    system: 'You are navigating a markdown wiki. Return only a JSON array of file paths to read. Max 8 files.',
    prompt: `Query: "${question}"\n\nWiki index:\n${indexContent}\n\nWhich files should I read? Return JSON array of paths like ["meta/narrative.md", "projects/circuitheroes.md"]`,
    maxTokens: 300,
  });

  let filePaths: string[] = ['meta/narrative.md'];
  try {
    filePaths = JSON.parse(filesRaw.replace(/```json\n?|```\n?/g, '').trim());
  } catch {
    filePaths = ['meta/narrative.md', 'meta/connections.md'];
  }

  // Step 3: Read files
  const fileContents: string[] = [];
  for (const fp of filePaths.slice(0, 8)) {
    const content = await readWikiFile(fp, c.env);
    if (content) fileContents.push(`\n---\n## FILE: ${fp}\n${content}`);
  }

  // Step 4: Answer
  const { text: answer } = await generateText({
    model: openai.chat('anthropic/claude-sonnet-4-5'),
    system: `You answer questions about Lakshveer Rao using his personal knowledge wiki.
Be factual, dense, cite signal IDs when relevant. Format as clean markdown.`,
    prompt: `Query: "${question}"\n\nWiki articles:\n${fileContents.join('\n')}`,
    maxTokens: 2000,
  });

  return c.json({
    answer,
    filesRead: filePaths,
    compiledAt: indexContent.match(/Compiled:\s*([^\n]+)/)?.[1]?.trim() ?? '',
  });
});
