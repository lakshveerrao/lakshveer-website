// ============================================
// MENTION SCANNER — Universe v8
// Admin page — private mode only
// Scans web, YouTube, Reddit for Lakshveer mentions
// ============================================

import { useState, useRef, useEffect, useCallback } from "react";
import { SEO } from "@/components/seo";
import { Header } from "@/components/header";
import { isPrivateMode } from "@/hooks/useUniverseAPI";

// ── Queries ───────────────────────────────────────────────────────────
const MENTION_QUERIES = [
  "Lakshveer Rao",
  "Projects by Laksh",
  "CircuitHeroes Laksh",
  "Hardvare Lakshveer",
  "circuit heroes card game india",
  "8 year old hardware builder india",
  "laksh esp32 agent telegram",
  "lakshveer hardware AI india",
];

// ── Types ─────────────────────────────────────────────────────────────
interface IngestedSignal {
  id: string;
  title: string;
  url: string;
  source: string;
  date: string;
  confidence: string;
  domains: string[];
  relevanceScore: number;
}

interface ScanMessage {
  id: string;
  role: "user" | "assistant" | "tool";
  text: string;
  type: "text" | "signal" | "searching" | "found" | "error";
  signal?: IngestedSignal;
  query?: string;
  count?: number;
}

// ── Signal card ───────────────────────────────────────────────────────
function SignalCard({ signal, score }: { signal: IngestedSignal; score: number }) {
  const confStyle = signal.confidence === "high"
    ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
    : signal.confidence === "medium"
    ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
    : "bg-zinc-800/50 border-zinc-700/30 text-zinc-400";

  return (
    <div className={`p-3 rounded-lg border text-xs ${confStyle}`}>
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <p className="font-medium text-white/90 leading-snug flex-1">{signal.title}</p>
        <span className={`flex-shrink-0 px-1.5 py-0.5 rounded border text-[10px] ${confStyle}`}>
          {signal.confidence}
        </span>
      </div>
      <div className="flex items-center gap-2 flex-wrap text-zinc-500 mt-1">
        <span>{signal.source}</span>
        {signal.date && <span>{signal.date}</span>}
        {signal.domains.slice(0, 2).map(d => (
          <span key={d} className="px-1 py-0.5 bg-zinc-800/60 rounded text-zinc-600">{d}</span>
        ))}
        {signal.url && (
          <a href={signal.url} target="_blank" rel="noopener noreferrer"
            className="text-purple-400 hover:text-purple-300 ml-auto">↗ open</a>
        )}
      </div>
      {score > 0 && (
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex-1 h-0.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-blue-500" : "bg-zinc-600"}`}
              style={{ width: `${score}%` }}
            />
          </div>
          <span className="text-zinc-600 text-[10px]">{score}%</span>
        </div>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────
export default function MentionScanner() {
  const [messages, setMessages] = useState<ScanMessage[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStarted, setScanStarted] = useState(false);
  const [customQuery, setCustomQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const privateMode = isPrivateMode();

  const addMessage = useCallback((msg: Omit<ScanMessage, "id">) => {
    setMessages(prev => [...prev, { ...msg, id: `${Date.now()}-${Math.random()}` }]);
  }, []);

  const ingestedSignals = messages.filter(m => m.type === "signal" && m.signal);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const runScan = useCallback(async (prompt: string) => {
    if (isScanning) return;
    setIsScanning(true);
    setScanStarted(true);

    addMessage({ role: "user", type: "text", text: prompt });

    try {
      const res = await fetch("/api/mentions/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || !line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") continue;

          try {
            const event = JSON.parse(data);

            // Text delta
            if (event.type === "text-delta" && event.textDelta) {
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && last?.type === "text") {
                  return [...prev.slice(0, -1), { ...last, text: last.text + event.textDelta }];
                }
                return [...prev, { id: `${Date.now()}`, role: "assistant", type: "text", text: event.textDelta }];
              });
            }

            // Tool call — ingestMention
            if (event.type === "tool-result" && event.toolName === "ingestMention") {
              const result = event.result;
              if (result?.ingested && result?.signal) {
                addMessage({
                  role: "tool",
                  type: "signal",
                  text: result.signal.title,
                  signal: { ...result.signal, relevanceScore: result.relevanceScore || 70 },
                });
              }
            }

            // Tool call — search tools
            if (event.type === "tool-call" && event.toolName?.startsWith("search")) {
              addMessage({
                role: "tool",
                type: "searching",
                text: `Searching ${event.toolName.replace("search", "").replace("Web", "web").replace("YouTube", "YouTube").replace("Reddit", "Reddit")}...`,
                query: event.args?.query,
              });
            }

            // Tool result — search count
            if (event.type === "tool-result" && event.toolName?.startsWith("search")) {
              if (event.result?.count !== undefined) {
                addMessage({
                  role: "tool",
                  type: "found",
                  text: `Found ${event.result.count} results`,
                  query: event.result.query,
                  count: event.result.count,
                });
              }
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (e: any) {
      addMessage({ role: "assistant", type: "error", text: `Error: ${e.message}` });
    } finally {
      setIsScanning(false);
    }
  }, [isScanning, addMessage]);

  const startFullScan = () => {
    runScan(`Run a complete mention scan for Lakshveer Rao across all platforms.

Search for all of these queries: ${MENTION_QUERIES.join(", ")}.

Also:
- Fetch latest videos from the Projects by Laksh YouTube channel
- Search Reddit r/india and r/IndiaTech for mentions

For every relevant result (relevance score > 60), call ingestMention to capture it as a signal.

At the end, give a summary: total found, total ingested, top 3 most significant new mentions.`);
  };

  if (!privateMode) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container-main py-24 text-center">
          <p className="text-[var(--text-muted)]">Private mode required to access the Mention Scanner.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEO title="Mention Scanner | Lakshveer" description="Auto-scan for Lakshveer mentions across the web." />
      <Header />

      <main className="container-main py-8 md:py-12">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔍</span>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Mention Scanner</h1>
            {isScanning && (
              <span className="flex items-center gap-1.5 text-xs text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                Scanning...
              </span>
            )}
          </div>
          <p className="text-[var(--text-secondary)] text-sm max-w-xl">
            AI agent that searches the web, YouTube, Reddit, and social platforms for every public mention of Lakshveer Rao and his projects.
          </p>
        </div>

        {/* Stats */}
        {ingestedSignals.length > 0 && (
          <div className="flex items-center gap-6 p-4 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] mb-6 text-sm">
            <div>
              <span className="text-2xl font-semibold text-[var(--accent)]">{ingestedSignals.length}</span>
              <span className="text-[var(--text-muted)] ml-2">new signals found</span>
            </div>
            <div className="h-5 w-px bg-[var(--border-subtle)]" />
            <span className="text-xs text-[var(--text-muted)]">Appearing in Universe Signal Timeline automatically</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Controls */}
          <div className="flex flex-col gap-4">

            {/* Full scan */}
            <div className="p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              <h2 className="font-semibold mb-1 text-sm">Full Scan</h2>
              <p className="text-xs text-[var(--text-muted)] mb-4">
                Searches all platforms for all queries. Takes ~60s.
              </p>
              <button
                onClick={startFullScan}
                disabled={isScanning}
                className={`w-full py-2.5 text-sm font-medium transition-all ${
                  isScanning
                    ? "bg-[var(--accent)]/10 text-[var(--accent)] cursor-not-allowed border border-[var(--accent)]/20"
                    : "bg-[var(--accent)] text-black hover:opacity-90"
                }`}
              >
                {isScanning ? "Scanning..." : "🚀 Start Full Scan"}
              </button>
            </div>

            {/* Quick queries */}
            <div className="p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              <h2 className="font-semibold mb-3 text-sm">Quick Queries</h2>
              <div className="flex flex-col gap-1.5">
                {MENTION_QUERIES.map(q => (
                  <button
                    key={q}
                    onClick={() => runScan(`Search for "${q}" across web, YouTube, Reddit. Ingest relevant results.`)}
                    disabled={isScanning}
                    className="text-left px-3 py-2 text-xs text-[var(--text-secondary)] bg-[var(--bg)] border border-[var(--border-subtle)] hover:border-[var(--accent)]/40 hover:text-[var(--text-primary)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    🔍 {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom */}
            <div className="p-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
              <h2 className="font-semibold mb-3 text-sm">Custom Search</h2>
              <form
                onSubmit={e => {
                  e.preventDefault();
                  if (customQuery.trim()) {
                    runScan(`Search for "${customQuery}" across web, YouTube, Reddit, social platforms. Ingest relevant results as signals.`);
                    setCustomQuery("");
                  }
                }}
                className="flex gap-2"
              >
                <input
                  value={customQuery}
                  onChange={e => setCustomQuery(e.target.value)}
                  placeholder="Any search term..."
                  disabled={isScanning}
                  className="flex-1 px-3 py-2 text-sm bg-[var(--bg)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)]/50 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isScanning || !customQuery.trim()}
                  className="px-3 py-2 bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors disabled:opacity-50 text-sm"
                >
                  →
                </button>
              </form>
            </div>
          </div>

          {/* Results feed */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex flex-col min-h-[500px]">
              <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-sm font-medium">Results Feed</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {messages.filter(m => m.type === "signal").length} signals · {messages.filter(m => m.type === "searching").length} searches
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[620px]">
                {!scanStarted && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <span className="text-5xl mb-4">🌐</span>
                    <p className="text-[var(--text-secondary)] text-sm mb-1">Ready to scan the internet</p>
                    <p className="text-[var(--text-muted)] text-xs">Find every mention of Lakshveer across web, YouTube, Reddit, and social platforms</p>
                  </div>
                )}

                {messages.map(msg => {
                  if (msg.type === "signal" && msg.signal) {
                    return <SignalCard key={msg.id} signal={msg.signal} score={msg.signal.relevanceScore || 0} />;
                  }
                  if (msg.type === "searching") {
                    return (
                      <div key={msg.id} className="flex items-center gap-2 text-xs text-zinc-500 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 animate-pulse flex-shrink-0" />
                        {msg.text}{msg.query && <span className="text-zinc-600">"{msg.query}"</span>}
                      </div>
                    );
                  }
                  if (msg.type === "found") {
                    return (
                      <div key={msg.id} className="flex items-center gap-2 text-xs text-zinc-600 py-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 flex-shrink-0" />
                        {msg.count} result{msg.count !== 1 ? "s" : ""}{msg.query && ` for "${msg.query}"`}
                      </div>
                    );
                  }
                  if (msg.type === "text" && msg.text) {
                    return (
                      <div key={msg.id} className={`text-sm leading-relaxed whitespace-pre-wrap py-1 ${
                        msg.role === "user" ? "text-[var(--accent)] text-xs" : "text-[var(--text-secondary)]"
                      }`}>
                        {msg.role === "user" ? `→ ${msg.text.slice(0, 80)}...` : msg.text}
                      </div>
                    );
                  }
                  if (msg.type === "error") {
                    return (
                      <div key={msg.id} className="text-xs text-red-400 py-1">{msg.text}</div>
                    );
                  }
                  return null;
                })}

                {isScanning && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500 py-2">
                    <span className="flex gap-0.5">
                      {[0, 150, 300].map(d => (
                        <span key={d} className="w-1 h-1 rounded-full bg-zinc-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </span>
                    Agent working...
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-[var(--text-muted)] text-center mt-8">
          Ingested signals appear automatically in the Universe Signal Timeline and Surface Dashboard · <a href="/universe" className="text-[var(--accent)] hover:opacity-80">Open Universe ↗</a>
        </p>
      </main>
    </div>
  );
}
