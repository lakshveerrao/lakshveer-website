// ============================================
// INTELLIGENCE FEED — Universe v6
// Private-mode real-time feed of intelligence activity
// Shows: new signals, opportunities, node suggestions, inferred connections
// ============================================

import { useState } from 'react';
import { getAllSignals, type Signal } from '../../../intelligence/signal-engine';
import { getOpportunitiesForNodes, type OpportunityMatch } from '../../../intelligence/opportunity-engine';
import { getProcessingLog } from '../../../intelligence/universe-brain';
import { generateWeeklyBrief, type WeeklyBrief } from '../../../intelligence/weekly-brief';
import { nodes } from '../../data/universe-data';

type FeedTab = 'feed' | 'brief';

export function IntelligenceFeed({ onClose }: { onClose?: () => void }) {
  const [activeTab, setActiveTab] = useState<FeedTab>('feed');

  return (
    <div className="h-full flex flex-col bg-[#050508] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/5">
        <div>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Intelligence Feed</h2>
          <p className="text-xs text-white/30 mt-0.5">Signal-driven updates</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded transition-colors">
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 py-2 border-b border-white/5">
        {([
          { id: 'feed' as FeedTab, label: '📡 Live Feed' },
          { id: 'brief' as FeedTab, label: '📋 Weekly Brief' },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-cyan-500/20 text-cyan-400'
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {activeTab === 'feed' && <FeedView />}
        {activeTab === 'brief' && <BriefView />}
      </div>
    </div>
  );
}

// ============================================
// FEED VIEW — Real-time intelligence items
// ============================================

function FeedView() {
  // Gather signals
  const signals = getAllSignals();
  const sortedSignals = [...signals].sort((a, b) => {
    const da = a.date ? new Date(a.date).getTime() : 0;
    const db = b.date ? new Date(b.date).getTime() : 0;
    return db - da;
  }).slice(0, 5);

  // Gather opportunities
  const topNodeIds = nodes
    .filter(n => n.type === 'skill' || n.type === 'product')
    .sort((a, b) => (b.weight || 30) - (a.weight || 30))
    .slice(0, 5)
    .map(n => n.id);
  const opportunities = getOpportunitiesForNodes(topNodeIds).slice(0, 5);

  // Processing log
  const log = getProcessingLog();

  // Build unified feed items
  const feedItems: FeedItem[] = [];

  for (const signal of sortedSignals) {
    feedItems.push({
      type: 'signal',
      title: signal.title,
      detail: `${signal.source} • ${signal.date || 'Unknown date'}`,
      link: signal.url || undefined,
      timestamp: signal.date ? new Date(signal.date).getTime() : 0,
    });
  }

  for (const opp of opportunities) {
    feedItems.push({
      type: 'opportunity',
      title: opp.title,
      detail: `${opp.type} • ${opp.source || 'Universe'}`,
      link: opp.link || undefined,
      timestamp: Date.now() - 1000, // slightly lower priority
    });
  }

  // Sort by type priority: signals first, then opportunities
  const sortedFeed = feedItems.slice(0, 10);

  if (sortedFeed.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-xs text-white/25">No intelligence items yet. Add signals to populate the feed.</p>
      </div>
    );
  }

  return (
    <>
      {/* Processing stats */}
      {log.length > 0 && (
        <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/15 mb-2">
          <p className="text-[10px] text-emerald-400/70">
            {log.length} signal{log.length > 1 ? 's' : ''} processed by Universe Brain
          </p>
        </div>
      )}

      {sortedFeed.map((item, i) => (
        <FeedCard key={`${item.type}-${i}`} item={item} />
      ))}
    </>
  );
}

// ============================================
// BRIEF VIEW — Weekly Intelligence Brief
// ============================================

function BriefView() {
  const brief = generateWeeklyBrief();

  return (
    <div className="space-y-5">
      {/* Stats bar */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-white/[0.03] border border-white/[0.06]">
        <StatBadge label="Signals" value={brief.stats.totalSignals} color="emerald" />
        <StatBadge label="Opportunities" value={brief.stats.totalOpportunities} color="amber" />
        <StatBadge label="Patterns" value={brief.stats.totalPatterns} color="purple" />
        <StatBadge label="Active Projects" value={brief.stats.activeProjects} color="cyan" />
      </div>

      {/* Sections */}
      <BriefSection
        title="New Signals"
        emoji="📡"
        items={brief.newSignals}
        color="emerald"
      />
      <BriefSection
        title="Opportunities Matched"
        emoji="🎯"
        items={brief.newOpportunities}
        color="amber"
      />
      <BriefSection
        title="Emerging Patterns"
        emoji="🔮"
        items={brief.emergingPatterns}
        color="purple"
      />
      <BriefSection
        title="Suggested Next Steps"
        emoji="➡️"
        items={brief.suggestedNextSteps}
        color="cyan"
      />
    </div>
  );
}

// ============================================
// SHARED COMPONENTS
// ============================================

interface FeedItem {
  type: 'signal' | 'opportunity' | 'node_suggestion' | 'connection';
  title: string;
  detail: string;
  link?: string;
  timestamp: number;
}

const TYPE_CONFIG: Record<FeedItem['type'], { color: string; label: string }> = {
  signal:          { color: 'text-emerald-400 bg-emerald-500/15', label: 'SIGNAL' },
  opportunity:     { color: 'text-amber-400 bg-amber-500/15', label: 'OPPORTUNITY' },
  node_suggestion: { color: 'text-blue-400 bg-blue-500/15', label: 'NODE' },
  connection:      { color: 'text-purple-400 bg-purple-500/15', label: 'CONNECTION' },
};

function FeedCard({ item }: { item: FeedItem }) {
  const config = TYPE_CONFIG[item.type];
  return (
    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-colors">
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${config.color}`}>
          {config.label}
        </span>
      </div>
      <h4 className="text-sm text-white font-medium mb-0.5">{item.title}</h4>
      <div className="flex items-center justify-between">
        <p className="text-xs text-white/35">{item.detail}</p>
        {item.link && (
          <a
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400/60 hover:text-cyan-400 transition-colors"
          >
            →
          </a>
        )}
      </div>
    </div>
  );
}

function StatBadge({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400',
  };
  return (
    <div className="flex-1 text-center">
      <div className={`text-lg font-bold ${colorMap[color] || 'text-white'}`}>{value}</div>
      <div className="text-[10px] text-white/30">{label}</div>
    </div>
  );
}

interface BriefSectionProps {
  title: string;
  emoji: string;
  items: { title: string; description: string; type?: string; link?: string; relatedNodes?: string[] }[];
  color: string;
}

function BriefSection({ title, emoji, items, color }: BriefSectionProps) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-400/70',
    amber: 'text-amber-400/70',
    purple: 'text-purple-400/70',
    cyan: 'text-cyan-400/70',
  };

  if (items.length === 0) return null;

  return (
    <div>
      <h4 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${colorMap[color] || 'text-white/40'}`}>
        {emoji} {title}
      </h4>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05]">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white font-medium">{item.title}</p>
                <p className="text-xs text-white/40 mt-0.5">{item.description}</p>
                {item.relatedNodes && item.relatedNodes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {item.relatedNodes.map(id => (
                      <span key={id} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/25">
                        {id.replace(/-/g, ' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {item.link && (
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400/50 hover:text-cyan-400 transition-colors flex-shrink-0"
                >
                  →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
