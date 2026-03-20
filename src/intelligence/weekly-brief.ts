// ============================================
// WEEKLY INTELLIGENCE BRIEF — Universe v7
// Sections:
//   1. Signals    — what happened
//   2. Opportunities — what to pursue
//   3. Surface Summary — where reach appeared (v7)
//   4. Next Actions — what to do
// ============================================

import { getAllSignals } from './signal-engine';
import { activePatterns, emergentPatterns } from './pattern-engine';
import { opportunityMatches, futurePredictions } from './future-engine';
import { getOpportunitiesForNodes } from './opportunity-engine';
import { nodes } from '../web/data/universe-data';
import SignalStore from '../data/signal-store';
import type { SignalAudience, SignalSurface } from '../data/signal-store';

// ============================================
// TYPES
// ============================================

export interface WeeklyBrief {
  weekOf: string;
  signals: BriefItem[];
  opportunities: BriefItem[];
  surfaceSummary: {
    surfaces: Record<string, number>;
    audiences: Record<string, number>;
    dominantSurface?: string;
    summary: string;
  };
  nextActions: BriefItem[];
  emergingPatterns: BriefItem[];
  stats: {
    totalSignals: number;
    totalOpportunities: number;
    totalPatterns: number;
    activeProjects: number;
    highConfidenceSignals: number;
  };
}

export interface BriefItem {
  title: string;
  description: string;
  type?: string;
  link?: string;
  relatedNodes?: string[];
  confidence?: string;
  date?: string;
}

// ============================================
// SURFACE / AUDIENCE LABELS
// ============================================

const SURFACE_LABEL: Record<SignalSurface, string> = {
  youtube: 'YouTube',
  press: 'Press',
  conference: 'Conference',
  social: 'Social',
  website: 'Website',
  community: 'Community',
};

const AUDIENCE_LABEL: Record<SignalAudience, string> = {
  makers: 'Makers',
  developers: 'Developers',
  researchers: 'Researchers',
  students: 'Students',
  educators: 'Educators',
  general_public: 'General Public',
};

// ============================================
// GENERATOR
// ============================================

