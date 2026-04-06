// ============================================
// SIGNAL INGEST ROUTE
// POST /api/signals/ingest
// ============================================
// Paste a URL (tweet, article, YouTube, Instagram) →
// worker scrapes it → LLM extracts signal metadata →
// appends to signals.json KV store →
// triggers wiki recompile via Cloudflare Queue (or inline)
//
// In production: signals are stored in KV, not on disk.
// The compiler reads KV (or the bundled signals.json).
// For now: returns extracted signal JSON for manual review.
// ============================================

import { Hono } from 'hono';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

interface Env {
  AI_GATEWAY_BASE_URL: string;
  AI_GATEWAY_API_KEY: string;
  ASSETS: Fetcher;
  SIGNALS_KV?: KVNamespace; // optional, for persistent storage
}

export const ingestRoutes = new Hono<{ Bindings: Env }>();

// ---- Scrape a URL (best-effort in CF worker) ----
async function scrapeUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return '';
    const html = await res.text();
    // Strip HTML tags, keep text
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{3,}/g, '\n')
      .slice(0, 4000);
  } catch {
    return '';
  }
}

// ---- Detect source type from URL ----
function detectSource(url: string): string {
  if (url.includes('x.com') || url.includes('twitter.com')) return 'tweet';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('linkedin.com')) return 'linkedin';
  if (url.includes('medium.com') || url.includes('substack.com')) return 'article';
  if (url.includes('github.com')) return 'github';
  return 'article';
}

// ---- Detect surface from URL ----
function detectSurface(url: string): string {
  if (url.includes('x.com') || url.includes('twitter.com')) return 'social';
  if (url.includes('youtube.com')) return 'youtube';
  if (url.includes('instagram.com')) return 'social';
  if (url.includes('linkedin.com')) return 'social';
  if (url.includes('github.com')) return 'project';
  return 'press';
}

// ---- POST /api/signals/ingest ----
// Body: { url: string, notes?: string }
// Returns: extracted signal JSON
ingestRoutes.post('/ingest', async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { url, notes } = body as { url?: string; notes?: string };

  if (!url?.trim()) {
    return c.json({ error: 'url required' }, 400);
  }

  const openai = createOpenAI({
    baseURL: c.env.AI_GATEWAY_BASE_URL,
    apiKey: c.env.AI_GATEWAY_API_KEY,
  });

  // Step 1: Scrape
  const pageText = await scrapeUrl(url);
  const source = detectSource(url);
  const surface = detectSurface(url);
  const today = new Date().toISOString().slice(0, 7); // YYYY-MM

  // Step 2: LLM extract signal
  const { text: raw } = await generateText({
    model: openai.chat('anthropic/claude-haiku-4-5'),
    system: `You extract signal metadata about Lakshveer Rao (8-year-old hardware startup founder, Hyderabad, India) from web content.
Return ONLY valid JSON — no markdown, no explanation.

Signal schema:
{
  "id": "sig-[kebab-case-unique-id]",
  "source": "${source}",
  "url": "${url}",
  "title": "short title",
  "date": "YYYY-MM",
  "entities": ["person", "org", "product"],
  "domains": ["one of: brand, electronics, robotics, ai-agents, entrepreneurship, education, media, recognition, funding, space, computer-vision, machine-learning, social-impact, regional, hardware, content, teaching, public-speaking, achievement"],
  "organizations": ["org names"],
  "rawText": "1-2 sentence factual summary of what this signal proves about Lakshveer",
  "confidence": "high|medium|low",
  "surface": "${surface}"
}`,
    prompt: `URL: ${url}
Source type: ${source}
${notes ? `Notes from submitter: ${notes}` : ''}
${pageText ? `\nPage content:\n${pageText}` : '\n(Could not scrape page — infer from URL)'}

Extract the signal. If this is clearly NOT about Lakshveer Rao, return {"error": "not about Lakshveer"}.`,
    maxTokens: 600,
  });

  // Parse
  let signal: Record<string, unknown>;
  try {
    signal = JSON.parse(raw.replace(/```json\n?|```\n?/g, '').trim());
  } catch {
    return c.json({ error: 'LLM returned invalid JSON', raw }, 500);
  }

  if (signal.error) {
    return c.json({ error: signal.error as string }, 422);
  }

  // Step 3: Store in KV if available
  if (c.env.SIGNALS_KV) {
    const key = `signal:${signal.id}`;
    await c.env.SIGNALS_KV.put(key, JSON.stringify(signal));
  }

  return c.json({
    success: true,
    signal,
    message: 'Signal extracted. Add to src/raw/signals.json and run: bun run wiki:compile',
    note: c.env.SIGNALS_KV ? 'Also stored in KV.' : 'KV not configured — manual add required.',
  });
});

// ---- GET /api/signals/list ----
// Returns all signals from KV (if configured)
ingestRoutes.get('/list', async (c) => {
  if (!c.env.SIGNALS_KV) {
    return c.json({ error: 'KV not configured' }, 404);
  }
  const list = await c.env.SIGNALS_KV.list({ prefix: 'signal:' });
  const signals = await Promise.all(
    list.keys.map(async (k) => {
      const val = await c.env.SIGNALS_KV!.get(k.name);
      return val ? JSON.parse(val) : null;
    })
  );
  return c.json({ signals: signals.filter(Boolean), total: signals.length });
});
