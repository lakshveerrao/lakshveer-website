// ============================================
// UNIVERSE BRAIN — v5.5 Orchestrator
// Single entry point for all intelligence updates
// Coordinates: signals → entities → nodes → agents → opportunities → workspace
// ============================================

import {
  type Signal,
  addSignal,
  mapSignalToNodes,
  parseSignal,
  type SignalSource,
} from './signal-engine';
import { getOpportunitiesFromSignal, getOpportunitiesForNode } from './opportunity-engine';
import { invalidateCachedWorkspace } from './workspace-cache';

// ============================================
// PROCESSING LOG
// Track what the brain has processed
// ============================================

interface ProcessingResult {
  signalId: string;
  mappedNodeIds: string[];
  opportunitiesFound: number;
  timestamp: number;
}

const processingLog: ProcessingResult[] = [];

// ============================================
// MAIN PIPELINE: processSignal
// The single entry point for new intelligence
// ============================================

export function processSignal(signal: Signal): ProcessingResult {
  // 1. Store the signal
  addSignal(signal);

  // 2. Map signal to nodes
  const mappedNodes = mapSignalToNodes(signal);

  // 3. Run opportunity engine against signal
  const signalOpportunities = getOpportunitiesFromSignal(signal);

  // 4. For each mapped node, also run per-node opportunity scan
  for (const nodeId of mappedNodes) {
    // Opportunity engine runs fresh for this node
    getOpportunitiesForNode(nodeId);
  }

  // 5. Invalidate workspace caches for affected nodes
  //    Next time workspace is requested, it will regenerate with new signal data
  for (const nodeId of mappedNodes) {
    invalidateCachedWorkspace(nodeId);
  }

  // 6. Log the processing
  const result: ProcessingResult = {
    signalId: signal.id,
    mappedNodeIds: mappedNodes,
    opportunitiesFound: signalOpportunities.length,
    timestamp: Date.now(),
  };
  processingLog.push(result);

  return result;
}

// ============================================
// QUICK SIGNAL: Create + process in one call
// Used by the admin SignalCapturePanel
// ============================================

export function quickCapture(input: {
  url: string;
  source: SignalSource;
  title: string;
  relatedNodeId?: string;
  notes?: string;
}): ProcessingResult {
  const signal = parseSignal(input);
  return processSignal(signal);
}

// ============================================
// REFRESH NODE: Re-process all signals for a node
// Used when node is opened or manually refreshed
// ============================================

export function refreshNode(nodeId: string): void {
  // Invalidate cache so workspace regenerates with latest signal/opportunity data
  invalidateCachedWorkspace(nodeId);
}

// ============================================
// PROCESSING LOG ACCESS
// ============================================

export function getProcessingLog(): ProcessingResult[] {
  return [...processingLog];
}

export function getRecentProcessingResults(count: number = 5): ProcessingResult[] {
  return processingLog.slice(-count).reverse();
}
