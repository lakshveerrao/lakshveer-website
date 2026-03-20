// ============================================
// INTELLIGENCE INSIGHTS PANEL
// Rendered from narrator + pattern engine
// ============================================

import { useState } from 'react';
import { narratorInsights, narrative } from '../../../intelligence/narrator';
import { activePatterns } from '../../../intelligence/pattern-engine';
import { futurePredictions } from '../../../intelligence/future-engine';
import type { NarratorInsight } from '../../../core/universe/node-schema';

interface IntelligenceInsightsProps {
  onClose?: () => void;
}

type Tab = 'insights' | 'patterns' | 'future';

const priorityColors: Record<NarratorInsight['priority'], string> = {
  high: '#f59e0b',
  medium: '#3b82f6',
  low: '#6b7280',
};

const insightTypeLabels: Record<NarratorInsight['type'], string> = {
  growth: 'GROWTH',
  compound: 'COMPOUND',
  opportunity: 'OPPORTUNITY',
  milestone: 'MILESTONE',
  next_step: 'NEXT STEP',
  pattern: 'PATTERN',
};

const impactColors = {
  transformative: '#a855f7',
  high: '#10b981',
  medium: '#3b82f6',
  low: '#6b7280',
};

export function IntelligenceInsights({ onClose }: IntelligenceInsightsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('insights');

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'insights', label: 'Insights', count: narratorInsights.length },
    { id: 'patterns', label: 'Patterns', count: activePatterns.length },
    { id: 'future', label: 'Future', count: futurePredictions.length },
  ];

  return (
    <div className="h-full flex flex-col bg-[#050508] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Intelligence</h2>
          <p className="text-xs text-white/30 mt-0.5">What the graph knows</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded transition-colors">
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Summary narrative */}
      <div className="px-5 pb-3">
        <p className="text-xs text-white/50 leading-relaxed">{narrative.summary}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 pb-3">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className={`text-xs rounded-full px-1.5 ${activeTab === tab.id ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/10 text-white/40'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">

        {/* INSIGHTS TAB */}
        {activeTab === 'insights' && narratorInsights.map(insight => (
          <div
            key={insight.id}
            className="p-3 rounded-xl border border-white/5 bg-white/[0.03]"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: priorityColors[insight.priority] }}
              >
                {insightTypeLabels[insight.type]}
              </span>
              <span className="text-xs text-white/20">{insight.priority}</span>
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">{insight.headline}</h4>
            <p className="text-xs text-white/50 leading-relaxed">{insight.explanation}</p>
            {insight.actionable && (
              <p className="text-xs text-cyan-400/70 mt-2 font-medium">{insight.actionable}</p>
            )}
            {insight.relatedNodeIds?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {insight.relatedNodeIds.slice(0, 3).map(id => (
                  <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/30">
                    {id.replace(/-/g, ' ')}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* PATTERNS TAB */}
        {activeTab === 'patterns' && (
          <>
            <p className="text-xs text-white/30 pb-1">Non-obvious compound relationships detected in the graph</p>
            {activePatterns.map(pattern => (
              <div
                key={pattern.id}
                className="p-3 rounded-xl border border-white/5 bg-white/[0.03]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-purple-400 uppercase font-semibold tracking-wider">
                    {pattern.type.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-mono text-white/30">{pattern.strength}%</span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">{pattern.name}</h4>
                <p className="text-xs text-white/50 leading-relaxed">{pattern.outputDescription}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {pattern.inputNodes.map(id => (
                    <span key={id} className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300/60">
                      {id.replace(/-/g, ' ')}
                    </span>
                  ))}
                </div>
                {/* Strength bar */}
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pattern.strength}%`, backgroundColor: '#a855f7' }}
                  />
                </div>
              </div>
            ))}
          </>
        )}

        {/* FUTURE TAB */}
        {activeTab === 'future' && (
          <>
            <p className="text-xs text-white/30 pb-1">Predicted next capabilities based on current trajectory</p>
            {futurePredictions.map(path => (
              <div
                key={path.id}
                className="p-3 rounded-xl border border-white/5 bg-white/[0.03]"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: impactColors[path.impact] }}
                  >
                    {path.impact}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30">{path.timeframe}</span>
                    <span className="text-xs font-mono text-cyan-400">{path.probability}%</span>
                  </div>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">{path.label}</h4>
                <p className="text-xs text-white/50 leading-relaxed">{path.description}</p>
                {/* Probability bar */}
                <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${path.probability}%`, backgroundColor: impactColors[path.impact] }}
                  />
                </div>
              </div>
            ))}
          </>
        )}

      </div>
    </div>
  );
}
