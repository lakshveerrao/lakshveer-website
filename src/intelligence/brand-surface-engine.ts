// ============================================
// BRAND SURFACE ENGINE — Universe v7
// Tracks every public signal and measures how it
// expands Laksh's reach across communities, media, and ecosystems.
//
// Answers: where does the work appear? who sees it?
//          which surfaces generate opportunities?
// ============================================

import type { Signal, SignalSource } from '../data/signal-store';

// ============================================
// TYPES
// ============================================

export type Surface =
  | 'youtube'
  | 'press'
  | 'hackathon'
  | 'conference'
  | 'community'
  | 'social'
  | 'website'
  | 'event';

export type AudienceType =
  | 'makers'
  | 'developers'
  | 'researchers'
  | 'founders'
  | 'students'
  | 'educators'
  | 'general_public';

export type ReachLevel = 'low' | 'medium' | 'high';

export interface SurfaceSignal {
  signalId: string;
  surface: Surface;
  audienceTypes: AudienceType[];
  estimatedReach: ReachLevel;
  signalTitle: string;
  signalDate?: string;
  signalSource: SignalSource;
}

// ============================================
// SURFACE MAPPING RULES
// Derive surface from signal source + keywords
// ============================================

const SOURCE_TO_SURFACE: Record<SignalSource, Surface> = {
  youtube: 'youtube',
  article: 'press',
  event: 'event',
  website: 'website',
  tweet: 'social',
  manual: 'community',
};

const KEYWORD_SURFACE_OVERRIDES: Array<{
  keywords: string[];
  surface: Surface;
}> = [
  { keywords: ['hackathon', 'makeathon', 'atl marathon', 'build challenge'], surface: 'hackathon' },
  { keywords: ['conference', 'summit', 'symposium', 'seminar'], surface: 'conference' },
  { keywords: ['community', 'open source', 'forum', 'discord', 'club'], surface: 'community' },
  { keywords: ['twitter', 'tweet', 'x.com', 'linkedin', 'instagram'], surface: 'social' },
  { keywords: ['demo day', 'pitch', 'showcase', 'demo'], surface: 'event' },
  { keywords: ['press', 'article', 'feature', 'interview', 'media', 'news'], surface: 'press' },
  { keywords: ['youtube', 'video', 'channel', 'tutorial', 'build log'], surface: 'youtube' },
];

export function mapSignalToSurface(signal: Signal): Surface {
  const text = [signal.title, signal.rawText ?? ''].join(' ').toLowerCase();

  for (const rule of KEYWORD_SURFACE_OVERRIDES) {
    if (rule.keywords.some(kw => text.includes(kw))) {
      return rule.surface;
    }
  }

  return SOURCE_TO_SURFACE[signal.source] ?? 'website';
}

// ============================================
// AUDIENCE MAPPING RULES
// Which surface reaches which audience types
// ============================================

const SURFACE_AUDIENCES: Record<Surface, AudienceType[]> = {
  youtube: ['makers', 'developers', 'students'],
  press: ['general_public', 'founders', 'educators'],
  hackathon: ['developers', 'students', 'makers'],
  conference: ['researchers', 'developers', 'founders'],
  community: ['makers', 'developers', 'educators'],
  social: ['general_public', 'founders', 'students'],
  website: ['developers', 'founders', 'educators'],
  event: ['founders', 'researchers', 'educators', 'makers'],
};

const DOMAIN_AUDIENCE_BOOSTS: Partial<Record<string, AudienceType[]>> = {
  robotics: ['researchers', 'developers'],
  'computer-vision': ['researchers', 'developers'],
  entrepreneurship: ['founders'],
  teaching: ['educators', 'students'],
  'public-speaking': ['general_public', 'founders'],
  electronics: ['makers', 'students'],
  'machine-learning': ['researchers', 'developers'],
};

export function getAudienceTypes(signal: Signal, surface: Surface): AudienceType[] {
  const base = new Set<AudienceType>(SURFACE_AUDIENCES[surface] || []);

  // Domain boosts
  for (const domain of signal.domains ?? []) {
    const boosts = DOMAIN_AUDIENCE_BOOSTS[domain];
    if (boosts) boosts.forEach(a => base.add(a));
  }

  return [...base];
}

// ============================================
// REACH ESTIMATION
// Simple rule-based — no analytics APIs
// ============================================

export function estimateReach(signal: Signal, surface: Surface): ReachLevel {
  // Press articles have high reach by nature
  if (surface === 'press') return 'high';

  // Events and conferences have medium reach
  if (surface === 'event' || surface === 'conference') return 'medium';

  // Hackathons: medium (focused audience)
  if (surface === 'hackathon') return 'medium';

  // YouTube: depends on keyword hints
  if (surface === 'youtube') {
    const text = [signal.title, signal.rawText ?? ''].join(' ').toLowerCase();
    // If text mentions significant metrics → high
    if (/10k|100k|viral|trending|featured|spotlight/.test(text)) return 'high';
    return 'medium'; // default for YouTube — it has ongoing compounding reach
  }

  // Social media: low by default (tweets decay fast)
  if (surface === 'social') return 'low';

  // Community / website: medium
  if (surface === 'community' || surface === 'website') return 'medium';

  // Confidence-based fallback
  if (signal.confidence === 'high') return 'high';
  if (signal.confidence === 'medium') return 'medium';
  return 'low';
}

// ============================================
// IN-MEMORY SURFACE STORE
// ============================================

const _surfaceSignals: SurfaceSignal[] = [];

