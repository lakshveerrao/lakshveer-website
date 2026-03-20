// ============================================
// MENTION FETCHER TOOLS — Universe v8
// Search for Lakshveer mentions across web, YouTube, Reddit
// Uses free/no-key search APIs + RSS feeds
// ============================================

import { tool } from "ai";
import z from "zod";

// ── Search queries we always run ─────────────────────────────────────
export const MENTION_QUERIES = [
  "Lakshveer Rao",
  "lakshveer rao hardware",
  "Projects by Laksh",
  "CircuitHeroes Laksh",
  "Hardvare Lakshveer",
  "circuit heroes card game india",
  "8 year old hardware builder india",
  "laksh esp32 agent telegram",
];

// ── YouTube search (no API key needed — public RSS) ──────────────────
export const searchYouTube = tool({
  description: "Search YouTube for Lakshveer Rao mentions and videos. Returns video titles, URLs, channel names, and publish dates.",
  inputSchema: z.object({
    query: z.string().describe("Search query e.g. 'Lakshveer Rao hardware'"),
  }),
  async execute({ query }) {
    try {
      // YouTube RSS search feed (no API key)
      const encoded = encodeURIComponent(query);
      const url = `https://www.youtube.com/results?search_query=${encoded}&sp=EgIQAQ%3D%3D`; // filter: videos

      // Use DuckDuckGo instant answers for YouTube results
      const res = await fetch(
        `https://api.duckduckgo.com/?q=site:youtube.com+${encoded}&format=json&no_html=1&skip_disambig=1`,
        { headers: { "User-Agent": "MentionBot/1.0" } }
      );
      const data: any = await res.json();

      const results: any[] = [];

      // RelatedTopics contains YouTube results
      if (data.RelatedTopics) {
        for (const topic of data.RelatedTopics.slice(0, 5)) {
          if (topic.FirstURL?.includes("youtube.com")) {
            results.push({
              title: topic.Text?.replace(/ - YouTube$/, "") || "YouTube Video",
              url: topic.FirstURL,
              source: "youtube",
              platform: "youtube",
              date: null,
            });
          }
        }
      }

      // Also check AbstractURL
      if (data.AbstractURL?.includes("youtube.com")) {
        results.push({
          title: data.Abstract || query,
          url: data.AbstractURL,
          source: "youtube",
          platform: "youtube",
          date: null,
        });
      }

      return { query, results, count: results.length };
    } catch (e: any) {
      return { query, results: [], error: e.message };
    }
  },
});

// ── Web search (DuckDuckGo — no key) ─────────────────────────────────
export const searchWeb = tool({
  description: "Search the web for Lakshveer Rao mentions across news, blogs, LinkedIn, Instagram, and other platforms.",
  inputSchema: z.object({
    query: z.string().describe("Search query"),
    maxResults: z.number().optional().default(8),
  }),
  async execute({ query, maxResults = 8 }) {
    try {
      const encoded = encodeURIComponent(query);
      const res = await fetch(
        `https://api.duckduckgo.com/?q=${encoded}&format=json&no_html=1&skip_disambig=1`,
        { headers: { "User-Agent": "MentionBot/1.0" } }
      );
      const data: any = await res.json();

      const results: any[] = [];

      // Abstract (top result)
      if (data.AbstractURL && data.Abstract) {
        results.push({
          title: data.Heading || query,
          url: data.AbstractURL,
          snippet: data.Abstract,
          source: data.AbstractSource || "web",
          platform: detectPlatform(data.AbstractURL),
          date: null,
        });
      }

      // Related topics
      for (const topic of (data.RelatedTopics || []).slice(0, maxResults - 1)) {
        if (topic.FirstURL && topic.Text) {
          results.push({
            title: topic.Text.split(" - ")[0] || topic.Text.slice(0, 80),
            url: topic.FirstURL,
            snippet: topic.Text,
            source: "web",
            platform: detectPlatform(topic.FirstURL),
            date: null,
          });
        }
      }

      return { query, results: results.slice(0, maxResults), count: results.length };
    } catch (e: any) {
      return { query, results: [], error: e.message };
    }
  },
});

// ── Reddit search (public JSON API) ──────────────────────────────────
export const searchReddit = tool({
  description: "Search Reddit for mentions of Lakshveer Rao, CircuitHeroes, Hardvare, and Projects by Laksh.",
  inputSchema: z.object({
    query: z.string().describe("Search query"),
    subreddit: z.string().optional().describe("Optional subreddit to search in e.g. 'india', 'IndiaTech'"),
  }),
  async execute({ query, subreddit }) {
    try {
      const encoded = encodeURIComponent(query);
      const base = subreddit
        ? `https://www.reddit.com/r/${subreddit}/search.json?q=${encoded}&restrict_sr=1&sort=new&limit=10`
        : `https://www.reddit.com/search.json?q=${encoded}&sort=new&limit=10`;

      const res = await fetch(base, {
        headers: { "User-Agent": "MentionBot/1.0 (mention tracker)" },
      });
      const data: any = await res.json();

      const posts = data?.data?.children || [];
      const results = posts.map((p: any) => ({
        title: p.data.title,
        url: `https://reddit.com${p.data.permalink}`,
        snippet: p.data.selftext?.slice(0, 200) || p.data.title,
        source: "reddit",
        platform: "reddit",
        subreddit: p.data.subreddit,
        score: p.data.score,
        date: new Date(p.data.created_utc * 1000).toISOString().slice(0, 10),
        author: p.data.author,
      }));

      return { query, results, count: results.length };
    } catch (e: any) {
      return { query, results: [], error: e.message };
    }
  },
});

