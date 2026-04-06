// ============================================
// WIKI API ROUTES — v3 (graph-native)
// POST /api/wiki/query
// GET  /api/wiki/graph
// GET  /api/wiki/node/:id
// ============================================
//
// Query pipeline (graphify-inspired):
//   1. Load graph.json
//   2. BFS from question keywords → find relevant node ids
//   3. Read wiki files for those nodes
//   4. LLM answers with that grounded context
//
// Replaces "LLM picks files" with deterministic graph traversal.
// Same answer quality, fewer tokens, more reliable file selection.
// ============================================

import { Hono } from 'hono';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

interface Env {
  AI_GATEWAY_BASE_URL: string;
  AI_GATEWAY_API_KEY: string;
  ASSETS: Fetcher;
}

export const wikiRoutes = new Hono<{ Bindings: Env }>();

// ---- Types (mirror compile-wiki.ts) ----
interface GraphNode {
  id: string;
  label: string;
  type: string;
  wikiPath?: string;
  signalIds: string[];
  degree?: number;
  community?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  confidence: 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS';
  signalId?: string;
}

interface GraphCommunity {
  id: number;
  nodeIds: string[];
  size: number;
}

interface Graph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  communities?: GraphCommunity[];
  meta: {
    compiledAt: string;
    totalSignals: number;
    godNodes: string[];
    communities: number;
  };
}