export const BrandSurfaceEngine = {

  // Register a signal into the surface store
  processSurfaceSignal(signal: Signal): SurfaceSignal {
    // Skip if already registered
    const existing = _surfaceSignals.find(s => s.signalId === signal.id);
    if (existing) return existing;

    const surface = mapSignalToSurface(signal);
    const audienceTypes = getAudienceTypes(signal, surface);
    const estimatedReach = estimateReach(signal, surface);

    const surfaceSignal: SurfaceSignal = {
      signalId: signal.id,
      surface,
      audienceTypes,
      estimatedReach,
      signalTitle: signal.title,
      signalDate: signal.date,
      signalSource: signal.source,
    };

    _surfaceSignals.push(surfaceSignal);
    return surfaceSignal;
  },

  // Get surface record for a specific signal
  getSurfaceForSignal(signalId: string): SurfaceSignal | undefined {
    return _surfaceSignals.find(s => s.signalId === signalId);
  },

  // Get all surface signals
  getAllSurfaceSignals(): SurfaceSignal[] {
    return [..._surfaceSignals];
  },

  // ── Surface Summary ──────────────────────────────────────────────────

  getSurfaceSummary(): {
    surfaces: Array<{ surface: Surface; count: number; reach: ReachLevel }>;
    audiences: Array<{ audience: AudienceType; count: number }>;
    topSurface: Surface | null;
    topAudience: AudienceType | null;
    reachBreakdown: Record<ReachLevel, number>;
    totalReach: ReachLevel;
  } {
    const surfaceMap = new Map<Surface, { count: number; reaches: ReachLevel[] }>();
    const audienceMap = new Map<AudienceType, number>();

    for (const ss of _surfaceSignals) {
      // Surfaces
      if (!surfaceMap.has(ss.surface)) {
        surfaceMap.set(ss.surface, { count: 0, reaches: [] });
      }
      const entry = surfaceMap.get(ss.surface)!;
      entry.count++;
      entry.reaches.push(ss.estimatedReach);

      // Audiences
      for (const a of ss.audienceTypes) {
        audienceMap.set(a, (audienceMap.get(a) ?? 0) + 1);
      }
    }

    // Surface list sorted by count
    const surfaces = [...surfaceMap.entries()]
      .map(([surface, { count, reaches }]) => ({
        surface,
        count,
        // Dominant reach for this surface
        reach: dominantReach(reaches),
      }))
      .sort((a, b) => b.count - a.count);

    const audiences = [...audienceMap.entries()]
      .map(([audience, count]) => ({ audience, count }))
      .sort((a, b) => b.count - a.count);

    const topSurface = surfaces[0]?.surface ?? null;
    const topAudience = audiences[0]?.audience ?? null;

    const reachBreakdown: Record<ReachLevel, number> = { low: 0, medium: 0, high: 0 };
    for (const ss of _surfaceSignals) {
      reachBreakdown[ss.estimatedReach]++;
    }

    // Overall reach = highest tier with any count
    const totalReach: ReachLevel =
      reachBreakdown.high > 0 ? 'high' :
      reachBreakdown.medium > 0 ? 'medium' : 'low';

    return { surfaces, audiences, topSurface, topAudience, reachBreakdown, totalReach };
  },

  // ── Opportunity Attribution ──────────────────────────────────────────

  getOpportunityAttribution(triggeredBySignalId: string): {
    surface: Surface | null;
    audienceTypes: AudienceType[];
    reach: ReachLevel | null;
  } {
    const ss = this.getSurfaceForSignal(triggeredBySignalId);
    if (!ss) return { surface: null, audienceTypes: [], reach: null };
    return {
      surface: ss.surface,
      audienceTypes: ss.audienceTypes,
      reach: ss.estimatedReach,
    };
  },

  // ── Signals that led to most opportunities (high surface leverage) ───

  getHighLeverageSurfaces(): Array<{
    surface: Surface;
    audienceTypes: AudienceType[];
    signalCount: number;
    insight: string;
  }> {
    const summary = this.getSurfaceSummary();

    return summary.surfaces
      .filter(s => s.count >= 1)
      .slice(0, 5)
      .map(s => ({
        surface: s.surface,
        audienceTypes: [...(SURFACE_AUDIENCES[s.surface] || [])],
        signalCount: s.count,
        insight: SURFACE_INSIGHTS[s.surface] ?? `${s.count} signal(s) on ${s.surface}`,
      }));
  },
};

// ============================================
// SURFACE INSIGHTS — narrative for pattern engine
// ============================================

const SURFACE_INSIGHTS: Record<Surface, string> = {
  youtube: 'YouTube demos build compounding engineering credibility with makers and developers over time.',
  press: 'Press coverage reaches the widest audience — sponsors, educators, and the general public all see it.',
  hackathon: 'Hackathon participation puts Laksh in front of student and developer communities directly.',
  conference: 'Conference signals attract researchers and senior founders — high-value but rare.',
  community: 'Community signals build trust with peers — slow but generates the deepest collaborations.',
  social: 'Social signals have low persistence but high initial spread. Best for amplifying other signals.',
  website: 'Website signals are discoverable over time — SEO and documentation have compounding returns.',
  event: 'Event signals (demos, pitch days) directly connect to grant and partnership opportunities.',
};

// ============================================
// HELPERS
// ============================================

function dominantReach(reaches: ReachLevel[]): ReachLevel {
  if (reaches.includes('high')) return 'high';
  if (reaches.includes('medium')) return 'medium';
  return 'low';
}

// ============================================
// SEED: Process all existing signals into surface store
// Called once on module load
// ============================================

import SignalStore from '../data/signal-store';

(function seedSurfaces() {
  for (const signal of SignalStore.getAllSignals()) {
    BrandSurfaceEngine.processSurfaceSignal(signal);
  }
})();

export default BrandSurfaceEngine;
