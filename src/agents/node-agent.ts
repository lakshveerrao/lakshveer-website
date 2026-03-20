// ============================================
// NODE AGENT — Per-node reasoning micro-engine
// v5.5: Now signal-aware with scan/detect/suggest capabilities
// ============================================

import { nodes, edges } from '../web/data/universe-data';
import { capabilityClusters } from '../web/data/universe-intelligence';
import { getSignalsForNode } from '../intelligence/signal-engine';
import { getOpportunitiesForNode } from '../intelligence/opportunity-engine';
import type { InferredConnection, NarratorInsight } from '../core/universe/node-schema';
import type { Signal } from '../intelligence/signal-engine';
import type { OpportunityMatch } from '../intelligence/opportunity-engine';

// ============================================
// NODE CONTEXT — What a node knows about itself
// ============================================

interface NodeContext {
  nodeId: string;
  label: string;
  type: string;
  directNeighbors: string[];
  clusterMates: string[];
  clusterLevel: number;
  timestamp: string;
  weight: number;
}

function buildNodeContext(nodeId: string): NodeContext | null {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return null;

  const directNeighbors: string[] = [];
  for (const edge of edges) {
    if (edge.source === nodeId) directNeighbors.push(edge.target);
    if (edge.target === nodeId) directNeighbors.push(edge.source);
  }

  const cluster = capabilityClusters.find(c => c.nodeIds.includes(nodeId));
  const clusterMates = cluster ? cluster.nodeIds.filter(id => id !== nodeId) : [];

  return {
    nodeId: node.id,
    label: node.label,
    type: node.type,
    directNeighbors: [...new Set(directNeighbors)],
    clusterMates,
    clusterLevel: cluster?.level || 1,
    timestamp: (node as any).timestamp || '',
    weight: node.weight || 30,
  };
}

// ============================================
// AGENT SUGGESTION TYPE
// Unified output format for all agent functions
// ============================================

export interface AgentSuggestion {
  type: 'node' | 'connection' | 'opportunity';
  title: string;
  description: string;
  relatedNodes?: string[];
  confidence: number;
  source?: string; // 'signal' | 'graph' | 'pattern'
}

// ============================================
// SCAN RELATED NODES
// Find nodes that are not yet connected but should be
// ============================================

