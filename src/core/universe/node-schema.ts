// ============================================
// UNIVERSE v4 — CANONICAL NODE SCHEMA
// The foundation of the Intelligence OS
// ============================================

export type NodeType =
  | 'core'
  | 'project'
  | 'product'
  | 'skill'
  | 'person'
  | 'event'
  | 'tool'
  | 'organization'
  | 'media'
  | 'opportunity'
  | 'future'
  | 'achievement'
  | 'concept'
  | 'possibility';

export type EdgeType =
  | 'created'
  | 'built'
  | 'uses'
  | 'knows'
  | 'learning'
  | 'mentors'
  | 'supports'
  | 'EVOLVED_INTO'
  | 'CROSS_POLLINATED_WITH'
  | 'CAPABILITY_EXPANSION'
  | 'FUTURE_PATH'
  | 'UNLOCKED'
  | 'COMPOUNDS_WITH'
  | 'LED_TO'
  | 'ENABLED_BY'
  | 'WON_AT'
  | 'PRESENTED_AT'
  | 'ENDORSED_BY';

export type SignalSource =
  | 'manual'
  | 'twitter'
  | 'youtube'
  | 'press'
  | 'github'
  | 'hackathon'
  | 'website'
  | 'notes'
  | 'inferred';

export type VerificationStatus = 'verified' | 'pending' | 'inferred' | 'rejected';

// ============================================
// SIGNAL — External evidence attached to a node
// ============================================
export interface Signal {
  id: string;
  source: SignalSource;
  url?: string;
  title?: string;
  date: string; // ISO
  extractedEntities: string[]; // names, orgs, topics
  confidence: number; // 0–100
  raw?: string; // snippet or summary
}

// ============================================
// EVIDENCE — Verified proof of a node/edge
// ============================================
export interface Evidence {
  type: 'link' | 'video' | 'tweet' | 'image' | 'document' | 'award';
  url: string;
  label: string;
  date?: string;
}

// ============================================
// INFERRED CONNECTION — AI-suggested link
// ============================================
export interface InferredConnection {
  targetNodeId: string;
  reason: string;
  confidence: number; // 0–100
  approved: boolean;
}

// ============================================
// PREDICTED PATH — Future trajectory
// ============================================
export interface PredictedPath {
  id: string;
  label: string;
  description: string;
  probability: number; // 0–100
  timeframe: string; // "3 months", "1 year"
  impact: 'low' | 'medium' | 'high' | 'transformative';
  enabledBy: string[]; // node IDs
}

// ============================================
// CORE NODE — v4 Schema
// ============================================
export interface UniverseNodeV4 {
  id: string;
  title: string;
  type: NodeType;
  date: string; // YYYY-MM
  description?: string;
  url?: string;

  // Graph
  connections: string[]; // node IDs
  tags: string[];

  // Intelligence
  evidence: Evidence[];
  signals: Signal[];
  inferredConnections: InferredConnection[];
  predictedPaths: PredictedPath[];

  // Scoring
  weight?: number; // 0–100 importance
  momentum?: number; // 0–100 current velocity
  impactScore?: number; // 0–100 reach/influence

  // Status
  status?: 'active' | 'completed' | 'potential';
  verificationStatus?: VerificationStatus;
  confidenceScore?: number;

  // Display
  cluster?: string;
  reach?: number;
  meta?: Record<string, string | number | boolean>;
}

// ============================================
// EDGE — v4 Schema
// ============================================
export interface UniverseEdgeV4 {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
  weight: number; // 0–100 strength
  date?: string;
  verificationStatus?: VerificationStatus;
  evidence?: Evidence[];
}

// ============================================
// OPPORTUNITY MATCH
// ============================================
export interface OpportunityMatch {
  id: string;
  title: string;
  type: 'hackathon' | 'grant' | 'fellowship' | 'lab' | 'accelerator' | 'conference' | 'media' | 'investor' | 'collaborator';
  whyRelevant: string;
  probability: number; // 0–100 match score
  nextAction: string;
  url?: string;
  deadline?: string;
  effort: 'low' | 'medium' | 'high';
  matchedCapabilities: string[]; // node IDs
}

// ============================================
// PATTERN — Compound capability relationship
// ============================================
export interface CapabilityPattern {
  id: string;
  name: string;
  inputNodes: string[]; // what combines
  outputDescription: string; // what it produces
  strength: number; // 0–100
  type: 'skill_compound' | 'project_chain' | 'domain_expansion' | 'capability_convergence' | 'recognition_acceleration';
  discoveredAt: string;
}

// ============================================
// PARTICIPATION ROLE
// ============================================
export interface ParticipationRole {
  role: 'investor' | 'engineer' | 'school' | 'hackathon_organizer' | 'sponsor' | 'media' | 'mentor';
  label: string;
  icon: string;
  whyRelevant: string;
  possibleCollaboration: string;
  contactPath: string;
  contactUrl?: string;
}

// ============================================
// NARRATOR INSIGHT
// ============================================
export interface NarratorInsight {
  id: string;
  type: 'growth' | 'compound' | 'opportunity' | 'milestone' | 'next_step' | 'pattern';
  priority: 'high' | 'medium' | 'low';
  headline: string;
  explanation: string; // Human-readable paragraph
  relatedNodeIds: string[];
  actionable?: string; // Optional "Next step: ..."
}