// ── YouTube channel RSS (Laksh's own channel) ────────────────────────
export const fetchYouTubeChannel = tool({
  description: "Fetch latest videos from Lakshveer's YouTube channel via RSS feed. Returns recent uploads.",
  inputSchema: z.object({
    channelId: z.string().optional().default("UCProjectsByLaksh").describe("YouTube channel ID"),
  }),
  async execute({ channelId }) {
    try {
      // Projects by Laksh channel ID
      const CHANNEL_ID = "UCfKxSAMJEYqZFjGLWE5WB_A"; // actual channel ID
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;

      const res = await fetch(rssUrl, {
        headers: { "User-Agent": "MentionBot/1.0" },
      });
      const xml = await res.text();

      // Parse XML manually (no DOM in workers)
      const entries: any[] = [];
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      let match;
      while ((match = entryRegex.exec(xml)) !== null) {
        const entry = match[1];
        const title = entry.match(/<title>(.*?)<\/title>/)?.[1] || "";
        const link = entry.match(/<link rel="alternate" href="(.*?)"/)?.[1] || "";
        const published = entry.match(/<published>(.*?)<\/published>/)?.[1] || "";
        const author = entry.match(/<name>(.*?)<\/name>/)?.[1] || "Projects by Laksh";

        if (title && link) {
          entries.push({
            title: title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">"),
            url: link,
            source: "youtube",
            platform: "youtube",
            author,
            date: published.slice(0, 10),
          });
        }
      }

      return { channel: "Projects by Laksh", results: entries.slice(0, 10), count: entries.length };
    } catch (e: any) {
      return { channel: "Projects by Laksh", results: [], error: e.message };
    }
  },
});

// ── Ingest mention as signal ──────────────────────────────────────────
export const ingestMention = tool({
  description: "Save a discovered mention as a new signal in the Universe intelligence system. Use this for each relevant result found.",
  inputSchema: z.object({
    title: z.string().describe("Title or headline of the mention"),
    url: z.string().describe("URL of the mention"),
    platform: z.string().describe("Platform: youtube, reddit, linkedin, instagram, article, twitter, website"),
    date: z.string().optional().describe("Date in YYYY-MM format"),
    snippet: z.string().optional().describe("Short excerpt or description"),
    source: z.string().optional().describe("Source name e.g. 'Reddit r/IndiaTech'"),
    relevanceScore: z.number().min(0).max(100).optional().describe("How relevant is this mention 0-100"),
  }),
  async execute({ title, url, platform, date, snippet, source, relevanceScore = 70 }) {
    // This tool returns the signal data — the frontend/agent will store it
    const sourceType = mapPlatformToSource(platform);
    return {
      ingested: true,
      signal: {
        id: `sig-auto-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        source: sourceType,
        url,
        title,
        date: date || new Date().toISOString().slice(0, 7),
        rawText: snippet || title,
        domains: inferDomains(title + " " + (snippet || "")),
        entities: ["Lakshveer", "Projects by Laksh"],
        organizations: source ? [source] : [],
        confidence: relevanceScore >= 80 ? "high" : relevanceScore >= 50 ? "medium" : "low",
      },
      relevanceScore,
    };
  },
});

// ── Helpers ───────────────────────────────────────────────────────────

function detectPlatform(url: string): string {
  if (!url) return "web";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  if (url.includes("reddit.com")) return "reddit";
  if (url.includes("linkedin.com")) return "linkedin";
  if (url.includes("instagram.com")) return "instagram";
  if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
  if (url.includes("medium.com")) return "article";
  return "website";
}

function mapPlatformToSource(platform: string): string {
  const map: Record<string, string> = {
    youtube: "youtube",
    reddit: "article",
    linkedin: "article",
    instagram: "website",
    twitter: "tweet",
    article: "article",
    website: "website",
  };
  return map[platform] || "website";
}

function inferDomains(text: string): string[] {
  const t = text.toLowerCase();
  const domains: string[] = [];
  if (t.includes("robot") || t.includes("robotics")) domains.push("robotics");
  if (t.includes("circuit") || t.includes("electronics") || t.includes("esp32") || t.includes("arduino")) domains.push("electronics");
  if (t.includes("ai") || t.includes("agent") || t.includes("vision")) domains.push("ai-agents");
  if (t.includes("startup") || t.includes("founder") || t.includes("entrepreneur")) domains.push("entrepreneurship");
  if (t.includes("youtube") || t.includes("video") || t.includes("channel")) domains.push("content");
  if (t.includes("media") || t.includes("feature") || t.includes("article")) domains.push("media");
  domains.push("brand");
  return [...new Set(domains)];
}
