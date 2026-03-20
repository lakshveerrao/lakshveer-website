// ============================================
// MENTION FETCHER AGENT — Universe v8
// Searches web, YouTube, Reddit for Lakshveer mentions
// Returns structured results ready to ingest as signals
// ============================================

import { stepCountIs, type SystemModelMessage, ToolLoopAgent } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { searchWeb, searchYouTube, searchReddit, fetchYouTubeChannel, ingestMention, MENTION_QUERIES } from "./mention-tools";

export function createMentionAgent(env: { AI_GATEWAY_BASE_URL: string; AI_GATEWAY_API_KEY: string }) {
  const openai = createOpenAI({
    baseURL: env.AI_GATEWAY_BASE_URL,
    apiKey: env.AI_GATEWAY_API_KEY,
  });

  const INSTRUCTIONS: SystemModelMessage[] = [
    {
      role: "system",
      content: `You are the Universe Mention Agent for Lakshveer Rao — an 8-year-old hardware and AI builder from India.

Your job: find every public mention of Lakshveer Rao and his work across the internet.

Search targets:
- "Lakshveer Rao"
- "Projects by Laksh"  
- "CircuitHeroes"
- "Circuit Heroes card game"
- "Hardvare Lakshveer"
- "laksh hardware india"
- "8 year old hardware builder india"
- "laksh esp32 agent telegram"

Process:
1. Run searchWeb for each query
2. Run searchYouTube for video-specific queries  
3. Run searchReddit for community mentions
4. Run fetchYouTubeChannel to get latest uploads
5. For each relevant result (relevance > 50), call ingestMention
6. Return a summary of what was found

Relevance scoring:
- Direct mention of "Lakshveer Rao" or "Projects by Laksh" = 90+
- Mention of CircuitHeroes or Hardvare = 85+
- General hardware builder India + matching context = 70+
- Tangential/indirect = 50

Skip: anything clearly unrelated, spam, or duplicate URLs.

Be thorough but efficient. Prioritise quality over quantity.`,
    },
  ];

  return new ToolLoopAgent({
    model: openai.chat("anthropic/claude-haiku-4.5"),
    instructions: INSTRUCTIONS,
    tools: {
      searchWeb,
      searchYouTube,
      searchReddit,
      fetchYouTubeChannel,
      ingestMention,
    },
    stopWhen: [stepCountIs(40)],
  });
}

// Quick scan — runs all default queries
export function getMentionScanPrompt(): string {
  return `Run a complete mention scan for Lakshveer Rao. 

Search for all of these:
${MENTION_QUERIES.map(q => `- "${q}"`).join("\n")}

Also:
- Fetch latest videos from the Projects by Laksh YouTube channel
- Search Reddit r/india, r/IndiaTech, r/learnprogramming for mentions
- Search for any new press articles or LinkedIn posts

For every relevant result found, call ingestMention to capture it as a signal.

Return a summary: how many results found per platform, how many ingested, and highlight the top 3 most significant new mentions.`;
}
