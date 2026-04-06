// ============================================
// SIGNAL TIMELINE — Universe v8
// Chronological feed of ALL signals.
// Public:  Surface badge + reach only
// Private: Surface + Audience + Reach + Confidence
// Features: search, surface filter, year filter, load-all
// ============================================

import React, { useMemo, useState, useCallback } from 'react';
import SignalStore from '../../../data/signal-store';
import type { Signal, SignalSurface, SignalAudience, SignalReach } from '../../../data/signal-store';

interface SignalTimelineProps {
  privateMode?: boolean;
}

// ── Labels ───────────────────────────────────

const SURFACE_LABEL: Record<SignalSurface, string> = {
  youtube: 'YouTube',
  press: 'Press',
  conference: 'Conference',
  social: 'Social',
  website: 'Website',
  community: 'Community',
};

const SURFACE_EMOJI: Record<SignalSurface, string> = {
  youtube: '▶',
  press: '📰',
  conference: '🎤',
  social: '𝕏',
  website: '🌐',
  community: '🤝',
};

const SURFACE_COLOR: Record<SignalSurface, string> = {
  youtube:    'text-red-400    bg-red-500/10    border-red-500/20',
  press:      'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  conference: 'text-blue-400   bg-blue-500/10   border-blue-500/20',
  social:     'text-cyan-400   bg-cyan-500/10   border-cyan-500/20',
  website:    'text-green-400  bg-green-500/10  border-green-500/20',
  community:  'text-purple-400 bg-purple-500/10 border-purple-500/20',
};

const AUDIENCE_LABEL: Record<SignalAudience, string> = {
  makers: 'Makers',
  developers: 'Devs',
  researchers: 'Research',
  students: 'Students',
  educators: 'Educators',
  general_public: 'Public',
};

const REACH_STYLE: Record<SignalReach, string> = {
  high:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-blue-400   bg-blue-500/10    border-blue-500/20',
  low:    'text-zinc-400   bg-zinc-700/20    border-zinc-600/20',
};

const CONFIDENCE_STYLE: Record<string, string> = {
  high:   'text-emerald-300 bg-emerald-500/15 border-emerald-500/25',
  medium: 'text-blue-300   bg-blue-500/15    border-blue-500/25',
  low:    'text-zinc-400   bg-zinc-500/15    border-zinc-600/25',
};

const ALL_SURFACES: SignalSurface[] = ['youtube', 'press', 'conference', 'social', 'website', 'community'];

// ── Helpers ──────────────────────────────────

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function groupByYear(signals: Signal[]): Map<string, Signal[]> {
  const groups = new Map<string, Signal[]>();
  for (const s of signals) {
    const year = s.date?.slice(0, 4) ?? 'Unknown';
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year)!.push(s);
  }
  return groups;
}

// ── Component ────────────────────────────────

const PAGE_SIZE = 30;

