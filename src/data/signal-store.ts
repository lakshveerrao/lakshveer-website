// ============================================
// SIGNAL STORE — Universe v7
// Single source of truth for all signals.
// Signal now carries surface, audience, and reach directly.
// Handles deduplication, confidence, surface metadata, and retrieval.
// ============================================

import rawSignalData from './signals.json';

// ============================================
// TYPES
// ============================================

export type SignalSource = 'youtube' | 'article' | 'event' | 'website' | 'tweet' | 'manual';
export type SignalConfidence = 'high' | 'medium' | 'low';
export type SignalSurface = 'youtube' | 'press' | 'conference' | 'social' | 'website' | 'community';
export type SignalAudience = 'makers' | 'developers' | 'researchers' | 'students' | 'educators' | 'general_public';
export type SignalReach = 'low' | 'medium' | 'high';

export interface Signal {
  id: string;
  source: SignalSource;
  url: string;
  title: string;
  date?: string;
  entities?: string[];
  domains?: string[];
  organizations?: string[];
  rawText?: string;
  confidence: SignalConfidence;
  // Surface metadata (v7)
  surface?: SignalSurface;
  audience?: SignalAudience[];
  reach?: SignalReach;
}

// ============================================
// SURFACE METADATA ENRICHMENT
// Default mapping rules by source.
// Called on every signal before storing.
// ============================================

export function enrichSurfaceMetadata(signal: Signal): Signal {
  // Don't overwrite if already set
  if (signal.surface && signal.audience && signal.reach) return signal;

  switch (signal.source) {
    case 'youtube':
      signal.surface = signal.surface ?? 'youtube';
      signal.audience = signal.audience ?? ['makers', 'developers'];
      signal.reach = signal.reach ?? 'medium';
      break;
    case 'article':
      signal.surface = signal.surface ?? 'press';
      signal.audience = signal.audience ?? ['general_public'];
      signal.reach = signal.reach ?? 'high';
      break;
    case 'event':
      signal.surface = signal.surface ?? 'conference';
      signal.audience = signal.audience ?? ['developers', 'students'];
      signal.reach = signal.reach ?? 'medium';
      break;
    case 'tweet':
      signal.surface = signal.surface ?? 'social';
      signal.audience = signal.audience ?? ['developers'];
      signal.reach = signal.reach ?? 'low';
      break;
    case 'website':
      signal.surface = signal.surface ?? 'website';
      signal.audience = signal.audience ?? ['developers'];
      signal.reach = signal.reach ?? 'medium';
      break;
    case 'manual':
    default:
      signal.surface = signal.surface ?? 'community';
      signal.audience = signal.audience ?? ['developers', 'makers'];
      signal.reach = signal.reach ?? 'low';
      break;
  }

  return signal;
}

// ============================================
// CONFIDENCE RESOLUTION
// ============================================

export function resolveConfidence(source: SignalSource): SignalConfidence {
  switch (source) {
    case 'article':
    case 'event':
      return 'high';
    case 'youtube':
    case 'website':
    case 'tweet':
      return 'medium';
    case 'manual':
    default:
      return 'low';
  }
}

// ============================================
// URL NORMALIZATION for dedup
// ============================================

function normalizeUrl(url: string): string {
  if (!url) return '';
  return url.trim().toLowerCase().replace(/\/$/, '');
}

// ============================================
// SEED DATA
// Backfill confidence + surface metadata on load
// ============================================

type RawSignal = {
  id: string;
  source: string;
  url: string;
  title: string;
  date?: string;
  entities?: string[];
  domains?: string[];
  organizations?: string[];
  rawText?: string;
  confidence?: string;
  surface?: string;
  audience?: string[];
  reach?: string;
};

function seedSignal(raw: RawSignal): Signal {
  const source = raw.source as SignalSource;
  const signal: Signal = {
    id: raw.id,
    source,
    url: raw.url || '',
    title: raw.title,
    date: raw.date,
    entities: raw.entities || [],
    domains: raw.domains || [],
    organizations: raw.organizations || [],
    rawText: raw.rawText || '',
    confidence: (raw.confidence as SignalConfidence) || resolveConfidence(source),
    surface: raw.surface as SignalSurface | undefined,
    audience: raw.audience as SignalAudience[] | undefined,
    reach: raw.reach as SignalReach | undefined,
  };
  // Always enrich — fills any missing surface fields
  return enrichSurfaceMetadata(signal);
}

// ============================================
// IN-MEMORY STORE
// ============================================

const _signals: Signal[] = (rawSignalData as RawSignal[]).map(seedSignal);

// URL index for O(1) dedup
const _urlIndex = new Map<string, string>();
for (const s of _signals) {
  if (s.url) _urlIndex.set(normalizeUrl(s.url), s.id);
}