export function generateWeeklyBrief(): WeeklyBrief {
  const now = new Date();
  const weekOf = now.toISOString().slice(0, 10);

  const allSignals = getAllSignals();

  // ── Section 1: Signals ─────────────────────
  const sortedSignals = [...allSignals]
    .sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      if (db !== da) return db - da;
      const co = { high: 2, medium: 1, low: 0 };
      return (co[b.confidence] ?? 0) - (co[a.confidence] ?? 0);
    })
    .slice(0, 5);

  const signals: BriefItem[] = sortedSignals.map(s => ({
    title: s.title,
    description: [
      s.surface ? SURFACE_LABEL[s.surface] : s.source,
      s.date ? formatDate(s.date) : null,
      s.reach ? `${s.reach} reach` : null,
    ].filter(Boolean).join(' · '),
    type: s.surface ?? s.source,
    link: s.url || undefined,
    relatedNodes: s.domains?.slice(0, 3),
    confidence: s.confidence,
    date: s.date,
  }));

  // ── Section 2: Opportunities ────────────────
  const topNodeIds = nodes
    .filter(n => n.type === 'skill' || n.type === 'product' || n.type === 'project')
    .sort((a, b) => (b.weight || 30) - (a.weight || 30))
    .slice(0, 10)
    .map(n => n.id);

  const engineOpps = getOpportunitiesForNodes(topNodeIds);
  const opportunities: BriefItem[] = engineOpps.slice(0, 4).map(o => ({
    title: o.title,
    description: [
      o.description,
      o.triggerSurface ? `via ${o.triggerSurface}` : null,
    ].filter(Boolean).join(' — '),
    type: o.type,
    link: o.link || undefined,
    relatedNodes: [],
  }));

  // Top-up from future engine
  const futureOpps = opportunityMatches
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);
  for (const o of futureOpps) {
    if (opportunities.length >= 5) break;
    if (!opportunities.some(e => e.title.toLowerCase().includes(o.title.toLowerCase().slice(0, 20)))) {
      opportunities.push({
        title: o.title,
        description: o.whyRelevant,
        type: o.type,
        link: o.url || undefined,
        relatedNodes: o.matchedCapabilities.slice(0, 3),
      });
    }
  }

  // ── Section 3: Surface Summary ──────────────
  const surfaceData = SignalStore.getSurfaceSummary();

  const surfaceCounts: Record<string, number> = {};
  for (const s of surfaceData.surfaces) {
    surfaceCounts[SURFACE_LABEL[s.surface]] = s.count;
  }

  const audienceCounts: Record<string, number> = {};
  for (const a of surfaceData.audiences) {
    audienceCounts[AUDIENCE_LABEL[a.audience]] = a.count;
  }

  const dominantSurface = surfaceData.topSurface
    ? SURFACE_LABEL[surfaceData.topSurface]
    : undefined;

  const topAudiences = surfaceData.audiences
    .slice(0, 3)
    .map(a => `${AUDIENCE_LABEL[a.audience]} (${a.count})`)
    .join(', ');

  const surfaceSummaryText = dominantSurface
    ? `Signals this week reached: ${topAudiences}. Dominant surface: ${dominantSurface}.`
    : 'No surface data yet.';

  const surfaceSummary = {
    surfaces: surfaceCounts,
    audiences: audienceCounts,
    dominantSurface,
    summary: surfaceSummaryText,
  };

  // ── Section 4: Next Actions ─────────────────
  const nextActions: BriefItem[] = [];

  const predictions = futurePredictions
    .filter(p => p.probability >= 60)
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  for (const p of predictions) {
    nextActions.push({
      title: p.label,
      description: `${p.description} — ${p.timeframe} · ${p.probability}% likely`,
      type: p.impact,
      relatedNodes: p.enabledBy.slice(0, 3),
    });
  }

  // Surface-aware action hints
  const recentHigh = allSignals
    .filter(s => s.confidence === 'high')
    .sort((a, b) => {
      const da = a.date ? new Date(a.date).getTime() : 0;
      const db = b.date ? new Date(b.date).getTime() : 0;
      return db - da;
    })
    .slice(0, 2);

  for (const s of recentHigh) {
    if (nextActions.length >= 5) break;
    const action = deriveActionFromSignal(s);
    if (action) nextActions.push(action);
  }

  // ── Emerging Patterns ──────────────────────
  const emergingPatternsItems: BriefItem[] = [];
  for (const p of activePatterns.slice(0, 3)) {
    emergingPatternsItems.push({
      title: p.name,
      description: p.outputDescription,
      type: p.type.replace(/_/g, ' '),
      relatedNodes: p.inputNodes.slice(0, 3),
    });
  }
  for (const ep of emergentPatterns.slice(0, 2)) {
    if (emergingPatternsItems.length >= 5) break;
    emergingPatternsItems.push({
      title: ep.emergentCapability,
      description: `${ep.sharedConnections} shared connections between ${ep.nodeA.replace(/-/g, ' ')} and ${ep.nodeB.replace(/-/g, ' ')}`,
      type: 'emergent',
      relatedNodes: [ep.nodeA, ep.nodeB],
    });
  }

  // ── Stats ──────────────────────────────────
  const stats = {
    totalSignals: allSignals.length,
    totalOpportunities: engineOpps.length + futureOpps.length,
    totalPatterns: activePatterns.length,
    activeProjects: nodes.filter(n =>
      (n.type === 'project' || n.type === 'product') &&
      (n.status === 'live' || n.status === 'building')
    ).length,
    highConfidenceSignals: allSignals.filter(s => s.confidence === 'high').length,
  };

  return {
    weekOf,
    signals: signals.slice(0, 5),
    opportunities: opportunities.slice(0, 5),
    surfaceSummary,
    nextActions: nextActions.slice(0, 5),
    emergingPatterns: emergingPatternsItems.slice(0, 5),
    stats,
  };
}

// ============================================
// HELPERS
// ============================================

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

function deriveActionFromSignal(signal: import('../data/signal-store').Signal): BriefItem | null {
  const title = signal.title.toLowerCase();
  const domains = signal.domains || [];
  if (domains.includes('robotics') || title.includes('robot')) {
    return { title: 'Explore ROS robotics stack', description: 'Recent robotics signal — ROS2 + SLAM could unlock autonomous navigation.', type: 'next-step', relatedNodes: ['robotics'] };
  }
  if (domains.includes('computer-vision') || title.includes('vision')) {
    return { title: 'Document vision project for community', description: 'High-confidence vision signal. OpenCV forums and RPi Foundation are strong amplifiers.', type: 'next-step', relatedNodes: ['computer-vision'] };
  }
  if (domains.includes('entrepreneurship') || title.includes('grant') || title.includes('award')) {
    return { title: 'Reach out to robotics research labs', description: 'Grant/award signal — strong moment to expand network.', type: 'next-step', relatedNodes: ['entrepreneurship'] };
  }
  if (signal.organizations?.includes('ISRO')) {
    return { title: 'Follow up on ISRO CubeSat programs', description: 'ISRO connection is a rare unlock. Student satellite programs are accessible.', type: 'next-step', relatedNodes: ['isro-demo'] };
  }
  return null;
}
