// ============================================
// SURFACE DASHBOARD — Universe v7
// Private mode only.
// Reads surface/audience/reach directly from Signal schema.
// No external engine dependency.
// ============================================

import React, { useMemo } from 'react';
import SignalStore from '../../../data/signal-store';
import type { SignalSurface, SignalAudience, SignalReach } from '../../../data/signal-store';
import { getOpportunitiesForNodes } from '../../../intelligence/opportunity-engine';
import { nodes } from '../../data/universe-data';

// ── Labels ───────────────────────────────────

const SURFACE_EMOJI: Record<SignalSurface, string> = {
  youtube: '▶️', press: '📰', conference: '🎤',
  social: '𝕏', website: '🌐', community: '🤝',
};

const SURFACE_LABEL: Record<SignalSurface, string> = {
  youtube: 'YouTube', press: 'Press', conference: 'Conference',
  social: 'Social', website: 'Website', community: 'Community',
};

const AUDIENCE_LABEL: Record<SignalAudience, string> = {
  makers: 'Makers', developers: 'Developers', researchers: 'Researchers',
  students: 'Students', educators: 'Educators', general_public: 'General Public',
};

const AUDIENCE_EMOJI: Record<SignalAudience, string> = {
  makers: '🔧', developers: '💻', researchers: '🔬',
  students: '📚', educators: '👩‍🏫', general_public: '🌍',
};

const REACH_STYLE: Record<SignalReach, string> = {
  high:   'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  medium: 'text-blue-400   bg-blue-500/10    border-blue-500/20',
  low:    'text-zinc-400   bg-zinc-700/20    border-zinc-600/20',
};

const SURFACE_INSIGHT: Record<SignalSurface, string> = {
  youtube:    'YouTube demos build compounding engineering credibility over time.',
  press:      'Press coverage reaches the widest audience — sponsors and educators all see it.',
  conference: 'Conference signals attract researchers and senior founders — rare but high value.',
  social:     'Social signals spread fast but decay quickly. Best to amplify other surfaces.',
  website:    'Website signals are discoverable long-term — SEO compounds.',
  community:  'Community signals build the deepest collaborations, slowly.',
};

// ── Component ────────────────────────────────

export function SurfaceDashboard() {
  const allSignals  = useMemo(() => SignalStore.getAllSignals(), []);
  const summary     = useMemo(() => SignalStore.getSurfaceSummary(), []);

  const topNodeIds = useMemo(() =>
    nodes.filter(n => n.type === 'skill' || n.type === 'product' || n.type === 'project')
      .slice(0, 10).map(n => n.id),
    []
  );
  const topOpps = useMemo(() => getOpportunitiesForNodes(topNodeIds).slice(0, 5), [topNodeIds]);
  const attributedOpps = useMemo(() =>
    topOpps.filter(o => o.triggerSurface),
    [topOpps]
  );

  if (allSignals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-zinc-500 text-sm gap-2">
        <span className="text-3xl">📡</span>
        <p>No signals yet. Add signals to see brand reach.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 p-4">

      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-white">Brand Surface Intelligence</h3>
        <p className="text-xs text-zinc-500 mt-0.5">
          {allSignals.length} signal{allSignals.length !== 1 ? 's' : ''} across{' '}
          {summary.surfaces.length} surface{summary.surfaces.length !== 1 ? 's' : ''}
          {summary.topSurface && (
            <> · dominant: <span className="text-purple-400">{SURFACE_LABEL[summary.topSurface]}</span></>
          )}
        </p>
      </div>

      {/* Surfaces */}
      <div>
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Surfaces</p>
        <div className="flex flex-col gap-1.5">
          {summary.surfaces.map(({ surface, count, reach }) => (
            <div key={surface} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
              <span className="text-base">{SURFACE_EMOJI[surface]}</span>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/80 font-medium">{SURFACE_LABEL[surface]}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border capitalize ${REACH_STYLE[reach]}`}>{reach}</span>
                    <span className="text-xs text-zinc-500">{count}</span>
                  </div>
                </div>
                <div className="h-1 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${reach === 'high' ? 'bg-emerald-500' : reach === 'medium' ? 'bg-blue-500' : 'bg-zinc-600'}`}
                    style={{ width: `${Math.round((count / allSignals.length) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audiences */}
      <div>
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Audiences Reached</p>
        <div className="flex flex-wrap gap-2">
          {summary.audiences.map(({ audience, count }) => (
            <div key={audience} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
              <span className="text-sm">{AUDIENCE_EMOJI[audience]}</span>
              <span className="text-xs text-white/70">{AUDIENCE_LABEL[audience]}</span>
              <span className="text-[10px] text-zinc-500 ml-0.5">×{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Surface Insights */}
      {summary.surfaces.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Surface Intelligence</p>
          <div className="flex flex-col gap-2">
            {summary.surfaces.slice(0, 3).map(({ surface }) => (
              <div key={surface} className="flex gap-2.5 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/50">
                <span className="text-lg flex-shrink-0">{SURFACE_EMOJI[surface]}</span>
                <div>
                  <p className="text-xs font-medium text-white/80">{SURFACE_LABEL[surface]}</p>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{SURFACE_INSIGHT[surface]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Opportunity Attribution */}
      {attributedOpps.length > 0 && (
        <div>
          <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Opportunity Attribution</p>
          <div className="flex flex-col gap-1.5">
            {attributedOpps.map(opp => (
              <div key={opp.id} className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 text-xs">
                <span className="text-base flex-shrink-0">{SURFACE_EMOJI[opp.triggerSurface!]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 font-medium truncate">{opp.title}</p>
                  <p className="text-zinc-500 mt-0.5">via {SURFACE_LABEL[opp.triggerSurface!]}</p>
                </div>
                {opp.link && (
                  <a href={opp.link} target="_blank" rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 flex-shrink-0">↗</a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signal distribution strip */}
      <div>
        <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">Signal Map</p>
        <div className="flex gap-1 flex-wrap">
          {SignalStore.getChronological().map(s => (
            <div
              key={s.id}
              title={`${s.title}\n${s.surface ? SURFACE_LABEL[s.surface] : s.source} · ${s.reach ?? '?'} reach\n${s.date ?? ''}`}
              className={`w-6 h-6 rounded flex items-center justify-center text-[10px] cursor-default border ${
                s.reach === 'high'   ? 'bg-emerald-500/20 border-emerald-500/30' :
                s.reach === 'medium' ? 'bg-blue-500/20    border-blue-500/30' :
                                       'bg-zinc-800/60    border-zinc-700/30'
              }`}
            >
              {s.surface ? SURFACE_EMOJI[s.surface] : '📌'}
            </div>
          ))}
        </div>
        <p className="text-[9px] text-zinc-600 mt-1.5">Each tile = one signal · color = reach level</p>
      </div>

    </div>
  );
}

export default SurfaceDashboard;
