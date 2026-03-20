// ============================================
// MENTION AGENT API ROUTE
// POST /api/mentions/scan — trigger a full mention scan
// GET  /api/mentions/scan — stream a scan (SSE)
// ============================================

import { Hono } from "hono";
import { createAgentUIStreamResponse } from "ai";
import { createMentionAgent, getMentionScanPrompt } from "../agent/mention-agent";
import { MENTION_QUERIES } from "../agent/mention-tools";

interface Env {
  AI_GATEWAY_BASE_URL: string;
  AI_GATEWAY_API_KEY: string;
  DB: D1Database;
}

export const mentionRoutes = new Hono<{ Bindings: Env }>();

// POST /api/mentions/scan — start a mention scan (streaming)
mentionRoutes.post("/scan", async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const customPrompt = body.prompt || getMentionScanPrompt();
  const messages = body.messages || [{ role: "user", content: customPrompt }];

  const agent = createMentionAgent({
    AI_GATEWAY_BASE_URL: c.env.AI_GATEWAY_BASE_URL,
    AI_GATEWAY_API_KEY: c.env.AI_GATEWAY_API_KEY,
  });

  return createAgentUIStreamResponse({ agent, messages });
});

// GET /api/mentions/queries — return the default search queries
mentionRoutes.get("/queries", (c) => {
  return c.json({ queries: MENTION_QUERIES });
});
