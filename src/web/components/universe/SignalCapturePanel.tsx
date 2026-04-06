// ============================================
// SIGNAL CAPTURE PANEL — Real ingest pipeline
// ============================================
// Paste any URL → calls /api/signals/ingest →
// LLM scrapes + extracts signal metadata →
// Shows extracted JSON for review
// ============================================

import { useState } from 'react';

interface SignalCapturePanelProps {
  onClose: () => void;
}

interface ExtractedSignal {
  id: string;
  source: string;
  url: string;
  title: string;
  date: string;
  entities: string[];
  domains: string[];
  organizations: string[];
  rawText: string;
  confidence: string;
  surface: string;
}

type Step = 'input' | 'loading' | 'review' | 'done' | 'error';

export function SignalCapturePanel({ onClose }: SignalCapturePanelProps) {
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [signal, setSignal] = useState<ExtractedSignal | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  async function handleIngest() {
    if (!url.trim()) return;
    setStep('loading');
    setError('');
    try {
      const res = await fetch('/api/signals/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), notes: notes.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Ingest failed');
        setStep('error');
        return;
      }
      setSignal(data.signal);
      setStep('review');
    } catch (e) {
      setError('Network error — check connection');
      setStep('error');
    }
  }

  function copyJson() {
    if (!signal) return;
    navigator.clipboard.writeText(JSON.stringify(signal, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function reset() {
    setUrl('');
    setNotes('');
    setStep('input');
    setSignal(null);
    setError('');
  }

  const sourceEmoji: Record<string, string> = {
    tweet: '🐦', youtube: '📺', instagram: '📸',
    linkedin: '💼', article: '📰', github: '⚙️', website: '🌐',
  };

  const confColor: Record<string, string> = {
    high: 'text-emerald-400', medium: 'text-amber-400', low: 'text-red-400',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0a0a0f] border border-white/10 rounded-xl w-[480px] max-h-[85vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h3 className="text-sm font-bold text-white">Ingest Signal</h3>
            <p className="text-xs text-white/30 mt-0.5">URL → LLM extracts → signals.json</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded transition-colors">
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* STEP: Input */}
        {step === 'input' && (
          <div className="px-5 py-4 space-y-4">
            <div>
              <label className="text-xs font-medium text-white/50 mb-1.5 block">URL *</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleIngest()}
                autoFocus
                placeholder="https://x.com/someone/status/... or article URL"
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
              />
              <p className="text-xs text-white/25 mt-1.5">Supports: Twitter/X, YouTube, Instagram, LinkedIn, articles, blogs</p>
            </div>
            <div>
              <label className="text-xs font-medium text-white/50 mb-1.5 block">Notes <span className="text-white/25">(optional)</span></label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. endorsed Laksh at hardware hackathon"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
              />
            </div>
            <button
              onClick={handleIngest}
              disabled={!url.trim()}
              className="w-full py-2.5 rounded-lg text-sm font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30"
            >
              ⚡ Extract Signal
            </button>

            {/* Quick examples */}
            <div className="pt-2 border-t border-white/5">
              <p className="text-xs text-white/25 mb-2">Quick examples</p>
              <div className="space-y-1">
                {[
                  { label: 'Tweet mentioning Laksh', url: 'https://x.com/someone/status/...' },
                  { label: 'YouTube video about Laksh', url: 'https://youtube.com/watch?v=...' },
                  { label: 'Article / press coverage', url: 'https://medium.com/...' },
                ].map(ex => (
                  <button
                    key={ex.label}
                    onClick={() => setUrl(ex.url)}
                    className="w-full text-left text-xs text-white/30 hover:text-white/60 px-2 py-1 rounded hover:bg-white/5 transition-colors"
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP: Loading */}
        {step === 'loading' && (
          <div className="px-5 py-12 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-sm text-white">Scraping & extracting...</p>
              <p className="text-xs text-white/30 mt-1">LLM reading the page content</p>
            </div>
          </div>
        )}

        {/* STEP: Review */}
        {step === 'review' && signal && (
          <div className="px-5 py-4 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-lg">{sourceEmoji[signal.source] ?? '📌'}</span>
              <div>
                <p className="text-sm font-semibold text-white">{signal.title}</p>
                <p className="text-xs text-white/40">{signal.id}</p>
              </div>
              <span className={`ml-auto text-xs font-mono ${confColor[signal.confidence]}`}>
                {signal.confidence}
              </span>
            </div>

            <div className="bg-white/5 rounded-lg p-3 space-y-2 text-xs">
              <div className="flex gap-2">
                <span className="text-white/40 w-20 shrink-0">Date</span>
                <span className="text-white/80">{signal.date}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-white/40 w-20 shrink-0">Domains</span>
                <span className="text-white/80">{signal.domains.join(', ')}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-white/40 w-20 shrink-0">Entities</span>
                <span className="text-white/80">{signal.entities.join(', ')}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-white/40 w-20 shrink-0">Summary</span>
                <span className="text-white/80 leading-relaxed">{signal.rawText}</span>
              </div>
            </div>

            {/* JSON block */}
            <div className="relative">
              <pre className="bg-slate-900/80 rounded-lg p-3 text-xs text-emerald-300 font-mono overflow-x-auto max-h-48 overflow-y-auto">
                {JSON.stringify(signal, null, 2)}
              </pre>
              <button
                onClick={copyJson}
                className="absolute top-2 right-2 px-2 py-1 rounded text-xs bg-white/10 hover:bg-white/20 text-white/60 transition-colors"
              >
                {copied ? '✓ copied' : 'copy'}
              </button>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-300">
              <p className="font-semibold mb-1">Next step</p>
              <p className="text-amber-300/70">Copy the JSON above → paste into <code className="text-amber-300">src/raw/signals.json</code> → run <code className="text-amber-300">bun run wiki:compile</code></p>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={reset} className="flex-1 py-2 rounded-lg text-xs bg-white/5 text-white/50 hover:text-white border border-white/5 transition-colors">
                Ingest Another
              </button>
              <button onClick={onClose} className="flex-1 py-2 rounded-lg text-xs bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 transition-colors">
                Done
              </button>
            </div>
          </div>
        )}

        {/* STEP: Error */}
        {step === 'error' && (
          <div className="px-5 py-4 space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm font-semibold text-red-400 mb-1">Extraction failed</p>
              <p className="text-xs text-red-300/70">{error}</p>
            </div>
            <button onClick={reset} className="w-full py-2.5 rounded-lg text-sm bg-white/5 text-white/60 hover:text-white border border-white/10 transition-colors">
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
