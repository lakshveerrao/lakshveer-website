// ============================================
// SIGNAL TIMELINE — Universe v7
// Chronological feed of signals.
// Public:  Surface badge only
// Private: Surface + Audience + Reach + Confidence
// ============================================

import React, { useMemo } from 'react';
import SignalStore from '../../../data/signal-store';
import type { Signal, SignalSurface, SignalAudience, SignalReach } from '../../../data/signal-store';

interface SignalTimelineProps {
  privateMode?: boolean;
  maxItems?: number;
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
  youtube: '▶️',
  press: '📰',
  conference: '🎤',
  social: '𝕏',
  website: '🌐',
  community: '🤝',
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

export function SignalTimeline({ privateMode = false, maxItems = 30 }: SignalTimelineProps) {
  const signals = useMemo(() => SignalStore.getChronological().slice(0, maxItems), [maxItems]);
  const grouped  = useMemo(() => groupByYear(signals), [signals]);
  const years    = useMemo(
    () => Array.from(grouped.keys()).sort((a, b) => Number(b) - Number(a)),
    [grouped]
  );

  if (signals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-sm gap-2">
        <span className="text-2xl">📡</span>
        <p>No signals yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-2">

      {/* Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="text-sm font-semibold text-white">Signal Timeline</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {signals.length} event{signals.length !== 1 ? 's' : ''} · newest first
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

      {/* Year groups */}
      {years.map(year => {
        const group = grouped.get(year)!;
        return (
          <div key={year}>
            {/* Year divider */}
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-bold text-purple-400 tracking-widest uppercase">{year}</span>
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[10px] text-zinc-600">
                {group.length} signal{group.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 pl-2 border-l-2 border-zinc-800">
              {group.map(signal => (
                <SignalCard key={signal.id} signal={signal} privateMode={privateMode} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Signal Card ──────────────────────────────

function SignalCard({ signal, privateMode }: { signal: Signal; privateMode: boolean }) {
  const surfaceEmoji = signal.surface ? SURFACE_EMOJI[signal.surface] : '📌';
  const surfaceLabel = signal.surface ? SURFACE_LABEL[signal.surface] : signal.source;

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

        {/* Badge row — always visible */}
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">

          {/* Surface badge — always shown */}
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300">
            {surfaceLabel}
          </span>

          {/* Reach badge — always shown */}
          {signal.reach && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${REACH_STYLE[signal.reach]}`}>
              {signal.reach} reach
            </span>
          )}

          {/* Confidence — private only */}
          {privateMode && signal.confidence && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${CONFIDENCE_STYLE[signal.confidence]}`}>
              {signal.confidence}
            </span>
          )}
        </div>

        {/* Audience row — private only */}
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