export function scanRelatedNodes(nodeId: string): InferredConnection[] {
  const ctx = buildNodeContext(nodeId);
  if (!ctx) return [];

  const inferred: InferredConnection[] = [];
  const alreadyConnected = new Set([nodeId, ...ctx.directNeighbors]);

  // Rule 1: All cluster-mates that aren't yet connected are candidates
  for (const mateId of ctx.clusterMates) {
    if (!alreadyConnected.has(mateId)) {
      const mate = nodes.find(n => n.id === mateId);
      if (mate) {
        inferred.push({
          targetNodeId: mateId,
          reason: `Both in same capability cluster. Likely learned together or co-used in projects.`,
          confidence: 55,
          approved: false,
        });
      }
    }
  }

  // Rule 2: Nodes that share 2+ mutual neighbors but aren't connected = implicit relationship
  const neighborOfNeighbor: Map<string, number> = new Map();
  for (const neighborId of ctx.directNeighbors) {
    const neighborCtx = buildNodeContext(neighborId);
    if (!neighborCtx) continue;
    for (const nnId of neighborCtx.directNeighbors) {
      if (!alreadyConnected.has(nnId) && nnId !== nodeId) {
        neighborOfNeighbor.set(nnId, (neighborOfNeighbor.get(nnId) || 0) + 1);
      }
    }
  }

  for (const [candidateId, sharedCount] of neighborOfNeighbor.entries()) {
    if (sharedCount >= 2) {
      inferred.push({
        targetNodeId: candidateId,
        reason: `${sharedCount} mutual connections suggest implicit relationship.`,
        confidence: Math.min(80, 40 + sharedCount * 15),
        approved: false,
      });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return inferred.filter(c => {
    if (seen.has(c.targetNodeId)) return false;
    seen.add(c.targetNodeId);
    return true;
  }).sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

// ============================================
// v5.5: SCAN SIGNALS
// Find all signals relevant to this node
// ============================================

export function scanSignals(nodeId: string): Signal[] {
  return getSignalsForNode(nodeId);
}

// ============================================
// v5.5: DETECT OPPORTUNITIES
// Use opportunity engine to find real-world matches
// ============================================

export function detectOpportunities(nodeId: string): OpportunityMatch[] {
  return getOpportunitiesForNode(nodeId);
}

// ============================================
// v5.5: SUGGEST CONNECTIONS
// Suggest people, orgs, communities from signals + graph
// ============================================

export function suggestConnections(nodeId: string): AgentSuggestion[] {
  const ctx = buildNodeContext(nodeId);
  if (!ctx) return [];

  const suggestions: AgentSuggestion[] = [];
  const alreadyConnected = new Set([nodeId, ...ctx.directNeighbors]);

  // From signals: organizations mentioned in node's signals
  const signals = getSignalsForNode(nodeId);
  const orgsSeen = new Set<string>();
  for (const signal of signals) {
    if (signal.organizations) {
      for (const org of signal.organizations) {
        if (!orgsSeen.has(org) && suggestions.length < 5) {
          orgsSeen.add(org);
          suggestions.push({
            type: 'connection',
            title: `Connect with ${org}`,
            description: `${org} appears in signal "${signal.title}". May offer collaboration or mentorship.`,
            relatedNodes: [nodeId],
            confidence: 60,
            source: 'signal',
          });
        }
      }
    }
  }

  // From graph: person/company nodes not yet connected
  const personNodes = nodes.filter(n =>
    (n.type === 'person' || n.type === 'company') &&
    !alreadyConnected.has(n.id)
  );
  for (const person of personNodes.slice(0, 3)) {
    if (suggestions.length >= 5) break;
    // Check if they share a cluster
    const shareCluster = ctx.clusterMates.length > 0 &&
      capabilityClusters.some(c => c.nodeIds.includes(nodeId) && c.nodeIds.includes(person.id));

    if (shareCluster || (person.reach && person.reach > 1000)) {
      suggestions.push({
        type: 'connection',
        title: `Reach ${person.label}`,
        description: person.description || `${person.label} is relevant to ${ctx.label}.`,
        relatedNodes: [nodeId, person.id],
        confidence: shareCluster ? 65 : 45,
        source: 'graph',
      });
    }
  }

  return suggestions.slice(0, 5);
}

// ============================================
// v5.5: SUGGEST NEW NODES
// Based on signals, patterns, and gaps in the graph
// ============================================

export function suggestNewNodes(nodeId: string): AgentSuggestion[] {
  const suggestions: AgentSuggestion[] = [];

  // Static future-node suggestions (from v5)
  const staticSuggestions = FUTURE_NODE_SUGGESTIONS[nodeId] || [];
  for (const sug of staticSuggestions) {
    suggestions.push({
      type: 'node',
      title: sug.label,
      description: sug.reasoning,
      relatedNodes: [nodeId],
      confidence: 60,
      source: 'graph',
    });
  }

  // Signal-derived: entities in signals that aren't in the graph
  const signals = getSignalsForNode(nodeId);
  const existingNodeIds = new Set(nodes.map(n => n.id));
  const existingLabels = new Set(nodes.map(n => n.label.toLowerCase()));
  const suggestedEntities = new Set<string>();

  for (const signal of signals) {
    if (signal.entities) {
      for (const entity of signal.entities) {
        const lower = entity.toLowerCase();
        if (!existingNodeIds.has(entity) && !existingLabels.has(lower) && !suggestedEntities.has(lower)) {
          suggestedEntities.add(lower);
          if (suggestions.length < 5) {
            suggestions.push({
              type: 'node',
              title: entity,
              description: `Mentioned in signal "${signal.title}" but not yet in the graph.`,
              relatedNodes: [nodeId],
              confidence: 40,
              source: 'signal',
            });
          }
        }
      }
    }
  }

  return suggestions.slice(0, 5);
}

// ============================================
// SKILL EXPANSION
// ============================================

interface SkillExpansion {
  fromNodeId: string;
  toCapability: string;
  description: string;
  effort: 'low' | 'medium' | 'high';
  probability: number;
}

const SKILL_EXPANSION_MAP: Record<string, SkillExpansion[]> = {
  electronics: [
    { fromNodeId: 'electronics', toCapability: 'PCB Design', description: 'KiCAD for custom circuit boards', effort: 'medium', probability: 82 },
    { fromNodeId: 'electronics', toCapability: 'SMD Soldering', description: 'Surface mount components for compact builds', effort: 'low', probability: 75 },
  ],
  python: [
    { fromNodeId: 'python', toCapability: 'Flask/FastAPI', description: 'Backend web services for connected hardware', effort: 'low', probability: 70 },
    { fromNodeId: 'python', toCapability: 'MQTT / IoT protocols', description: 'Device communication at scale', effort: 'medium', probability: 65 },
  ],
  robotics: [
    { fromNodeId: 'robotics', toCapability: 'ROS2', description: 'Industry standard robot OS', effort: 'medium', probability: 78 },
    { fromNodeId: 'robotics', toCapability: 'Inverse Kinematics', description: 'Robotic arm motion planning', effort: 'high', probability: 55 },
  ],
  'computer-vision': [
    { fromNodeId: 'computer-vision', toCapability: 'YOLO Object Detection', description: 'Real-time multi-object detection', effort: 'medium', probability: 80 },
    { fromNodeId: 'computer-vision', toCapability: 'Depth Cameras', description: 'Intel RealSense / ToF sensors for 3D vision', effort: 'medium', probability: 65 },
  ],
  'machine-learning': [
    { fromNodeId: 'machine-learning', toCapability: 'TinyML', description: 'Running ML models on microcontrollers', effort: 'medium', probability: 72 },
    { fromNodeId: 'machine-learning', toCapability: 'Edge Impulse', description: 'Production edge AI deployment tool', effort: 'low', probability: 80 },
  ],
  entrepreneurship: [
    { fromNodeId: 'entrepreneurship', toCapability: 'D2C Marketing', description: 'Direct to consumer for CircuitHeroes expansion', effort: 'low', probability: 70 },
    { fromNodeId: 'entrepreneurship', toCapability: 'Grant Writing', description: 'Formal grant applications for hardware research', effort: 'medium', probability: 75 },
  ],
  '3d-printing': [
    { fromNodeId: '3d-printing', toCapability: 'Resin Printing', description: 'High-detail parts for CircuitHeroes figures', effort: 'low', probability: 68 },
    { fromNodeId: '3d-printing', toCapability: 'Multi-material Printing', description: 'Functional mechanical parts with TPU', effort: 'medium', probability: 60 },
  ],
  'public-speaking': [
    { fromNodeId: 'public-speaking', toCapability: 'TEDx Application', description: 'Formal talk submission to TEDxHyderabad', effort: 'low', probability: 85 },
    { fromNodeId: 'public-speaking', toCapability: 'YouTube Long-form', description: 'Structured explainer series on YouTube', effort: 'medium', probability: 72 },
  ],
};

export function detectSkillExpansion(nodeId: string): SkillExpansion[] {
  return SKILL_EXPANSION_MAP[nodeId] || [];
}

// ============================================
// FUTURE NODE SUGGESTIONS (static catalog)
// ============================================

const FUTURE_NODE_SUGGESTIONS: Record<string, { id: string; label: string; type: string; reasoning: string }[]> = {
  electronics: [
    { id: 'suggest-kicad', label: 'KiCAD', type: 'tool', reasoning: 'Standard PCB design tool, natural next step.' },
    { id: 'suggest-oscilloscope', label: 'Oscilloscope', type: 'tool', reasoning: 'Required for advanced debugging and signal analysis.' },
  ],
  'computer-vision': [
    { id: 'suggest-yolo', label: 'YOLO v8', type: 'tool', reasoning: 'Best-in-class real-time object detection.' },
    { id: 'suggest-depth-camera', label: 'Intel RealSense', type: 'tool', reasoning: '3D vision for autonomous navigation.' },
  ],
  'machine-learning': [
    { id: 'suggest-edge-impulse', label: 'Edge Impulse', type: 'tool', reasoning: 'Deploy ML models directly to microcontrollers.' },
    { id: 'suggest-huggingface', label: 'Hugging Face', type: 'tool', reasoning: 'Access to thousands of pre-trained models.' },
  ],
  circuitheroes: [
    { id: 'suggest-ch-expansion', label: 'CircuitHeroes Advanced Set', type: 'product', reasoning: 'Expansion pack for 300+ existing customers.' },
    { id: 'suggest-ch-app', label: 'CircuitHeroes App', type: 'project', reasoning: 'Companion app to verify card circuits.' },
  ],
  'isro-demo': [
    { id: 'suggest-sspo', label: 'ISRO SSPO Program', type: 'opportunity', reasoning: 'Student Satellite Program — opened by ISRO connection.' },
    { id: 'suggest-cubesat-kit', label: 'CubeSat Simulator', type: 'project', reasoning: 'Build a ground-level CubeSat mockup first.' },
  ],
};

// ============================================
// EXTERNAL MATCH MAP (static catalog, from v5)
// ============================================

interface ExternalMatch {
  name: string;
  type: 'organization' | 'person' | 'program' | 'resource';
  relevance: string;
  url?: string;
  matchScore: number;
}

const EXTERNAL_MATCH_MAP: Record<string, ExternalMatch[]> = {
  'computer-vision': [
    { name: 'NVIDIA Jetson Nano', type: 'resource', relevance: 'GPU-accelerated vision inference on edge devices', url: 'https://developer.nvidia.com/embedded/jetson-nano', matchScore: 88 },
    { name: 'OpenCV University', type: 'resource', relevance: 'Structured computer vision curriculum', url: 'https://opencv.org/university/', matchScore: 75 },
  ],
  'robotics': [
    { name: 'RoboSapiens India', type: 'organization', relevance: 'National robotics competition organization', matchScore: 72 },
    { name: 'IIT Hyderabad Robotics Lab', type: 'organization', relevance: 'Research collaboration opportunity', matchScore: 80 },
  ],
  circuitheroes: [
    { name: 'Toy Association India', type: 'organization', relevance: 'Retail distribution for educational games', matchScore: 65 },
    { name: 'Arvind Gupta', type: 'person', relevance: 'India\'s leading toy-from-trash educator — aligned mission', matchScore: 70 },
  ],
  'public-speaking': [
    { name: 'TEDxHyderabad', type: 'program', relevance: 'Closest TEDx event, application open annually', url: 'https://www.ted.com/tedx/events', matchScore: 85 },
    { name: 'India Innovation Challenge', type: 'program', relevance: 'National platform for young innovators', matchScore: 70 },
  ],
  'machine-learning': [
    { name: 'AI4Youth India', type: 'program', relevance: 'AI education program for young builders', matchScore: 78 },
    { name: 'Kaggle Learn', type: 'resource', relevance: 'Free ML courses + competitions', url: 'https://www.kaggle.com/learn', matchScore: 72 },
  ],
};

export function detectExternalMatches(nodeId: string): ExternalMatch[] {
  return (EXTERNAL_MATCH_MAP[nodeId] || []).sort((a, b) => b.matchScore - a.matchScore);
}

// ============================================
// FULL NODE AGENT RUN
// Returns comprehensive intelligence for any node
// v5.5: Now includes signal count and opportunity count
// ============================================

export interface NodeAgentResult {
  nodeId: string;
  label: string;
  inferredConnections: InferredConnection[];
  skillExpansions: SkillExpansion[];
  suggestedFutureNodes: { id: string; label: string; type: string; reasoning: string }[];
  externalMatches: ExternalMatch[];
  insights: NarratorInsight[];
  // v5.5 additions
  signalCount: number;
  opportunityCount: number;
  agentSuggestions: AgentSuggestion[];
}

export function runNodeAgent(nodeId: string): NodeAgentResult {
  const ctx = buildNodeContext(nodeId);
  const node = nodes.find(n => n.id === nodeId);
  if (!ctx || !node) {
    return {
      nodeId,
      label: nodeId,
      inferredConnections: [],
      skillExpansions: [],
      suggestedFutureNodes: [],
      externalMatches: [],
      insights: [],
      signalCount: 0,
      opportunityCount: 0,
      agentSuggestions: [],
    };
  }

  const inferredConnections = scanRelatedNodes(nodeId);
  const skillExpansions = detectSkillExpansion(nodeId);
  const staticFutureNodes = FUTURE_NODE_SUGGESTIONS[nodeId] || [];
  const externalMatches = detectExternalMatches(nodeId);

  // v5.5: Signal + Opportunity awareness
  const signals = scanSignals(nodeId);
  const opportunities = detectOpportunities(nodeId);
  const connectionSuggestions = suggestConnections(nodeId);
  const nodeSuggestions = suggestNewNodes(nodeId);

  // Merge agent suggestions
  const agentSuggestions = [...connectionSuggestions, ...nodeSuggestions].slice(0, 5);

  // Generate node-specific insights
  const insights: NarratorInsight[] = [];

  if (skillExpansions.length > 0) {
    const top = skillExpansions[0];
    insights.push({
      id: `node-insight-expand-${nodeId}`,
      type: 'next_step',
      priority: top.probability >= 75 ? 'high' : 'medium',
      headline: `Next expansion: ${top.toCapability}`,
      explanation: top.description,
      relatedNodeIds: [nodeId],
      actionable: `Probability: ${top.probability}%. Effort: ${top.effort}.`,
    });
  }

  if (inferredConnections.length > 0) {
    insights.push({
      id: `node-insight-connect-${nodeId}`,
      type: 'pattern',
      priority: 'low',
      headline: `${inferredConnections.length} potential new connections`,
      explanation: `${inferredConnections[0]?.reason || 'Implicit relationships detected.'}`,
      relatedNodeIds: inferredConnections.slice(0, 3).map(c => c.targetNodeId),
    });
  }

  // v5.5: Signal-based insight
  if (signals.length > 0) {
    const recent = signals[0];
    insights.push({
      id: `node-insight-signal-${nodeId}`,
      type: 'growth',
      priority: 'medium',
      headline: `${signals.length} signal${signals.length > 1 ? 's' : ''} detected`,
      explanation: `Latest: ${recent.title}`,
      relatedNodeIds: [nodeId],
    });
  }

  // v5.5: Opportunity insight
  if (opportunities.length > 0) {
    insights.push({
      id: `node-insight-opp-${nodeId}`,
      type: 'opportunity',
      priority: 'high',
      headline: `${opportunities.length} opportunit${opportunities.length > 1 ? 'ies' : 'y'} matched`,
      explanation: `Top match: ${opportunities[0].title} (${opportunities[0].matchScore}% relevance)`,
      relatedNodeIds: [nodeId],
      actionable: opportunities[0].link ? `Check: ${opportunities[0].link}` : undefined,
    });
  }

  return {
    nodeId,
    label: ctx.label,
    inferredConnections,
    skillExpansions,
    suggestedFutureNodes: staticFutureNodes,
    externalMatches,
    insights,
    signalCount: signals.length,
    opportunityCount: opportunities.length,
    agentSuggestions,
  };
}