// ---- Fetch a file via ASSETS ----
async function fetchWikiFile(path: string, env: Env, requestUrl: string): Promise<string | null> {
  try {
    const base = new URL(requestUrl);
    const url = `${base.protocol}//${base.host}/wiki/${path}`;
    const res = await env.ASSETS.fetch(new Request(url));
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

// ---- Load graph.json ----
async function loadGraph(env: Env, requestUrl: string): Promise<Graph | null> {
  const raw = await fetchWikiFile('graph.json', env, requestUrl);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Graph;
  } catch {
    return null;
  }
}

// ---- Slug a string (must match compile-wiki.ts) ----
function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// ---- BFS traversal ----
// Given seed node ids, expand outward up to `depth` hops.
// Returns ordered list of node ids by proximity + degree.
function bfsNodes(
  graph: Graph,
  seedIds: string[],
  depth: number = 2,
  maxNodes: number = 12
): string[] {
  const adjacency = new Map<string, Array<{ id: string; confidence: string }>>();

  for (const edge of graph.edges) {
    if (!adjacency.has(edge.source)) adjacency.set(edge.source, []);
    if (!adjacency.has(edge.target)) adjacency.set(edge.target, []);
    adjacency.get(edge.source)!.push({ id: edge.target, confidence: edge.confidence });
    adjacency.get(edge.target)!.push({ id: edge.source, confidence: edge.confidence });
  }

  const visited = new Set<string>();
  const result: Array<{ id: string; score: number }> = [];
  let frontier = seedIds.filter(id => graph.nodes.some(n => n.id === id));

  // Seed nodes get highest score
  for (const id of frontier) {
    visited.add(id);
    const node = graph.nodes.find(n => n.id === id);
    result.push({ id, score: 100 + (node?.degree ?? 0) });
  }

  for (let d = 0; d < depth; d++) {
    const next: string[] = [];
    for (const nodeId of frontier) {
      const neighbors = adjacency.get(nodeId) ?? [];
      // EXTRACTED edges rank higher than INFERRED
      const sorted = neighbors.sort((a, b) => {
        const confScore = (c: string) => c === 'EXTRACTED' ? 2 : c === 'INFERRED' ? 1 : 0;
        return confScore(b.confidence) - confScore(a.confidence);
      });
      for (const { id: neighborId, confidence } of sorted) {
        if (visited.has(neighborId)) continue;
        visited.add(neighborId);
        next.push(neighborId);
        const node = graph.nodes.find(n => n.id === neighborId);
        // Score: closer = higher, EXTRACTED = higher, high-degree = higher
        const distPenalty = (d + 1) * 10;
        const confBonus = confidence === 'EXTRACTED' ? 5 : confidence === 'INFERRED' ? 2 : 0;
        const degreeBonus = Math.min(node?.degree ?? 0, 20);
        result.push({ id: neighborId, score: 90 - distPenalty + confBonus + degreeBonus });
      }
    }
    frontier = next;
    if (result.length >= maxNodes) break;
  }

  return result
    .sort((a, b) => b.score - a.score)
    .slice(0, maxNodes)
    .map(r => r.id);
}

// ---- Match question to seed nodes ----
function findSeedNodes(question: string, graph: Graph): string[] {
  const q = question.toLowerCase();
  const seeds: Array<{ id: string; score: number }> = [];

  // Always include lakshveer as a seed
  seeds.push({ id: 'lakshveer', score: 50 });

  for (const node of graph.nodes) {
    const label = node.label.toLowerCase();
    const id = node.id.toLowerCase();

    let score = 0;
    // Exact label match
    if (q.includes(label)) score += 100;
    // Partial label match
    else if (label.split(' ').some(word => word.length > 3 && q.includes(word))) score += 50;
    // ID match
    else if (q.includes(id.replace(/-/g, ' '))) score += 40;
    // Signal ID mentioned in question
    else if (node.signalIds?.some(sid => q.includes(sid))) score += 80;

    // Boost god nodes
    if (graph.meta.godNodes.includes(node.id)) score += 10;

    // Boost meta terms
    if (q.includes('grant') && ['funding', 'malpani-foundation', 'ai-grants-india'].includes(node.id)) score += 30;
    if (q.includes('award') && ['recognition', 'param-foundation', 'achievement'].includes(node.id)) score += 30;
    if ((q.includes('product') || q.includes('built') || q.includes('build')) &&
        node.type === 'project') score += 30;
    if ((q.includes('press') || q.includes('media') || q.includes('article')) &&
        node.id === 'media') score += 30;
    if ((q.includes('who') || q.includes('person') || q.includes('endorser')) &&
        node.type === 'person') score += 20;
    if ((q.includes('isro') || q.includes('iit') || q.includes('shark tank') || q.includes('residency')) &&
        node.type === 'org') score += 20;

    if (score > 0) seeds.push({ id: node.id, score });
  }

  // Return top 4 seeds
  return seeds
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(s => s.id);
}

// ============================================
// POST /api/wiki/query
// ============================================
wikiRoutes.post('/query', async (c) => {
  const { question } = await c.req.json().catch(() => ({ question: '' }));
  if (!question?.trim()) return c.json({ error: 'question required' }, 400);

  const openai = createOpenAI({
    baseURL: c.env.AI_GATEWAY_BASE_URL,
    apiKey: c.env.AI_GATEWAY_API_KEY,
  });

  const reqUrl = c.req.url;

  // ---- Step 1: Load graph ----
  const graph = await loadGraph(c.env, reqUrl);

  // ---- Step 2: Find relevant files ----
  let filePaths: string[] = [];

  if (graph) {
    // Graph-native: BFS from seed nodes
    const seeds = findSeedNodes(question, graph);
    const relevantIds = bfsNodes(graph, seeds, 2, 10);

    // Map node ids → wiki file paths
    filePaths = relevantIds
      .map(id => graph.nodes.find(n => n.id === id)?.wikiPath)
      .filter((p): p is string => !!p);

    // Deduplicate file paths (BFS can return same path via multiple nodes)
    filePaths = [...new Set(filePaths)];

    // Always include narrative for context
    if (!filePaths.includes('meta/narrative.md')) {
      filePaths.unshift('meta/narrative.md');
    }
    filePaths = filePaths.slice(0, 8);
  } else {
    // Fallback: read index and ask LLM to pick files
    const indexContent = await fetchWikiFile('index.md', c.env, reqUrl);
    if (!indexContent) {
      return c.json({ error: 'Wiki not compiled. Run: bun run wiki:compile' }, 404);
    }
    const { text: filesRaw } = await generateText({
      model: openai.chat('anthropic/claude-haiku-4-5'),
      system: 'You are navigating a markdown wiki. Return only a JSON array of file paths to read. Max 8 files.',
      prompt: `Query: "${question}"\n\nWiki index:\n${indexContent}\n\nReturn JSON array.`,
      maxTokens: 300,
    });
    try {
      filePaths = JSON.parse(filesRaw.replace(/```json\n?|```\n?/g, '').trim());
    } catch {
      filePaths = ['meta/narrative.md'];
    }
  }

  // ---- Step 3: Read files ----
  const fileContents: string[] = [];
  for (const fp of filePaths.slice(0, 8)) {
    const content = await fetchWikiFile(fp, c.env, reqUrl);
    if (content) fileContents.push(`\n---\n## FILE: ${fp}\n${content}`);
  }

  if (fileContents.length === 0) {
    return c.json({ error: 'No wiki content found. Run: bun run wiki:compile' }, 404);
  }

  // ---- Step 4: Answer ----
  const { text: answer } = await generateText({
    model: openai.chat('anthropic/claude-sonnet-4-5'),
    system: `You answer questions about Lakshveer Rao using his personal knowledge wiki.
Be factual, dense, cite signal IDs when relevant [[sig-xxx]]. Format as clean markdown.
Only state what the wiki sources say — never hallucinate beyond them.`,
    prompt: `Query: "${question}"\n\nWiki articles:\n${fileContents.join('\n')}`,
    maxTokens: 2000,
  });

  return c.json({
    answer,
    filesRead: filePaths,
    traversal: graph ? 'graph-bfs' : 'llm-fallback',
    compiledAt: graph?.meta.compiledAt ?? '',
  });
});

// ============================================
// GET /api/wiki/graph
// Returns the full graph.json for visualization
// ============================================
wikiRoutes.get('/graph', async (c) => {
  const raw = await fetchWikiFile('graph.json', c.env, c.req.url);
  if (!raw) return c.json({ error: 'Graph not compiled' }, 404);
  try {
    return c.json(JSON.parse(raw));
  } catch {
    return c.json({ error: 'Graph parse failed' }, 500);
  }
});

// ============================================
// GET /api/wiki/node/:id
// Returns a single node's wiki article + graph neighbors
// ============================================
wikiRoutes.get('/node/:id', async (c) => {
  const id = c.req.param('id');
  const graph = await loadGraph(c.env, c.req.url);
  if (!graph) return c.json({ error: 'Graph not compiled' }, 404);

  const node = graph.nodes.find(n => n.id === id);
  if (!node) return c.json({ error: `Node "${id}" not found` }, 404);

  const article = node.wikiPath
    ? await fetchWikiFile(node.wikiPath, c.env, c.req.url)
    : null;

  const neighbors = graph.edges
    .filter(e => e.source === id || e.target === id)
    .map(e => ({
      id: e.source === id ? e.target : e.source,
      relation: e.relation,
      confidence: e.confidence,
      direction: e.source === id ? 'out' : 'in',
    }))
    .map(n => ({
      ...n,
      label: graph.nodes.find(gn => gn.id === n.id)?.label ?? n.id,
      type: graph.nodes.find(gn => gn.id === n.id)?.type ?? 'unknown',
    }));

  return c.json({ node, article, neighbors });
});