// ============================================
// SIGNAL STORE API
// ============================================

export const SignalStore = {

  // ── Read ──────────────────────────────────

  getAllSignals(): Signal[] {
    return [..._signals].slice(0, 100); // max 100
  },

  getSignalById(id: string): Signal | undefined {
    return _signals.find(s => s.id === id);
  },

  getSignalsByNode(nodeId: string, mapFn: (s: Signal) => string[]): Signal[] {
    return _signals.filter(s => mapFn(s).includes(nodeId));
  },

  getRecentSignals(count = 10): Signal[] {
    return [..._signals]
      .sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
      })
      .slice(0, count);
  },

  getSignalsBySource(source: SignalSource): Signal[] {
    return _signals.filter(s => s.source === source);
  },

  getSignalsByConfidence(confidence: SignalConfidence): Signal[] {
    return _signals.filter(s => s.confidence === confidence);
  },

  getChronological(): Signal[] {
    return [..._signals]
      .sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0;
        const db = b.date ? new Date(b.date).getTime() : 0;
        return db - da;
      })
      .slice(0, 100);
  },

  // ── Write ─────────────────────────────────

  addSignal(signal: Signal): { added: boolean; existingId?: string } {
    if (_signals.some(s => s.id === signal.id)) {
      return { added: false, existingId: signal.id };
    }
    if (signal.url) {
      const key = normalizeUrl(signal.url);
      if (_urlIndex.has(key)) {
        return { added: false, existingId: _urlIndex.get(key)! };
      }
    }
    if (!signal.confidence) signal.confidence = resolveConfidence(signal.source);
    // Always enrich surface metadata before storing
    enrichSurfaceMetadata(signal);

    _signals.push(signal);
    if (signal.url) _urlIndex.set(normalizeUrl(signal.url), signal.id);
    return { added: true };
  },

  updateSignal(id: string, updates: Partial<Signal>): boolean {
    const idx = _signals.findIndex(s => s.id === id);
    if (idx < 0) return false;
    _signals[idx] = { ..._signals[idx], ...updates };
    return true;
  },

  // ── Stats ─────────────────────────────────

  getStats(): {
    total: number;
    bySource: Record<string, number>;
    byConfidence: Record<string, number>;
    bySurface: Record<string, number>;
    recentCount: number;
    duplicatesBlocked: number;
  } {
    const bySource: Record<string, number> = {};
    const byConfidence: Record<string, number> = {};
    const bySurface: Record<string, number> = {};
    let recentCount = 0;
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    for (const s of _signals) {
      bySource[s.source] = (bySource[s.source] || 0) + 1;
      byConfidence[s.confidence] = (byConfidence[s.confidence] || 0) + 1;
      if (s.surface) bySurface[s.surface] = (bySurface[s.surface] || 0) + 1;
      if (s.date && new Date(s.date) >= threeMonthsAgo) recentCount++;
    }

    return {
      total: _signals.length,
      bySource,
      byConfidence,
      bySurface,
      recentCount,
      duplicatesBlocked: _urlIndex.size - _signals.filter(s => !!s.url).length,
    };
  },

  // ── Surface summary (replaces brand-surface-engine) ──────────────

  getSurfaceSummary(): {
    surfaces: Array<{ surface: SignalSurface; count: number; reach: SignalReach }>;
    audiences: Array<{ audience: SignalAudience; count: number }>;
    topSurface: SignalSurface | null;
    topAudience: SignalAudience | null;
  } {
    const surfaceMap = new Map<SignalSurface, { count: number; reaches: SignalReach[] }>();
    const audienceMap = new Map<SignalAudience, number>();

    for (const s of _signals) {
      if (s.surface) {
        const entry = surfaceMap.get(s.surface) ?? { count: 0, reaches: [] };
        entry.count++;
        if (s.reach) entry.reaches.push(s.reach);
        surfaceMap.set(s.surface, entry);
      }
      for (const a of s.audience ?? []) {
        audienceMap.set(a, (audienceMap.get(a) ?? 0) + 1);
      }
    }

    const dominantReach = (reaches: SignalReach[]): SignalReach =>
      reaches.includes('high') ? 'high' : reaches.includes('medium') ? 'medium' : 'low';

    const surfaces = [...surfaceMap.entries()]
      .map(([surface, { count, reaches }]) => ({ surface, count, reach: dominantReach(reaches) }))
      .sort((a, b) => b.count - a.count);

    const audiences = [...audienceMap.entries()]
      .map(([audience, count]) => ({ audience, count }))
      .sort((a, b) => b.count - a.count);

    return {
      surfaces,
      audiences,
      topSurface: surfaces[0]?.surface ?? null,
      topAudience: audiences[0]?.audience ?? null,
    };
  },
};

export default SignalStore;