export function SignalTimeline({ privateMode = false }: SignalTimelineProps) {
  const allSignals = useMemo(() => SignalStore.getChronological(), []);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSurfaces, setActiveSurfaces] = useState<Set<SignalSurface>>(new Set());
  const [activeYear, setActiveYear] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const allYears = useMemo(() => {
    const years = [...new Set(allSignals.map(s => s.date?.slice(0, 4) ?? 'Unknown'))];
    return years.sort((a, b) => Number(b) - Number(a));
  }, [allSignals]);

  const toggleSurface = useCallback((s: SignalSurface) => {
    setActiveSurfaces(prev => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s); else next.add(s);
      return next;
    });
    setPage(1);
  }, []);

  const toggleYear = useCallback((y: string) => {
    setActiveYear(prev => prev === y ? null : y);
    setPage(1);
  }, []);

  // Filter
  const filtered = useMemo(() => {
    let sigs = allSignals;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      sigs = sigs.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.source?.toLowerCase().includes(q) ||
        s.entities?.some(e => e.toLowerCase().includes(q)) ||
        s.domains?.some(d => d.toLowerCase().includes(q))
      );
    }
    if (activeSurfaces.size > 0) {
      sigs = sigs.filter(s => s.surface && activeSurfaces.has(s.surface));
    }
    if (activeYear) {
      sigs = sigs.filter(s => s.date?.startsWith(activeYear));
    }
    return sigs;
  }, [allSignals, searchQuery, activeSurfaces, activeYear]);

  const displayed = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const grouped = useMemo(() => groupByYear(displayed), [displayed]);
  const years = useMemo(
    () => Array.from(grouped.keys()).sort((a, b) => Number(b) - Number(a)),
    [grouped]
  );

  const hasMore = displayed.length < filtered.length;
  const isFiltered = searchQuery.trim() || activeSurfaces.size > 0 || activeYear;

  if (allSignals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-sm gap-2">
        <span className="text-2xl">📡</span>
        <p>No signals yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-2">

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-semibold text-white">Signal Timeline</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {isFiltered
              ? `${filtered.length} of ${allSignals.length} signals`
              : `${allSignals.length} signals · newest first`}
          </p>
        </div>
        {privateMode && (
          <div className="flex gap-1 text-[9px]">
            <span className={`px-1.5 py-0.5 rounded border ${CONFIDENCE_STYLE.high}`}>high</span>
            <span className={`px-1.5 py-0.5 rounded border ${CONFIDENCE_STYLE.medium}`}>med</span>
            <span className={`px-1.5 py-0.5 rounded border ${CONFIDENCE_STYLE.low}`}>low</span>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="relative px-1">
        <input
          type="text"
          value={searchQuery}
          onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
          placeholder="Search signals..."
          className="w-full px-3 py-1.5 bg-zinc-900/80 border border-zinc-700/50 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
        />
        {searchQuery && (
          <button
            onClick={() => { setSearchQuery(''); setPage(1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Surface filter pills */}
      <div className="flex flex-wrap gap-1 px-1">
        {ALL_SURFACES.map(s => (
          <button
            key={s}
            onClick={() => toggleSurface(s)}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
              activeSurfaces.has(s)
                ? SURFACE_COLOR[s]
                : 'text-zinc-600 bg-zinc-900/50 border-zinc-700/30 hover:border-zinc-600'
            }`}
          >
            {SURFACE_EMOJI[s]} {SURFACE_LABEL[s]}
          </button>
        ))}
      </div>

      {/* Year filter */}
      <div className="flex flex-wrap gap-1 px-1">
        {allYears.map(y => (
          <button
            key={y}
            onClick={() => toggleYear(y)}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
              activeYear === y
                ? 'text-purple-300 bg-purple-500/15 border-purple-500/30'
                : 'text-zinc-600 bg-zinc-900/50 border-zinc-700/30 hover:border-zinc-600'
            }`}
          >
            {y}
          </button>
        ))}
        {isFiltered && (
          <button
            onClick={() => { setSearchQuery(''); setActiveSurfaces(new Set()); setActiveYear(null); setPage(1); }}
            className="text-[10px] px-2 py-0.5 rounded-full border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-all"
          >
            clear
          </button>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-zinc-500 text-xs gap-2">
          <span className="text-xl">🔍</span>
          <p>No signals match.</p>
        </div>
      )}

      {/* Year groups */}
      {years.map(year => {
        const group = grouped.get(year)!;
        return (
          <div key={year}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-bold text-purple-400 tracking-widest uppercase">{year}</span>
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[10px] text-zinc-600">
                {group.length} signal{group.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex flex-col gap-2 pl-2 border-l-2 border-zinc-800">
              {group.map(signal => (
                <SignalCard key={signal.id} signal={signal} privateMode={privateMode} />
              ))}
            </div>
          </div>
        );
      })}

      {/* Load more */}
      {hasMore && (
        <button
          onClick={() => setPage(p => p + 1)}
          className="mx-1 py-2 text-xs text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 rounded-lg transition-all"
        >
          Load more ({filtered.length - displayed.length} remaining)
        </button>
      )}

      {/* Footer count */}
      {!hasMore && displayed.length > 0 && (
        <p className="text-center text-[10px] text-zinc-700 py-1">
          {displayed.length} signal{displayed.length !== 1 ? 's' : ''} shown
        </p>
      )}
    </div>
  );
}

// ── Signal Card ──────────────────────────────

function SignalCard({ signal, privateMode }: { signal: Signal; privateMode: boolean }) {
  const surfaceEmoji = signal.surface ? SURFACE_EMOJI[signal.surface] : '📌';
  const surfaceLabel = signal.surface ? SURFACE_LABEL[signal.surface] : signal.source;
  const surfaceColor = signal.surface ? SURFACE_COLOR[signal.surface] : 'text-zinc-400 bg-zinc-700/20 border-zinc-600/20';

  return (
    <div className="flex gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/50 transition-colors">

      {/* Surface icon */}
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm mt-0.5">
        {surfaceEmoji}
      </div>

      <div className="flex-1 min-w-0">
        {/* Title + date */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-white/90 leading-snug line-clamp-2 flex-1">
            {signal.title}
          </p>
          {signal.date && (
            <span className="text-[10px] text-zinc-500 flex-shrink-0 mt-0.5 whitespace-nowrap">
              {formatDate(signal.date)}
            </span>
          )}
        </div>

        {/* Badge row */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${surfaceColor}`}>
            {surfaceLabel}
          </span>
          {signal.reach && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${REACH_STYLE[signal.reach]}`}>
              {signal.reach} reach
            </span>
          )}
          {privateMode && signal.confidence && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${CONFIDENCE_STYLE[signal.confidence]}`}>
              {signal.confidence}
            </span>
          )}
        </div>

        {/* Audience — private only */}
        {privateMode && signal.audience && signal.audience.length > 0 && (
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            <span className="text-[9px] text-zinc-600">reaches:</span>
            {signal.audience.slice(0, 3).map(a => (
              <span key={a} className="text-[9px] px-1 py-0.5 rounded bg-zinc-800/60 text-zinc-500">
                {AUDIENCE_LABEL[a]}
              </span>
            ))}
          </div>
        )}

        {/* Link */}
        {signal.url && (
          <a
            href={signal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 block text-[10px] text-purple-400 hover:text-purple-300 transition-colors"
          >
            ↗ source
          </a>
        )}
      </div>
    </div>
  );
}

export default SignalTimeline;
