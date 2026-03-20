// ============================================
// SIGNAL ENGINE — Universe v7
// All signal reads go through SignalStore.
// Surface metadata (surface/audience/reach) is assigned
// via enrichSurfaceMetadata() before storing.
// ============================================

import { nodes } from '../web/data/universe-data';
import SignalStore, { resolveConfidence, enrichSurfaceMetadata } from '../data/signal-store';

// ============================================
// RE-EXPORT TYPES from signal-store
// ============================================

export type { Signal, SignalSource, SignalConfidence, SignalSurface, SignalAudience, SignalReach } from '../data/signal-store';

// ============================================
// STORE PASSTHROUGH
// ============================================

export function getAllSignals() {
  return SignalStore.getAllSignals();
}

export function getSignalById(id: string) {
  return SignalStore.getSignalById(id);
}

export function addSignal(signal: import('../data/signal-store').Signal): void {
  // Ensure surface metadata is filled before storing
  enrichSurfaceMetadata(signal);
  SignalStore.addSignal(signal);
}

export function getSignalStats() {
  return SignalStore.getStats();
}

export function getRecentSignals(count = 10) {
  return SignalStore.getRecentSignals(count);
}

// ============================================
// SURFACE METADATA ASSIGNMENT
// Exported for direct use in parseSignal and tests
// ============================================

export function assignSurfaceMetadata(signal: import('../data/signal-store').Signal): import('../data/signal-store').Signal {
  return enrichSurfaceMetadata(signal);
}

// ============================================
// ENTITY EXTRACTION
// ============================================

const NODE_LABEL_MAP = new Map<string, string>();
const NODE_ID_SET = new Set<string>();
for (const node of nodes) {
  NODE_LABEL_MAP.set(node.label.toLowerCase(), node.id);
  NODE_ID_SET.add(node.id);
  NODE_LABEL_MAP.set(node.id.replace(/-/g, ' '), node.id);
}

export function extractEntities(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const found: string[] = [];
  for (const [label, nodeId] of NODE_LABEL_MAP.entries()) {
    if (lower.includes(label) && !found.includes(nodeId)) {
      found.push(nodeId);
    }
  }
  return found;
}

export function extractDomains(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const domainKeywords: Record<string, string[]> = {
    'electronics': ['electronics', 'circuit', 'pcb', 'soldering', 'hardware'],
    'robotics': ['robotics', 'robot', 'autonomous', 'servo', 'actuator'],
    'computer-vision': ['computer vision', 'opencv', 'image recognition', 'object detection', 'vision'],
    'machine-learning': ['machine learning', 'ml', 'neural network', 'deep learning', 'ai model'],
    'entrepreneurship': ['startup', 'entrepreneur', 'business', 'sales', 'revenue', 'funding'],
    'public-speaking': ['speaking', 'presentation', 'talk', 'keynote', 'conference', 'demo'],
    'teaching': ['teaching', 'education', 'curriculum', 'students', 'workshop'],
    'python': ['python', 'flask', 'fastapi', 'jupyter'],
    'arduino': ['arduino', 'esp32', 'microcontroller'],
    'raspberry-pi': ['raspberry pi', 'raspberrypi', 'rpi'],
  };
  const domains: string[] = [];
  for (const [domain, keywords] of Object.entries(domainKeywords)) {
    if (keywords.some(kw => lower.includes(kw)) && !domains.includes(domain)) {
      domains.push(domain);
    }
  }
  return domains;
}

// ============================================
// SIGNAL → NODE MAPPING
// ============================================

export function mapSignalToNodes(signal: import('../data/signal-store').Signal): string[] {
  const mapped = new Set<string>();

  if (signal.entities) {
    for (const entity of signal.entities) {
      const lower = entity.toLowerCase();
      if (NODE_LABEL_MAP.has(lower)) mapped.add(NODE_LABEL_MAP.get(lower)!);
      if (NODE_ID_SET.has(entity)) mapped.add(entity);
    }
  }
  if (signal.domains) {
    for (const domain of signal.domains) {
      if (NODE_ID_SET.has(domain)) mapped.add(domain);
    }
  }
  if (signal.rawText) {
    for (const id of extractEntities(signal.rawText)) mapped.add(id);
  }
  if (signal.title) {
    for (const id of extractEntities(signal.title)) mapped.add(id);
  }

  return [...mapped];
}

// ============================================
// PARSE SIGNAL — create from minimal input
// ============================================

export function parseSignal(input: {
  url: string;
  source: import('../data/signal-store').SignalSource;
  title: string;
  relatedNodeId?: string;
  notes?: string;
}): import('../data/signal-store').Signal {
  const rawText = [input.title, input.notes].filter(Boolean).join('. ');

  const signal: import('../data/signal-store').Signal = {
    id: `sig-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    source: input.source,
    url: input.url,
    title: input.title,
    date: new Date().toISOString().slice(0, 7),
    entities: extractEntities(rawText),
    domains: extractDomains(rawText),
    organizations: [],
    rawText,
    confidence: resolveConfidence(input.source),
  };

  if (input.relatedNodeId && NODE_ID_SET.has(input.relatedNodeId)) {
    if (!signal.entities!.includes(input.relatedNodeId)) {
      signal.entities!.push(input.relatedNodeId);
    }
  }

  // Assign surface metadata before returning
  return enrichSurfaceMetadata(signal);
}

// ============================================
// SIGNALS PER NODE
// ============================================

export function getSignalsForNode(nodeId: string): import('../data/signal-store').Signal[] {
  return SignalStore.getSignalsByNode(nodeId, mapSignalToNodes);
}
