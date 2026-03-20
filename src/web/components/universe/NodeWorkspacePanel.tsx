// ============================================
// NODE WORKSPACE PANEL — Universe v5.5
// Actionable context tabs for each node
// v5.5: Added Discover tab
// ============================================

import { useState } from 'react';
import type { NodeWorkspace, WorkspaceItem } from '../../../workspaces/node-workspace';

interface NodeWorkspacePanelProps {
  workspace: NodeWorkspace;
  privateMode?: boolean;
}

type WorkspaceTab = 'learn' | 'build' | 'discover' | 'opportunities' | 'connect' | 'collaborate' | 'compete';

interface TabDef {
  id: WorkspaceTab;
  label: string;
  emoji: string;
}

const ALL_TABS: TabDef[] = [
  { id: 'learn',         label: 'Learn',         emoji: '📚' },
  { id: 'build',         label: 'Build',         emoji: '🔨' },
  { id: 'discover',      label: 'Discover',      emoji: '🔭' },
  { id: 'opportunities', label: 'Opportunities', emoji: '🚀' },
  { id: 'connect',       label: 'Connect',       emoji: '🤝' },
  { id: 'collaborate',   label: 'Collaborate',   emoji: '⚡' },
  { id: 'compete',       label: 'Compete',       emoji: '🏆' },
];

const PUBLIC_TABS: WorkspaceTab[] = ['learn', 'build', 'discover', 'opportunities'];

const EFFORT_COLORS: Record<string, string> = {
  low: 'text-green-400',
  medium: 'text-amber-400',
  high: 'text-red-400/80',
};

const EFFORT_LABEL: Record<string, string> = {
  low: 'Easy',
  medium: 'Moderate',
  high: 'Involved',
};

const BADGE_COLORS: Record<string, string> = {
  'High Impact':    'bg-purple-500/20 text-purple-300',
  'High Signal':    'bg-cyan-500/20 text-cyan-300',
  'Quick Win':      'bg-green-500/20 text-green-300',
  'Quick Start':    'bg-green-500/20 text-green-300',
  'Almost Mastery': 'bg-amber-500/20 text-amber-300',
  'Strong Match':   'bg-blue-500/20 text-blue-300',
  'Easy Apply':     'bg-green-500/20 text-green-300',
  'High Reach':     'bg-pink-500/20 text-pink-300',
  'Pattern Match':  'bg-violet-500/20 text-violet-300',
  'Active Build':   'bg-orange-500/20 text-orange-300',
  'Top Match':      'bg-blue-500/20 text-blue-300',
  'Milestone':      'bg-yellow-500/20 text-yellow-300',
  'Signal':         'bg-emerald-500/20 text-emerald-300',
  'Competition':    'bg-rose-500/20 text-rose-300',
  'Funding':        'bg-amber-500/20 text-amber-300',
  'Research':       'bg-indigo-500/20 text-indigo-300',
  'Community':      'bg-teal-500/20 text-teal-300',
};

function WorkspaceCard({ item }: { item: WorkspaceItem }) {
  return (
    <div className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.07] hover:bg-white/[0.06] transition-colors">
      {/* Title + badge */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <h4 className="text-sm font-semibold text-white leading-snug">{item.title}</h4>
        {item.badge && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${BADGE_COLORS[item.badge] ?? 'bg-white/10 text-white/50'}`}>
            {item.badge}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-xs text-white/50 leading-relaxed mb-2">{item.description}</p>

      {/* Footer: effort + action */}
      <div className="flex items-center justify-between gap-2">
        {item.effort && (
          <span className={`text-[10px] font-medium ${EFFORT_COLORS[item.effort] ?? 'text-white/30'}`}>
            {EFFORT_LABEL[item.effort] ?? item.effort} effort
          </span>
        )}
        {item.action && (
          item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
            >
              {item.action}
            </a>
          ) : (
            <span className="text-xs text-white/30 font-medium">{item.action}</span>
          )
        )}
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: WorkspaceTab }) {
  const messages: Record<WorkspaceTab, string> = {
    learn: 'No learning paths detected for this node yet.',
    build: 'No build suggestions generated for this node.',
    discover: 'No external discoveries found for this node yet.',
    opportunities: 'No matching opportunities found for this node.',
    connect: 'No connection suggestions for this node.',
    collaborate: 'No collaboration targets found.',
    compete: 'No competition matches for this node.',
  };
  return (
    <div className="py-6 text-center">
      <p className="text-xs text-white/25">{messages[tab]}</p>
    </div>
  );
}

export function NodeWorkspacePanel({ workspace, privateMode = false }: NodeWorkspacePanelProps) {
  const visibleTabs = ALL_TABS.filter(t =>
    privateMode ? true : PUBLIC_TABS.includes(t.id)
  );

  const [activeTab, setActiveTab] = useState<WorkspaceTab>(visibleTabs[0]?.id ?? 'learn');

  const items: WorkspaceItem[] = workspace[activeTab] ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Sub-tabs */}
      <div className="flex flex-wrap gap-1 px-5 py-2.5 border-b border-white/5">
        {visibleTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white/10 text-white'
                : 'text-white/35 hover:text-white/70'
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
            <span className={`text-[10px] ${activeTab === tab.id ? 'text-white/50' : 'text-white/20'}`}>
              {workspace[tab.id]?.length ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2.5">
        {items.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          items.map(item => <WorkspaceCard key={item.id} item={item} />)
        )}

        {/* Private-mode teaser for public users */}
        {!privateMode && (
          <div className="mt-3 p-2.5 rounded-lg border border-white/5 bg-white/[0.02]">
            <p className="text-[10px] text-white/20 text-center">
              Connect, Collaborate & Compete tabs visible in private mode
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
