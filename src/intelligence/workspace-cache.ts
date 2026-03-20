// ============================================
// WORKSPACE CACHE — Universe v5
// Simple Map-based cache with 10-minute TTL
// ============================================

import { generateWorkspace } from './workspace-engine';
import type { NodeWorkspace } from '../workspaces/node-workspace';

const TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry {
  workspace: NodeWorkspace;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

export function getCachedWorkspace(nodeId: string): NodeWorkspace {
  const entry = cache.get(nodeId);
  if (entry && Date.now() - entry.timestamp < TTL_MS) {
    return entry.workspace;
  }
  const workspace = generateWorkspace(nodeId);
  cache.set(nodeId, { workspace, timestamp: Date.now() });
  return workspace;
}

export function setCachedWorkspace(nodeId: string, workspace: NodeWorkspace): void {
  cache.set(nodeId, { workspace, timestamp: Date.now() });
}

export function invalidateCachedWorkspace(nodeId: string): void {
  cache.delete(nodeId);
}

export function clearWorkspaceCache(): void {
  cache.clear();
}
