// Universe API Hook
// Connects frontend to the Universe V2 API endpoints

import { useState, useCallback } from 'react';

const API_BASE = '/api/universe';

// Simple hash for password verification (not crypto-secure, but prevents casual snooping)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36);
}

// The hash of the correct password (pre-computed)
// Password: "insidenagole" -> hash
const CORRECT_HASH = simpleHash('insidenagole');

// Verify password and store session
export function verifyPrivatePassword(password: string): boolean {
  const inputHash = simpleHash(password);
  if (inputHash === CORRECT_HASH) {
    // Store session token (hash of password + timestamp for this session)
    const sessionToken = simpleHash(password + 'laksh-session');
    localStorage.setItem('universe-session', sessionToken);
    localStorage.setItem('universe-private-mode', 'true');
    return true;
  }
  return false;
}

// Check if session is valid
export function isSessionValid(): boolean {
  const sessionToken = localStorage.getItem('universe-session');
  const expectedToken = simpleHash('insidenagole' + 'laksh-session');
  return sessionToken === expectedToken;
}

// Logout / clear session
export function clearPrivateSession(): void {
  localStorage.removeItem('universe-session');
  localStorage.removeItem('universe-private-mode');
}

// Get auth header if in private mode (with session validation)
function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Check for private mode with valid session
  const isPrivate = localStorage.getItem('universe-private-mode') === 'true' && isSessionValid();
  
  if (isPrivate) {
    headers['X-Universe-Auth'] = 'laksh-private-2026';
  }
  
  return headers;
}

// Types
export interface NodeWorld {
  whatThisIs: string | null;
  whyItMatters: string | null;
  evidence: Evidence[];
  whatItUnlocked: UnlockedNode[];
  whatItEnablesNext: string[];
  connectedGaps: LearningGap[];
  waysToHelp: string[];
}

export interface Evidence {
  type: 'link' | 'video' | 'tweet' | 'image' | 'document';
  url: string;
  title?: string;
  date?: string;
}

export interface UnlockedNode {
  id: string;
  label: string;
  type: string;
  cluster_id?: string;
}

export interface LearningGap {
  id: string;
  label: string;
  description?: string;
  priority_score: number;
  roi_score: number;
  cluster_label?: string;
  cluster_color?: string;
}

export interface NodeCompleteness {
  score: number;
  filledSections: string[];
  missingSections: string[];
  isComplete: boolean;
}

export interface ClusterScore {
  level: number;
  score: number;
  components: {
    complexity: number;
    crossCluster: number;
    recency: number;
    validation: number;
    depth: number;
  };
  velocity: number;
  formula: string;
}

export interface EnrichedCluster {
  id: string;
  label: string;
  description?: string;
  color: string;
  icon?: string;
  level: number;
  momentum: number;
  growth_rate: number;
  project_count: number;
  skill_count: number;
  core_skills: string[];
  nodeCount: number;
  // Computed
  computedLevel: number;
  computedScore: number;
  growthVelocity: number;
  scoreComponents?: ClusterScore['components'];
  formula?: string;
}

export interface NodeDetailResponse {
  success: boolean;
  mode: 'public' | 'private' | 'partner';
  node: any;
  nodeWorld: NodeWorld;
  edges: any[];
  cluster: any | null;
  learningGaps: LearningGap[];
  completeness: NodeCompleteness | null;
  partnerContext: any | null;
}

export interface ScoringFormula {
  config: any;
  explanation: {
    complexity: string;
    crossCluster: string;
    recency: string;
    validation: string;
    depth: string;
    finalFormula: string;
    levels: string;
  };
}

// API Functions
export async function fetchNodeDetail(nodeId: string): Promise<NodeDetailResponse | null> {
  try {
    const res = await fetch(`${API_BASE}/nodes/${nodeId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch node detail:', error);
    return null;
  }
}

export async function fetchClusters(): Promise<{ clusters: EnrichedCluster[]; scoringConfig?: any }> {
  try {
    const res = await fetch(`${API_BASE}/clusters`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return { clusters: [] };
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch clusters:', error);
    return { clusters: [] };
  }
}

export async function fetchScoringFormula(): Promise<ScoringFormula | null> {
  try {
    const res = await fetch(`${API_BASE}/scoring-formula`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to fetch scoring formula:', error);
    return null;
  }
}

export async function fetchIncompleteNodes(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE}/incomplete-nodes`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.nodes || [];
  } catch (error) {
    console.error('Failed to fetch incomplete nodes:', error);
    return [];
  }
}

export async function generateOutreach(nodeId: string, context?: string, specificAsk?: string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE}/generate-outreach`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ nodeId, context, specificAsk }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Failed to generate outreach:', error);
    return null;
  }
}

// Hook for Node Detail with loading state
export function useNodeDetail() {
  const [loading, setLoading] = useState(false);
  const [nodeData, setNodeData] = useState<NodeDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadNode = useCallback(async (nodeId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNodeDetail(nodeId);
      setNodeData(data);
      if (!data) {
        setError('Node not found');
      }
    } catch (e) {
      setError('Failed to load node');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearNode = useCallback(() => {
    setNodeData(null);
    setError(null);
  }, []);

  return { loading, nodeData, error, loadNode, clearNode };
}

// Hook for Clusters with computed scores
export function useClusters() {
  const [loading, setLoading] = useState(false);
  const [clusters, setClusters] = useState<EnrichedCluster[]>([]);
  const [scoringConfig, setScoringConfig] = useState<any>(null);

  const loadClusters = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchClusters();
      setClusters(data.clusters || []);
      setScoringConfig(data.scoringConfig || null);
    } catch (e) {
      console.error('Failed to load clusters:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, clusters, scoringConfig, loadClusters };
}

// Check if private mode is enabled (with session validation)
export function isPrivateMode(): boolean {
  return localStorage.getItem('universe-private-mode') === 'true' && isSessionValid();
}

// Toggle private mode (requires valid session)
export function setPrivateMode(enabled: boolean): void {
  if (enabled && !isSessionValid()) {
    // Can't enable without valid session
    return;
  }
  localStorage.setItem('universe-private-mode', enabled ? 'true' : 'false');
}
