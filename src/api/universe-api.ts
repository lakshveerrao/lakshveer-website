// Universe V2 API - Neural Capability OS
// Phase 2: Node=World System + Capability Engine with Real Scoring
// Phase 3: Verification Layer + Trust System
// Phase 4: Learning Gap + Opportunity Engines
// Phase A v3: Intelligent Opportunity Intelligence Engine with LLM
// Handles all universe data operations with mode-based access

import { Hono } from 'hono';
import { GraphTraversal, PatternMatcher, OpportunityGenerator } from './opportunity-engine-v2';
import type { IntelligentOpportunity } from './opportunity-engine-v2';
import { EnhancedGraphTraversal, LLMOpportunityGenerator } from './opportunity-intelligence';
import type { OpportunityContext } from './opportunity-intelligence';

interface Env {
  DB: D1Database;
}

type ViewMode = 'public' | 'private' | 'partner';

const universeApi = new Hono<{ Bindings: Env }>();

// ============================================
// CONFIDENCE SCORING: Configuration
// ============================================
const CONFIDENCE_CONFIG = {
  // Source reliability weights
  sourceReliability: {
    manual: 100,        // Manually entered = highest trust
    twitter: 70,        // Twitter mentions
    youtube: 75,        // YouTube content
    notes: 60,          // Handwritten notes
    inferred: 40,       // AI-inferred
  } as Record<string, number>,
  
  // Edge type base confidence
  edgeTypeConfidence: {
    BUILT_WITH: 90,       // Direct creation link
    SUPPORTED_BY: 85,     // Support/sponsorship
    WON_AT: 95,           // Award/win - very verifiable
    PRESENTED_AT: 90,     // Presentation - verifiable
    LEARNED_FROM: 70,     // Learning - subjective
    ENABLED_BY: 65,       // Enablement - inference
    EVOLVED_INTO: 80,     // Evolution - traceable
    CROSS_POLLINATED: 60, // Cross-pollination - inference
    ENDORSED_BY: 85,      // Endorsement - verifiable
    USES: 75,             // Usage - observable
    UNLOCKS: 50,          // Potential - speculative
    MENTORED_BY: 70,      // Mentorship - subjective
  } as Record<string, number>,
  
  // Evidence boost (per evidence link)
  evidenceBoost: 10,      // +10 per evidence link (max +30)
  maxEvidenceBoost: 30,
  
  // Co-occurrence boost
  coOccurrenceBoost: 5,   // +5 per related edge
  maxCoOccurrenceBoost: 15,
};

/**
 * Calculate confidence score for an edge
 */
async function calculateEdgeConfidence(
  db: D1Database,
  edge: any
): Promise<{ score: number; breakdown: any }> {
  // 1. Source reliability
  const sourceScore = CONFIDENCE_CONFIG.sourceReliability[edge.source] || 50;
  
  // 2. Edge type base confidence
  const typeScore = CONFIDENCE_CONFIG.edgeTypeConfidence[edge.type] || 60;
  
  // 3. Evidence boost
  let evidenceCount = 0;
  try {
    const evidence = JSON.parse(edge.evidence || '[]');
    evidenceCount = Array.isArray(evidence) ? evidence.length : 0;
  } catch {}
  const evidenceBoost = Math.min(
    evidenceCount * CONFIDENCE_CONFIG.evidenceBoost,
    CONFIDENCE_CONFIG.maxEvidenceBoost
  );
  
  // 4. Co-occurrence boost (how many other edges connect same nodes)
  const coOccurrence = await db.prepare(
    `SELECT COUNT(*) as count FROM universe_edges 
     WHERE (source_id = ? OR target_id = ? OR source_id = ? OR target_id = ?)
     AND id != ?`
  ).bind(edge.source_id, edge.source_id, edge.target_id, edge.target_id, edge.id).first();
  const coOccurrenceBoost = Math.min(
    ((coOccurrence?.count as number) || 0) * CONFIDENCE_CONFIG.coOccurrenceBoost,
    CONFIDENCE_CONFIG.maxCoOccurrenceBoost
  );
  
  // Calculate weighted score
  const rawScore = (sourceScore * 0.3) + (typeScore * 0.4) + (evidenceBoost * 0.2) + (coOccurrenceBoost * 0.1);
  const finalScore = Math.min(100, Math.round(rawScore));
  
  return {
    score: finalScore,
    breakdown: {
      sourceReliability: sourceScore,
      edgeTypeBase: typeScore,
      evidenceBoost,
      coOccurrenceBoost,
      formula: '0.3×Source + 0.4×EdgeType + 0.2×Evidence + 0.1×CoOccurrence',
    },
  };
}

// ============================================
// CAPABILITY ENGINE: Scoring Configuration
// ============================================
const SCORING_CONFIG = {
  // Project Complexity Weights (by type)
  projectComplexity: {
    product: 1.0,       // Full product = highest complexity
    project: 0.75,      // Projects = high
    skill: 0.5,         // Skills = medium
    technology: 0.4,    // Tools/tech = lower
    tool: 0.4,
    event: 0.6,         // Events (hackathons, demos)
    award: 0.8,         // Awards = high validation
    endorsement: 0.7,   // Endorsements = strong signal
    person: 0.3,        // People/orgs = connectors
    organization: 0.3,
    trip: 0.2,
    note: 0.1,
    capability: 0.5,
    potential: 0.2,
    influence: 0.3,
    cluster: 0.0,
  } as Record<string, number>,
  
  // Recency decay (months)
  recencyHalfLife: 6,   // Score halves every 6 months for recency component
  
  // Weights for final score
  weights: {
    complexity: 0.25,
    crossCluster: 0.20,
    recency: 0.20,
    validation: 0.20,
    depth: 0.15,
  },
  
  // Validation multipliers
  validationMultipliers: {
    hackathon_win: 2.0,
    hackathon_participant: 1.5,
    award: 1.8,
    grant: 1.7,
    endorsement: 1.4,
    demo: 1.3,
    sale: 1.6,
  } as Record<string, number>,
  
  // Level thresholds (0-100 score)
  levelThresholds: [0, 20, 40, 60, 80], // Level 1-5
};

// ============================================
// PHASE 4: LEARNING GAP ENGINE - Configuration
// ============================================
const GAP_ENGINE_CONFIG = {
  // Gap types with base priority
  gapTypes: {
    missing_skill: { priority: 80, effort: 60, label: 'Missing Skill' },
    incomplete_node: { priority: 60, effort: 30, label: 'Incomplete Documentation' },
    weak_cluster: { priority: 70, effort: 50, label: 'Weak Cluster' },
    missing_connection: { priority: 50, effort: 40, label: 'Missing Connection' },
    stale_project: { priority: 40, effort: 20, label: 'Stale Project' },
  } as Record<string, { priority: number; effort: number; label: string }>,
  
  // Skill prerequisites for common patterns
  skillPrerequisites: {
    'machine-learning': ['python', 'tensorflow'],
    'computer-vision': ['python', 'opencv'],
    'robotics': ['electronics', 'arduino', 'cpp'],
    'iot': ['electronics', 'esp32', 'python'],
    'drone-tech': ['electronics', 'robotics'],
  } as Record<string, string[]>,
  
  // ROI multipliers based on what gap blocks
  blockingMultipliers: {
    blocks_product: 2.0,     // Gap blocks a potential product
    blocks_hackathon: 1.8,   // Gap blocks hackathon participation  
    blocks_grant: 1.7,       // Gap blocks grant application
    blocks_next_level: 1.5,  // Gap blocks cluster level-up
  } as Record<string, number>,
};

// ============================================
// PHASE A: ALIGNMENT ENGINE - Configuration
// ============================================
const ALIGNMENT_ENGINE_CONFIG = {
  // Weights for alignment score calculation
  weights: {
    clusterOverlap: 0.30,      // How much their focus matches Laksh's clusters
    buildRelevance: 0.25,      // How relevant their work is to Laksh's builds
    stageCompatibility: 0.15,  // Student builder vs their typical engagement
    recency: 0.15,             // Recent activity boost
    domainSimilarity: 0.15,    // Domain keyword matching
  },
  
  // Minimum score to trigger opportunity generation
  opportunityThreshold: 40,
  
  // Domain keywords for matching
  domainKeywords: {
    hardware: ['electronics', 'circuits', 'arduino', 'esp32', 'sensors', 'motors', 'pcb', 'embedded', 'iot'],
    robotics: ['robotics', 'robot', 'automation', 'autonomous', 'navigation', 'mechatronics'],
    ai: ['ai', 'ml', 'machine learning', 'computer vision', 'deep learning', 'tensorflow', 'neural'],
    maker: ['maker', 'diy', 'prototype', 'fabrication', '3d printing', 'hackerspace', 'tinkering'],
    education: ['education', 'learning', 'stem', 'kids', 'young', 'student', 'school', 'teaching'],
    startup: ['startup', 'founder', 'entrepreneur', 'venture', 'innovation', 'accelerator', 'incubator'],
  } as Record<string, string[]>,
  
  // Stage compatibility mapping
  stageMapping: {
    // Org types that work well with young builders
    highCompatibility: ['accelerator', 'grant', 'education', 'maker', 'hackathon', 'foundation'],
    mediumCompatibility: ['vc', 'startup', 'media', 'sponsor'],
    lowCompatibility: ['enterprise', 'government', 'manufacturing'],
  },
  
  // Opportunity categories
  opportunityCategories: [
    'invite',       // Event invitation
    'grant',        // Funding opportunity
    'scholarship',  // Educational access
    'partnership',  // Collaborative work
    'sponsorship',  // Resource support
    'collab',       // Project collaboration
    'learning',     // Learning access
    'pitch',        // Demo/pitch opportunity
  ] as const,
};

// ============================================
// PHASE A: VALUE FRAMING ENGINE - Configuration  
// ============================================
const VALUE_FRAMING_CONFIG = {
  // Value dimensions for Laksh
  lakshValueDimensions: {
    skillGrowth: 'New skills or deepened expertise',
    access: 'Access to resources, tools, or networks',
    validation: 'External recognition or credibility',
    resources: 'Financial or material support',
    narrative: 'Story that strengthens positioning',
  },
  
  // Value dimensions for counterparty
  counterpartyValueDimensions: {
    uniqueStory: '8-year-old hardware+AI builder narrative',
    technicalDepth: 'Real builds with working prototypes',
    demoReady: 'Projects ready to showcase',
    caseStudy: 'Compelling success story material',
    visibility: 'Social proof and community reach',
    relationship: 'Long-term relationship potential',
  },
  
  // Build highlights for framing
  buildHighlights: [
    { id: 'circuitheroes', label: 'CircuitHeroes', highlight: '300+ decks sold, trademark registered' },
    { id: 'motionx', label: 'MotionX', highlight: 'Full-body motion gaming system' },
    { id: 'drishtikon-yantra', label: 'Drishtikon Yantra', highlight: 'Vision-based assistive device' },
    { id: 'hardvare', label: 'Hardvare', highlight: 'Hardware safety platform' },
  ],
};

// ============================================
// PHASE A: ALIGNMENT ENGINE - Core Functions
// ============================================

interface AlignmentScore {
  total: number;
  breakdown: {
    clusterOverlap: number;
    buildRelevance: number;
    stageCompatibility: number;
    recency: number;
    domainSimilarity: number;
  };
  matchedClusters: string[];
  matchedDomains: string[];
  reasoning: string;
}

interface ValueFrame {
  forLaksh: {
    dimension: string;
    description: string;
    strength: 'high' | 'medium' | 'low';
  }[];
  forThem: {
    dimension: string;
    description: string;
    strength: 'high' | 'medium' | 'low';
  }[];
  mutualBenefit: string;
}

interface ComputedOpportunity {
  id: string;
  targetNodeId: string;
  targetLabel: string;
  category: typeof ALIGNMENT_ENGINE_CONFIG.opportunityCategories[number];
  alignmentScore: number;
  alignmentBreakdown: AlignmentScore['breakdown'];
  reasoning: string;
  matchedClusters: string[];
  supportingBuilds: string[];
  valueFrame: ValueFrame;
  suggestedAction: string;
  confidence: number;
}

/**
 * Calculate alignment score between an external node and Laksh
 */
async function calculateAlignment(
  db: D1Database,
  externalNode: any,
  lakshClusters: any[],
  lakshBuilds: any[],
  lakshSkills: any[]
): Promise<AlignmentScore> {
  const weights = ALIGNMENT_ENGINE_CONFIG.weights;
  const breakdown = {
    clusterOverlap: 0,
    buildRelevance: 0,
    stageCompatibility: 0,
    recency: 0,
    domainSimilarity: 0,
  };
  const matchedClusters: string[] = [];
  const matchedDomains: string[] = [];
  const reasoningParts: string[] = [];
  
  // Get node metadata
  const nodeDesc = (externalNode.description || '').toLowerCase();
  const nodeMeta = externalNode.meta || {};
  const nodeType = externalNode.type;
  
  // 1. CLUSTER OVERLAP (30%)
  // Check if external node's focus overlaps with Laksh's strong clusters
  for (const cluster of lakshClusters) {
    const clusterKeywords = cluster.core_skills || [];
    const clusterLevel = cluster.computedLevel || cluster.level || 1;
    
    // Check if node description mentions cluster keywords
    let matches = 0;
    for (const keyword of clusterKeywords) {
      if (nodeDesc.includes(keyword.toLowerCase())) {
        matches++;
      }
    }
    
    if (matches > 0) {
      // Weight by cluster level (stronger clusters = more valuable alignment)
      const clusterWeight = (clusterLevel / 5) * (matches / clusterKeywords.length);
      breakdown.clusterOverlap += clusterWeight * 100;
      matchedClusters.push(cluster.label);
    }
  }
  breakdown.clusterOverlap = Math.min(100, breakdown.clusterOverlap);
  
  if (matchedClusters.length > 0) {
    reasoningParts.push(`Overlaps with ${matchedClusters.join(', ')} clusters`);
  }
  
  // 2. BUILD RELEVANCE (25%)
  // Check if their work relates to Laksh's actual builds
  const buildKeywords = lakshBuilds.flatMap(b => [
    b.label?.toLowerCase(),
    ...(b.description || '').toLowerCase().split(' ').filter((w: string) => w.length > 4)
  ]).filter(Boolean);
  
  let buildMatches = 0;
  for (const keyword of buildKeywords) {
    if (nodeDesc.includes(keyword)) {
      buildMatches++;
    }
  }
  breakdown.buildRelevance = Math.min(100, (buildMatches / Math.max(1, buildKeywords.length * 0.1)) * 100);
  
  if (buildMatches > 2) {
    reasoningParts.push(`Relevant to ${buildMatches} of Laksh's builds`);
  }
  
  // 3. STAGE COMPATIBILITY (15%)
  // Young builder + org type compatibility
  const { highCompatibility, mediumCompatibility } = ALIGNMENT_ENGINE_CONFIG.stageMapping;
  
  const typeIndicators = nodeDesc.split(' ');
  let stageScore = 30; // Base score
  
  for (const indicator of highCompatibility) {
    if (nodeDesc.includes(indicator)) {
      stageScore = 100;
      reasoningParts.push(`High stage compatibility (${indicator})`);
      break;
    }
  }
  if (stageScore < 100) {
    for (const indicator of mediumCompatibility) {
      if (nodeDesc.includes(indicator) || nodeType === 'organization') {
        stageScore = 60;
        break;
      }
    }
  }
  
  // Boost if they've already supported Laksh
  const existingEdges = await db.prepare(
    `SELECT * FROM universe_edges WHERE 
     (source_id = ? AND target_id = 'lakshveer') OR 
     (source_id = 'lakshveer' AND target_id = ?)`
  ).bind(externalNode.id, externalNode.id).all();
  
  if ((existingEdges.results?.length || 0) > 0) {
    stageScore = Math.min(100, stageScore + 30);
    reasoningParts.push('Existing relationship');
  }
  
  breakdown.stageCompatibility = stageScore;
  
  // 4. RECENCY (15%)
  // Recent activity in relevant space
  const currentYear = 2026;
  const currentMonth = 2;
  
  // Check if org has recent activity
  let recencyScore = 50; // Default
  if (nodeMeta.lastActive || externalNode.timestamp) {
    const timestamp = nodeMeta.lastActive || externalNode.timestamp;
    const [year, month] = timestamp.split('-').map(Number);
    const monthsAgo = (currentYear - year) * 12 + (currentMonth - month);
    recencyScore = Math.max(0, 100 - monthsAgo * 5);
  }
  
  // Boost for known active orgs
  if (nodeMeta.grant || nodeMeta.accelerator || nodeDesc.includes('2026') || nodeDesc.includes('2025')) {
    recencyScore = Math.min(100, recencyScore + 20);
  }
  
  breakdown.recency = recencyScore;
  
  // 5. DOMAIN SIMILARITY (15%)
  // Keyword matching across domains
  const domains = ALIGNMENT_ENGINE_CONFIG.domainKeywords;
  
  for (const [domain, keywords] of Object.entries(domains)) {
    let domainMatches = 0;
    for (const keyword of keywords) {
      if (nodeDesc.includes(keyword)) {
        domainMatches++;
      }
    }
    if (domainMatches >= 2) {
      matchedDomains.push(domain);
      breakdown.domainSimilarity += (domainMatches / keywords.length) * 30;
    }
  }
  breakdown.domainSimilarity = Math.min(100, breakdown.domainSimilarity);
  
  if (matchedDomains.length > 0) {
    reasoningParts.push(`Domain match: ${matchedDomains.join(', ')}`);
  }
  
  // Calculate total
  const total = 
    breakdown.clusterOverlap * weights.clusterOverlap +
    breakdown.buildRelevance * weights.buildRelevance +
    breakdown.stageCompatibility * weights.stageCompatibility +
    breakdown.recency * weights.recency +
    breakdown.domainSimilarity * weights.domainSimilarity;
  
  return {
    total: Math.round(total),
    breakdown,
    matchedClusters,
    matchedDomains,
    reasoning: reasoningParts.length > 0 ? reasoningParts.join('. ') : 'Low alignment - no significant overlap detected',
  };
}

/**
 * Generate value framing for an opportunity
 */
function generateValueFrame(
  alignment: AlignmentScore,
  externalNode: any,
  category: string,
  lakshClusters: any[],
  lakshBuilds: any[]
): ValueFrame {
  const forLaksh: ValueFrame['forLaksh'] = [];
  const forThem: ValueFrame['forThem'] = [];
  
  // Value for Laksh based on category and alignment
  if (category === 'grant' || category === 'sponsorship') {
    forLaksh.push({
      dimension: 'Resources',
      description: 'Financial support for hardware builds and prototyping',
      strength: 'high',
    });
  }
  
  if (category === 'learning' || category === 'collab') {
    forLaksh.push({
      dimension: 'Skill Growth',
      description: `Deepen ${alignment.matchedClusters[0] || 'technical'} expertise through real collaboration`,
      strength: alignment.breakdown.clusterOverlap > 50 ? 'high' : 'medium',
    });
  }
  
  if (category === 'invite' || category === 'pitch') {
    forLaksh.push({
      dimension: 'Validation',
      description: 'External recognition from established organization',
      strength: alignment.breakdown.stageCompatibility > 60 ? 'high' : 'medium',
    });
    forLaksh.push({
      dimension: 'Network Access',
      description: 'Connection to their ecosystem and community',
      strength: 'medium',
    });
  }
  
  if (category === 'partnership') {
    forLaksh.push({
      dimension: 'Narrative',
      description: 'Partnership strengthens builder credibility',
      strength: 'high',
    });
  }
  
  // Default if none added
  if (forLaksh.length === 0) {
    forLaksh.push({
      dimension: 'Access',
      description: 'Opens doors to new resources and opportunities',
      strength: 'medium',
    });
  }
  
  // Value for Them - always include core Laksh differentiators
  forThem.push({
    dimension: 'Unique Story',
    description: '8-year-old hardware+AI builder with shipped products',
    strength: 'high',
  });
  
  // Find relevant builds to highlight
  const relevantBuilds = lakshBuilds.filter(b => 
    alignment.matchedClusters.some(c => 
      b.cluster_id?.includes(c.toLowerCase().replace(/\s+/g, '-'))
    )
  ).slice(0, 2);
  
  if (relevantBuilds.length > 0 || lakshBuilds.length > 0) {
    forThem.push({
      dimension: 'Demo-Ready Builds',
      description: `Working prototypes: ${(relevantBuilds.length > 0 ? relevantBuilds : lakshBuilds.slice(0, 2)).map(b => b.label).join(', ')}`,
      strength: 'high',
    });
  }
  
  if (category === 'media' || category === 'pitch') {
    forThem.push({
      dimension: 'Case Study',
      description: 'Compelling young maker story for content/PR',
      strength: 'high',
    });
  }
  
  forThem.push({
    dimension: 'Long-term Relationship',
    description: 'Early relationship with a builder on growth trajectory',
    strength: 'medium',
  });
  
  // Generate mutual benefit summary
  const mutual = `${externalNode.label} gains a unique young builder story and demo-ready projects. ` +
    `Laksh gains ${category === 'grant' ? 'resources' : category === 'learning' ? 'skill growth' : 'validation'} ` +
    `and access to their ${alignment.matchedDomains[0] || 'professional'} network.`;
  
  return {
    forLaksh,
    forThem,
    mutualBenefit: mutual,
  };
}

/**
 * Generate opportunities from alignment scores (replaces hardcoded patterns)
 */
async function generateAlignedOpportunities(db: D1Database): Promise<ComputedOpportunity[]> {
  const opportunities: ComputedOpportunity[] = [];
  
  // Get Laksh's data for alignment calculation
  const [clustersResult, buildsResult, skillsResult] = await Promise.all([
    db.prepare(`SELECT * FROM universe_clusters`).all(),
    db.prepare(`SELECT * FROM universe_nodes WHERE type = 'project' AND verification_status = 'verified'`).all(),
    db.prepare(`SELECT * FROM universe_nodes WHERE type = 'skill' AND verification_status = 'verified'`).all(),
  ]);
  
  const clusters = clustersResult.results || [];
  const builds = buildsResult.results || [];
  const skills = skillsResult.results || [];
  
  // Get external nodes (orgs, people, events)
  const externalNodes = await db.prepare(
    `SELECT * FROM universe_nodes 
     WHERE type IN ('organization', 'person', 'event', 'company') 
     AND verification_status = 'verified'
     AND id != 'lakshveer' AND id != 'capt-venkat'`
  ).all();
  
  // Calculate alignment for each external node
  for (const node of (externalNodes.results || []) as any[]) {
    const alignment = await calculateAlignment(db, node, clusters, builds, skills);
    
    // Only generate opportunity if alignment > threshold
    if (alignment.total < ALIGNMENT_ENGINE_CONFIG.opportunityThreshold) {
      continue;
    }
    
    // Determine opportunity category based on node type and metadata
    let category: typeof ALIGNMENT_ENGINE_CONFIG.opportunityCategories[number] = 'collab';
    const nodeDesc = (node.description || '').toLowerCase();
    const nodeMeta = node.meta || {};
    
    if (nodeMeta.grant || nodeDesc.includes('grant')) {
      category = 'grant';
    } else if (nodeDesc.includes('accelerator') || nodeDesc.includes('incubator')) {
      category = 'partnership';
    } else if (nodeDesc.includes('hackathon') || nodeDesc.includes('competition')) {
      category = 'invite';
    } else if (nodeDesc.includes('sponsor')) {
      category = 'sponsorship';
    } else if (nodeDesc.includes('media') || nodeDesc.includes('magazine') || nodeDesc.includes('press')) {
      category = 'pitch';
    } else if (node.type === 'event') {
      category = 'invite';
    } else if (node.type === 'person') {
      category = 'learning';
    }
    
    // Generate value framing
    const valueFrame = generateValueFrame(alignment, node, category, clusters, builds);
    
    // Find supporting builds
    const supportingBuilds = builds
      .filter((b: any) => alignment.matchedClusters.some(c => 
        b.cluster_id?.toLowerCase().includes(c.toLowerCase().replace(/\s+/g, '-'))
      ))
      .slice(0, 3)
      .map((b: any) => b.label);
    
    // Generate suggested action
    const actions: Record<string, string> = {
      grant: `Research ${node.label}'s current grant programs and application requirements`,
      invite: `Prepare demo of relevant builds for ${node.label} event`,
      sponsorship: `Draft sponsorship proposal highlighting mutual value`,
      partnership: `Schedule introductory call to explore collaboration`,
      collab: `Identify specific project for co-development`,
      learning: `Request mentorship session on ${alignment.matchedDomains[0] || 'relevant domain'}`,
      pitch: `Prepare 2-minute pitch deck and demo video`,
      scholarship: `Research ${node.label}'s scholarship criteria and deadlines`,
    };
    
    opportunities.push({
      id: `opp-aligned-${node.id}-${Date.now()}`,
      targetNodeId: node.id,
      targetLabel: node.label,
      category,
      alignmentScore: alignment.total,
      alignmentBreakdown: alignment.breakdown,
      reasoning: alignment.reasoning,
      matchedClusters: alignment.matchedClusters,
      supportingBuilds: supportingBuilds.length > 0 ? supportingBuilds : ['CircuitHeroes', 'MotionX'],
      valueFrame,
      suggestedAction: actions[category] || 'Explore collaboration opportunity',
      confidence: Math.min(100, alignment.total + (alignment.matchedClusters.length * 5)),
    });
  }
  
  // Sort by alignment score
  opportunities.sort((a, b) => b.alignmentScore - a.alignmentScore);
  
  return opportunities;
}

/**
 * Detect learning gaps from universe data
 */
async function detectLearningGaps(db: D1Database): Promise<any[]> {
  const gaps: any[] = [];
  
  // 1. Find incomplete nodes (missing key sections)
  const incompleteNodes = await db.prepare(
    `SELECT n.*, c.label as cluster_label, c.color as cluster_color
     FROM universe_nodes n
     LEFT JOIN universe_clusters c ON n.cluster_id = c.id
     WHERE n.verification_status = 'verified'`
  ).all();
  
  for (const node of (incompleteNodes.results || []) as any[]) {
    const sections = ['description', 'why_it_matters'];
    const arraySections = ['evidence', 'what_it_unlocked', 'what_it_enables', 'ways_to_help'];
    let missingCount = 0;
    const missingSections: string[] = [];
    
    for (const s of sections) {
      if (!node[s] || (node[s] as string).trim().length === 0) {
        missingCount++;
        missingSections.push(s);
      }
    }
    for (const s of arraySections) {
      try {
        const arr = JSON.parse(node[s] || '[]');
        if (!Array.isArray(arr) || arr.length === 0) {
          missingCount++;
          missingSections.push(s);
        }
      } catch {
        missingCount++;
        missingSections.push(s);
      }
    }
    
    // If more than 4 sections missing, flag as gap
    if (missingCount >= 4 && node.type !== 'person') {
      const config = GAP_ENGINE_CONFIG.gapTypes.incomplete_node;
      gaps.push({
        id: `gap-incomplete-${node.id}`,
        type: 'incomplete_node',
        label: `Complete ${node.label} documentation`,
        description: `Node is missing: ${missingSections.join(', ')}`,
        priority_score: config.priority * (node.impact_score || 50) / 100,
        effort_score: config.effort,
        roi_score: (config.priority * (node.impact_score || 50) / 100) / config.effort * 100,
        cluster_id: node.cluster_id,
        related_nodes: [node.id],
        missing_sections: missingSections,
        status: 'open',
      });
    }
  }
  
  // 2. Find weak clusters (level 1-2 with potential)
  const clusters = await db.prepare(`SELECT * FROM universe_clusters`).all();
  for (const cluster of (clusters.results || []) as any[]) {
    if (cluster.level <= 2 && (cluster.momentum || 0) < 50) {
      const config = GAP_ENGINE_CONFIG.gapTypes.weak_cluster;
      gaps.push({
        id: `gap-cluster-${cluster.id}`,
        type: 'weak_cluster',
        label: `Strengthen ${cluster.label}`,
        description: `Cluster at level ${cluster.level} with low momentum. Add more projects or skills.`,
        priority_score: config.priority * (1 - (cluster.level || 1) / 5),
        effort_score: config.effort,
        roi_score: config.priority / config.effort * 100,
        cluster_id: cluster.id,
        related_nodes: [],
        status: 'open',
      });
    }
  }
  
  // 3. Find missing skill connections (skills without projects using them)
  const skills = await db.prepare(
    `SELECT * FROM universe_nodes WHERE type = 'skill' AND verification_status = 'verified'`
  ).all();
  
  for (const skill of (skills.results || []) as any[]) {
    const usageEdges = await db.prepare(
      `SELECT COUNT(*) as count FROM universe_edges 
       WHERE (source_id = ? OR target_id = ?) AND type = 'USES' AND verification_status = 'verified'`
    ).bind(skill.id, skill.id).first();
    
    if ((usageEdges?.count as number || 0) < 2) {
      const config = GAP_ENGINE_CONFIG.gapTypes.missing_connection;
      gaps.push({
        id: `gap-skill-usage-${skill.id}`,
        type: 'missing_connection',
        label: `Apply ${skill.label} to more projects`,
        description: `Skill has ${usageEdges?.count || 0} project connections. Build something new with it.`,
        priority_score: config.priority * (skill.impact_score || 50) / 100,
        effort_score: config.effort,
        roi_score: config.priority / config.effort * 100,
        cluster_id: skill.cluster_id,
        related_nodes: [skill.id],
        status: 'open',
      });
    }
  }
  
  // 4. Find stale projects (completed but no recent activity)
  const staleProjects = await db.prepare(
    `SELECT * FROM universe_nodes 
     WHERE type = 'project' 
     AND status = 'completed' 
     AND verification_status = 'verified'
     AND timestamp < ?`
  ).bind('2025-06').all();
  
  for (const project of (staleProjects.results || []) as any[]) {
    const config = GAP_ENGINE_CONFIG.gapTypes.stale_project;
    gaps.push({
      id: `gap-stale-${project.id}`,
      type: 'stale_project',
      label: `Revive or evolve ${project.label}`,
      description: `Project completed in ${project.timestamp}. Consider iterating or evolving it.`,
      priority_score: config.priority * (project.impact_score || 50) / 100,
      effort_score: config.effort,
      roi_score: config.priority / config.effort * 100,
      cluster_id: project.cluster_id,
      related_nodes: [project.id],
      suggested_action: 'EVOLVED_INTO',
      status: 'open',
    });
  }
  
  // Sort by ROI score
  gaps.sort((a, b) => b.roi_score - a.roi_score);
  
  return gaps.slice(0, 20); // Return top 20 gaps
}

// ============================================
// CAPABILITY ENGINE: Scoring Functions
// ============================================

/**
 * Calculate weighted cluster score from its nodes
 */
async function calculateClusterScore(db: D1Database, clusterId: string): Promise<{
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
}> {
  // Get all nodes in cluster
  const nodesResult = await db.prepare(
    `SELECT * FROM universe_nodes WHERE cluster_id = ? AND verification_status = 'verified'`
  ).bind(clusterId).all();
  const nodes = nodesResult.results || [];
  
  // Get edges involving cluster nodes
  const nodeIds = nodes.map((n: any) => n.id);
  const edgesResult = await db.prepare(
    `SELECT * FROM universe_edges WHERE verification_status = 'verified'`
  ).all();
  const allEdges = edgesResult.results || [];
  
  if (nodes.length === 0) {
    return {
      level: 1,
      score: 0,
      components: { complexity: 0, crossCluster: 0, recency: 0, validation: 0, depth: 0 },
      velocity: 0,
      formula: 'No verified nodes in cluster',
    };
  }
  
  // 1. Project Complexity Score
  let complexitySum = 0;
  for (const node of nodes as any[]) {
    const typeWeight = SCORING_CONFIG.projectComplexity[node.type] || 0.3;
    const impactWeight = (node.impact_score || 50) / 100;
    complexitySum += typeWeight * impactWeight;
  }
  const complexity = Math.min(100, (complexitySum / nodes.length) * 100);
  
  // 2. Cross-Cluster Impact (edges connecting to other clusters)
  let crossClusterEdges = 0;
  for (const edge of allEdges as any[]) {
    const sourceNode = nodes.find((n: any) => n.id === edge.source_id);
    const targetNode = nodes.find((n: any) => n.id === edge.target_id);
    
    // Edge connects this cluster to another
    if ((sourceNode && !targetNode) || (!sourceNode && targetNode)) {
      crossClusterEdges++;
    }
  }
  const crossCluster = Math.min(100, (crossClusterEdges / Math.max(1, nodes.length)) * 50);
  
  // 3. Recency Score
  const now = new Date();
  let recencySum = 0;
  for (const node of nodes as any[]) {
    if (node.timestamp) {
      const [year, month] = node.timestamp.split('-').map(Number);
      const nodeDate = new Date(year, (month || 1) - 1);
      const monthsAgo = (now.getFullYear() - nodeDate.getFullYear()) * 12 + 
                        (now.getMonth() - nodeDate.getMonth());
      // Exponential decay
      const recencyWeight = Math.pow(0.5, monthsAgo / SCORING_CONFIG.recencyHalfLife);
      recencySum += recencyWeight;
    } else {
      recencySum += 0.5; // Default for undated
    }
  }
  const recency = Math.min(100, (recencySum / nodes.length) * 100);
  
  // 4. External Validation Score
  let validationScore = 0;
  for (const node of nodes as any[]) {
    if (node.type === 'award') validationScore += SCORING_CONFIG.validationMultipliers.award;
    if (node.type === 'event') validationScore += SCORING_CONFIG.validationMultipliers.hackathon_participant;
    if (node.type === 'endorsement') validationScore += SCORING_CONFIG.validationMultipliers.endorsement;
    
    // Check meta for additional validation
    try {
      const meta = JSON.parse(node.meta || '{}');
      if (meta.sales) validationScore += SCORING_CONFIG.validationMultipliers.sale;
      if (meta.grant) validationScore += SCORING_CONFIG.validationMultipliers.grant;
      if (meta.trademark) validationScore += SCORING_CONFIG.validationMultipliers.award * 0.5;
    } catch {}
  }
  const validation = Math.min(100, (validationScore / nodes.length) * 40);
  
  // 5. Repetition Depth (iteration maturity)
  // Count EVOLVED_INTO chains
  let maxChainLength = 0;
  for (const node of nodes as any[]) {
    let chainLength = 0;
    let currentId = node.id;
    const visited = new Set<string>();
    
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId);
      const evolvedEdge = (allEdges as any[]).find(
        e => e.target_id === currentId && e.type === 'EVOLVED_INTO'
      );
      if (evolvedEdge) {
        chainLength++;
        currentId = evolvedEdge.source_id;
      } else {
        break;
      }
    }
    maxChainLength = Math.max(maxChainLength, chainLength);
  }
  const depth = Math.min(100, maxChainLength * 25); // 4+ iterations = 100
  
  // Calculate weighted final score
  const { weights } = SCORING_CONFIG;
  const finalScore = 
    complexity * weights.complexity +
    crossCluster * weights.crossCluster +
    recency * weights.recency +
    validation * weights.validation +
    depth * weights.depth;
  
  // Determine level from score
  const level = SCORING_CONFIG.levelThresholds.reduce((lvl, threshold, idx) => 
    finalScore >= threshold ? idx + 1 : lvl, 1);
  
  // Calculate Growth Velocity (projects per month, weighted by complexity)
  const recentMonths = 3;
  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - recentMonths);
  
  let recentComplexitySum = 0;
  for (const node of nodes as any[]) {
    if (node.timestamp) {
      const [year, month] = node.timestamp.split('-').map(Number);
      const nodeDate = new Date(year, (month || 1) - 1);
      if (nodeDate >= cutoffDate) {
        const typeWeight = SCORING_CONFIG.projectComplexity[node.type] || 0.3;
        recentComplexitySum += typeWeight;
      }
    }
  }
  const velocity = recentComplexitySum / recentMonths;
  
  return {
    level,
    score: Math.round(finalScore * 10) / 10,
    components: {
      complexity: Math.round(complexity * 10) / 10,
      crossCluster: Math.round(crossCluster * 10) / 10,
      recency: Math.round(recency * 10) / 10,
      validation: Math.round(validation * 10) / 10,
      depth: Math.round(depth * 10) / 10,
    },
    velocity: Math.round(velocity * 100) / 100,
    formula: `Score = ${weights.complexity}×Complexity + ${weights.crossCluster}×CrossCluster + ${weights.recency}×Recency + ${weights.validation}×Validation + ${weights.depth}×Depth`,
  };
}

/**
 * Check node completeness for Node=World system
 */
function calculateNodeCompleteness(node: any): {
  score: number;
  filledSections: string[];
  missingSections: string[];
  isComplete: boolean;
} {
  const sections = [
    { key: 'description', label: 'What this node is' },
    { key: 'why_it_matters', label: 'Why it matters' },
    { key: 'evidence', label: 'Evidence', isArray: true },
    { key: 'what_it_unlocked', label: 'What it unlocked', isArray: true },
    { key: 'what_it_enables', label: 'What it enables next', isArray: true },
    { key: 'learning_gaps', label: 'Learning gaps', isArray: true },
    { key: 'ways_to_help', label: 'Ways someone can help', isArray: true },
  ];
  
  const filled: string[] = [];
  const missing: string[] = [];
  
  for (const section of sections) {
    let hasContent = false;
    
    if (section.isArray) {
      try {
        const arr = JSON.parse(node[section.key] || '[]');
        hasContent = Array.isArray(arr) && arr.length > 0;
      } catch {
        hasContent = false;
      }
    } else {
      hasContent = !!node[section.key] && node[section.key].trim().length > 0;
    }
    
    if (hasContent) {
      filled.push(section.label);
    } else {
      missing.push(section.label);
    }
  }
  
  return {
    score: Math.round((filled.length / sections.length) * 100),
    filledSections: filled,
    missingSections: missing,
    isComplete: filled.length >= 5,
  };
}

// ============================================
// HELPER: Get mode from request
// ============================================
function getMode(c: any): ViewMode {
  const authHeader = c.req.header('X-Universe-Auth');
  const modeParam = c.req.query('mode');
  
  // Check for private mode auth
  if (authHeader === process.env.UNIVERSE_PRIVATE_KEY || authHeader === 'laksh-private-2026') {
    return modeParam === 'partner' ? 'partner' : 'private';
  }
  
  return 'public';
}

// ============================================
// HELPER: Filter data based on mode
// ============================================
function filterByMode(data: any[], mode: ViewMode, field = 'verification_status') {
  if (mode === 'public') {
    return data.filter(item => item[field] === 'verified');
  }
  return data; // Private and partner see everything
}

// ============================================
// GET /universe/nodes - Get all nodes
// ============================================
universeApi.get('/nodes', async (c) => {
  const mode = getMode(c);
  const clusterId = c.req.query('cluster');
  const type = c.req.query('type');
  const search = c.req.query('search');
  
  try {
    let query = `SELECT * FROM universe_nodes WHERE 1=1`;
    const params: any[] = [];
    
    if (mode === 'public') {
      query += ` AND verification_status = 'verified'`;
    }
    
    if (clusterId) {
      query += ` AND cluster_id = ?`;
      params.push(clusterId);
    }
    
    if (type) {
      query += ` AND type = ?`;
      params.push(type);
    }
    
    if (search) {
      query += ` AND (label LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }
    
    query += ` ORDER BY momentum DESC, impact_score DESC`;
    
    const result = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      mode,
      count: result.results?.length || 0,
      nodes: result.results || []
    });
  } catch (error) {
    console.error('Get nodes error:', error);
    return c.json({ success: false, error: 'Failed to fetch nodes' }, 500);
  }
});

// ============================================
// GET /universe/nodes/:id - Node=World Full Detail
// ============================================
universeApi.get('/nodes/:id', async (c) => {
  const mode = getMode(c);
  const { id } = c.req.param();
  
  try {
    // Get node
    let nodeQuery = `SELECT * FROM universe_nodes WHERE id = ?`;
    if (mode === 'public') {
      nodeQuery += ` AND verification_status = 'verified'`;
    }
    
    const node = await c.env.DB.prepare(nodeQuery).bind(id).first();
    
    if (!node) {
      return c.json({ success: false, error: 'Node not found' }, 404);
    }
    
    // Get connected edges
    let edgesQuery = `
      SELECT e.*, 
        sn.label as source_label, sn.type as source_type,
        tn.label as target_label, tn.type as target_type
      FROM universe_edges e
      LEFT JOIN universe_nodes sn ON e.source_id = sn.id
      LEFT JOIN universe_nodes tn ON e.target_id = tn.id
      WHERE (e.source_id = ? OR e.target_id = ?)
    `;
    if (mode === 'public') {
      edgesQuery += ` AND e.verification_status = 'verified'`;
    }
    
    const edges = await c.env.DB.prepare(edgesQuery).bind(id, id).all();
    
    // Get cluster info if assigned
    let cluster = null;
    if ((node as any).cluster_id) {
      cluster = await c.env.DB.prepare(
        `SELECT * FROM universe_clusters WHERE id = ?`
      ).bind((node as any).cluster_id).first();
    }
    
    // Get learning gaps related to this node (private mode only)
    let learningGaps: any[] = [];
    if (mode !== 'public') {
      const gaps = await c.env.DB.prepare(
        `SELECT * FROM learning_gaps WHERE status = 'open'`
      ).all();
      
      // Filter gaps related to this node
      const nodeGapIds = JSON.parse((node as any).learning_gaps || '[]');
      learningGaps = (gaps.results || []).filter((g: any) => 
        nodeGapIds.includes(g.id) || g.suggested_collaborator === id
      );
    }
    
    // Parse JSON fields for node
    const parsedNode = {
      ...(node as any),
      evidence: JSON.parse((node as any).evidence || '[]'),
      what_it_unlocked: JSON.parse((node as any).what_it_unlocked || '[]'),
      what_it_enables: JSON.parse((node as any).what_it_enables || '[]'),
      learning_gaps: JSON.parse((node as any).learning_gaps || '[]'),
      ways_to_help: JSON.parse((node as any).ways_to_help || '[]'),
      meta: JSON.parse((node as any).meta || '{}'),
    };
    
    // NODE=WORLD: Build full context
    const nodeWorld = {
      whatThisIs: parsedNode.description,
      whyItMatters: parsedNode.why_it_matters,
      evidence: parsedNode.evidence,
      whatItUnlocked: [] as any[],
      whatItEnablesNext: parsedNode.what_it_enables,
      connectedGaps: learningGaps,
      waysToHelp: parsedNode.ways_to_help,
    };
    
    // Resolve whatItUnlocked node references
    if (parsedNode.what_it_unlocked.length > 0) {
      const unlockedIds = parsedNode.what_it_unlocked;
      const unlockedNodes = await c.env.DB.prepare(
        `SELECT id, label, type, cluster_id FROM universe_nodes WHERE id IN (${unlockedIds.map(() => '?').join(',')})`
      ).bind(...unlockedIds).all();
      nodeWorld.whatItUnlocked = unlockedNodes.results || [];
    }
    
    // Also include skills/capabilities gained from edges
    const unlockedFromEdges = (edges.results || [])
      .filter((e: any) => e.source_id === id && e.type === 'UNLOCKS')
      .map((e: any) => ({ id: e.target_id, label: e.target_label, type: e.target_type }));
    nodeWorld.whatItUnlocked = [...nodeWorld.whatItUnlocked, ...unlockedFromEdges];
    
    // Compute completeness (private mode only)
    let completeness = null;
    if (mode !== 'public') {
      completeness = calculateNodeCompleteness(node);
    }
    
    // Partner mode: Get ways to help and collaboration context
    let partnerContext = null;
    if (mode === 'partner' && ((node as any).type === 'person' || (node as any).type === 'organization')) {
      partnerContext = {
        waysToHelp: parsedNode.ways_to_help,
        relevantBuilds: [], // TODO: Compute based on their domain
        connectionPath: [], // TODO: How Laksh is connected
      };
    }
    
    return c.json({
      success: true,
      mode,
      node: parsedNode,
      nodeWorld,
      edges: edges.results || [],
      cluster,
      learningGaps,
      completeness,
      partnerContext,
    });
  } catch (error) {
    console.error('Get node error:', error);
    return c.json({ success: false, error: 'Failed to fetch node' }, 500);
  }
});

// ============================================
// GET /universe/edges - Get all edges
// ============================================
universeApi.get('/edges', async (c) => {
  const mode = getMode(c);
  const type = c.req.query('type');
  
  try {
    let query = `
      SELECT e.*, 
        sn.label as source_label, sn.type as source_type,
        tn.label as target_label, tn.type as target_type
      FROM universe_edges e
      LEFT JOIN universe_nodes sn ON e.source_id = sn.id
      LEFT JOIN universe_nodes tn ON e.target_id = tn.id
      WHERE 1=1
    `;
    const params: any[] = [];
    
    if (mode === 'public') {
      query += ` AND e.verification_status = 'verified'`;
    }
    
    if (type) {
      query += ` AND e.type = ?`;
      params.push(type);
    }
    
    query += ` ORDER BY e.weight DESC`;
    
    const result = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      mode,
      count: result.results?.length || 0,
      edges: result.results || []
    });
  } catch (error) {
    console.error('Get edges error:', error);
    return c.json({ success: false, error: 'Failed to fetch edges' }, 500);
  }
});

// ============================================
// GET /universe/clusters - Get all clusters with REAL scores
// ============================================
universeApi.get('/clusters', async (c) => {
  const mode = getMode(c);
  
  try {
    const clusters = await c.env.DB.prepare(
      `SELECT * FROM universe_clusters ORDER BY level DESC, momentum DESC`
    ).all();
    
    // Enrich with computed scores
    const enrichedClusters = await Promise.all(
      (clusters.results || []).map(async (cluster: any) => {
        // Get node count
        let countQuery = `SELECT COUNT(*) as count FROM universe_nodes WHERE cluster_id = ?`;
        if (mode === 'public') {
          countQuery += ` AND verification_status = 'verified'`;
        }
        const count = await c.env.DB.prepare(countQuery).bind(cluster.id).first();
        
        // Calculate real score (private mode shows formula)
        const scoring = await calculateClusterScore(c.env.DB, cluster.id);
        
        return {
          ...cluster,
          core_skills: JSON.parse(cluster.core_skills || '[]'),
          nodeCount: count?.count || 0,
          // Real computed values
          computedLevel: scoring.level,
          computedScore: scoring.score,
          growthVelocity: scoring.velocity,
          // Show formula in private mode
          ...(mode !== 'public' ? {
            scoreComponents: scoring.components,
            formula: scoring.formula,
          } : {}),
        };
      })
    );
    
    return c.json({
      success: true,
      mode,
      clusters: enrichedClusters,
      // Include scoring config in private mode for transparency
      ...(mode !== 'public' ? { scoringConfig: SCORING_CONFIG } : {}),
    });
  } catch (error) {
    console.error('Get clusters error:', error);
    return c.json({ success: false, error: 'Failed to fetch clusters' }, 500);
  }
});

// ============================================
// GET /universe/stats - Get universe statistics
// ============================================
universeApi.get('/stats', async (c) => {
  const mode = getMode(c);
  
  try {
    const verifiedFilter = mode === 'public' ? `WHERE verification_status = 'verified'` : '';
    
    const [nodes, edges, clusters] = await Promise.all([
      c.env.DB.prepare(`SELECT COUNT(*) as count, type FROM universe_nodes ${verifiedFilter} GROUP BY type`).all(),
      c.env.DB.prepare(`SELECT COUNT(*) as count FROM universe_edges ${verifiedFilter.replace('verification_status', 'verification_status')}`).first(),
      c.env.DB.prepare(`SELECT COUNT(*) as count FROM universe_clusters`).first(),
    ]);
    
    // Private mode: include pending counts
    let pendingStats = null;
    if (mode !== 'public') {
      const [pendingNodes, pendingEdges] = await Promise.all([
        c.env.DB.prepare(`SELECT COUNT(*) as count FROM universe_nodes WHERE verification_status = 'pending'`).first(),
        c.env.DB.prepare(`SELECT COUNT(*) as count FROM universe_edges WHERE verification_status = 'pending'`).first(),
      ]);
      pendingStats = {
        pendingNodes: pendingNodes?.count || 0,
        pendingEdges: pendingEdges?.count || 0,
      };
    }
    
    return c.json({
      success: true,
      mode,
      stats: {
        nodesByType: nodes.results || [],
        totalNodes: (nodes.results || []).reduce((sum: number, t: any) => sum + t.count, 0),
        totalEdges: edges?.count || 0,
        totalClusters: clusters?.count || 0,
        ...pendingStats,
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return c.json({ success: false, error: 'Failed to fetch stats' }, 500);
  }
});

// ============================================
// GET /universe/scoring-formula - Transparency endpoint
// ============================================
universeApi.get('/scoring-formula', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ 
      success: true,
      message: 'Cluster levels are calculated from project complexity, cross-cluster impact, recency, external validation, and iteration depth.',
    });
  }
  
  return c.json({
    success: true,
    config: SCORING_CONFIG,
    explanation: {
      complexity: 'Weighted by project type (products=1.0, projects=0.75, skills=0.5, etc.) × impact score',
      crossCluster: 'Number of edges connecting to other clusters / total nodes × 50',
      recency: 'Exponential decay with half-life of 6 months',
      validation: 'Multipliers for awards (1.8×), hackathons (1.5×), grants (1.7×), sales (1.6×), etc.',
      depth: 'Maximum EVOLVED_INTO chain length × 25 (capped at 100)',
      finalFormula: `Score = ${SCORING_CONFIG.weights.complexity}×Complexity + ${SCORING_CONFIG.weights.crossCluster}×CrossCluster + ${SCORING_CONFIG.weights.recency}×Recency + ${SCORING_CONFIG.weights.validation}×Validation + ${SCORING_CONFIG.weights.depth}×Depth`,
      levels: 'Level 1: 0-19, Level 2: 20-39, Level 3: 40-59, Level 4: 60-79, Level 5: 80-100',
    },
  });
});

// ============================================
// GET /universe/incomplete-nodes - Nodes needing more data
// ============================================
universeApi.get('/incomplete-nodes', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const nodes = await c.env.DB.prepare(
      `SELECT * FROM universe_nodes ORDER BY impact_score DESC`
    ).all();
    
    const incompleteNodes = (nodes.results || [])
      .map((node: any) => ({
        ...node,
        completeness: calculateNodeCompleteness(node),
      }))
      .filter((node: any) => !node.completeness.isComplete)
      .sort((a: any, b: any) => a.completeness.score - b.completeness.score);
    
    return c.json({
      success: true,
      count: incompleteNodes.length,
      nodes: incompleteNodes,
    });
  } catch (error) {
    console.error('Get incomplete nodes error:', error);
    return c.json({ success: false, error: 'Failed to fetch incomplete nodes' }, 500);
  }
});

// ============================================
// PRIVATE MODE ENDPOINTS
// ============================================
// PHASE 3: VERIFICATION + TRUST LAYER
// ============================================

// GET /universe/verification-queue - Enhanced with confidence scoring
universeApi.get('/verification-queue', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    // Get pending/inferred nodes
    const pendingNodes = await c.env.DB.prepare(
      `SELECT n.*, c.label as cluster_label, c.color as cluster_color
       FROM universe_nodes n
       LEFT JOIN universe_clusters c ON n.cluster_id = c.id
       WHERE n.verification_status IN ('pending', 'inferred')
       ORDER BY n.impact_score DESC, n.created_at DESC`
    ).all();
    
    // Get pending/inferred edges with confidence calculation
    const pendingEdgesRaw = await c.env.DB.prepare(
      `SELECT e.*, 
        sn.label as source_label, sn.type as source_type,
        tn.label as target_label, tn.type as target_type
       FROM universe_edges e
       LEFT JOIN universe_nodes sn ON e.source_id = sn.id
       LEFT JOIN universe_nodes tn ON e.target_id = tn.id
       WHERE e.verification_status IN ('pending', 'inferred')
       ORDER BY e.confidence_score DESC, e.created_at DESC`
    ).all();
    
    // Calculate confidence for each edge
    const pendingEdges = await Promise.all(
      (pendingEdgesRaw.results || []).map(async (edge: any) => {
        const confidence = await calculateEdgeConfidence(c.env.DB, edge);
        return {
          ...edge,
          calculatedConfidence: confidence.score,
          confidenceBreakdown: confidence.breakdown,
        };
      })
    );
    
    // Sort by calculated confidence
    pendingEdges.sort((a, b) => b.calculatedConfidence - a.calculatedConfidence);
    
    // Get stats
    const stats = {
      totalPendingNodes: (pendingNodes.results || []).length,
      totalPendingEdges: pendingEdges.length,
      highConfidenceEdges: pendingEdges.filter(e => e.calculatedConfidence >= 70).length,
      lowConfidenceEdges: pendingEdges.filter(e => e.calculatedConfidence < 50).length,
    };
    
    return c.json({
      success: true,
      pendingNodes: (pendingNodes.results || []).map((n: any) => ({
        ...n,
        evidence: JSON.parse(n.evidence || '[]'),
        meta: JSON.parse(n.meta || '{}'),
      })),
      pendingEdges,
      stats,
      confidenceConfig: CONFIDENCE_CONFIG,
    });
  } catch (error) {
    console.error('Get verification queue error:', error);
    return c.json({ success: false, error: 'Failed to fetch queue' }, 500);
  }
});

// POST /universe/verify - Enhanced with defer action and batch support
universeApi.post('/verify', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const { entityType, entityId, action, reason, edits } = await c.req.json();
    
    if (!entityType || !entityId || !action) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }
    
    const table = entityType === 'node' ? 'universe_nodes' : 'universe_edges';
    
    // Handle different actions
    let newStatus: string;
    switch (action) {
      case 'approve':
        newStatus = 'verified';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'defer':
        newStatus = 'pending'; // Keep as pending but log the defer
        break;
      default:
        return c.json({ success: false, error: 'Invalid action' }, 400);
    }
    
    // Get previous value for audit
    const previous = await c.env.DB.prepare(
      `SELECT * FROM ${table} WHERE id = ?`
    ).bind(entityId).first();
    
    if (!previous) {
      return c.json({ success: false, error: 'Entity not found' }, 404);
    }
    
    // Apply edits if provided (for edit action)
    if (edits && Object.keys(edits).length > 0) {
      const allowedFields = entityType === 'node' 
        ? ['label', 'description', 'why_it_matters', 'evidence', 'ways_to_help']
        : ['label', 'weight', 'evidence', 'inference_reason'];
      
      const updates: string[] = [];
      const params: any[] = [];
      
      for (const [key, value] of Object.entries(edits)) {
        if (allowedFields.includes(key)) {
          updates.push(`${key} = ?`);
          params.push(typeof value === 'object' ? JSON.stringify(value) : value);
        }
      }
      
      if (updates.length > 0) {
        updates.push('updated_at = CURRENT_TIMESTAMP');
        params.push(entityId);
        await c.env.DB.prepare(
          `UPDATE ${table} SET ${updates.join(', ')} WHERE id = ?`
        ).bind(...params).run();
      }
    }
    
    // Update status
    await c.env.DB.prepare(
      `UPDATE ${table} SET verification_status = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(newStatus, entityId).run();
    
    // Log to audit
    await c.env.DB.prepare(
      `INSERT INTO audit_log (id, action, entity_type, entity_id, previous_value, new_value, reason, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      `audit-${Date.now()}`,
      action,
      entityType,
      entityId,
      JSON.stringify(previous),
      JSON.stringify({ verification_status: newStatus, edits }),
      reason || null,
      'admin'
    ).run();
    
    return c.json({ success: true, status: newStatus, action });
  } catch (error) {
    console.error('Verify error:', error);
    return c.json({ success: false, error: 'Failed to verify' }, 500);
  }
});

// POST /universe/verify-batch - Batch verification
universeApi.post('/verify-batch', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const { items, action, reason } = await c.req.json();
    
    if (!items || !Array.isArray(items) || items.length === 0 || !action) {
      return c.json({ success: false, error: 'Missing required fields' }, 400);
    }
    
    const newStatus = action === 'approve' ? 'verified' : action === 'reject' ? 'rejected' : 'pending';
    const results: { id: string; success: boolean; error?: string }[] = [];
    
    for (const item of items) {
      try {
        const { entityType, entityId } = item;
        const table = entityType === 'node' ? 'universe_nodes' : 'universe_edges';
        
        // Get previous value
        const previous = await c.env.DB.prepare(
          `SELECT * FROM ${table} WHERE id = ?`
        ).bind(entityId).first();
        
        if (!previous) {
          results.push({ id: entityId, success: false, error: 'Not found' });
          continue;
        }
        
        // Update
        await c.env.DB.prepare(
          `UPDATE ${table} SET verification_status = ?, approved_at = CURRENT_TIMESTAMP WHERE id = ?`
        ).bind(newStatus, entityId).run();
        
        // Audit
        await c.env.DB.prepare(
          `INSERT INTO audit_log (id, action, entity_type, entity_id, previous_value, new_value, reason, created_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          `audit-${Date.now()}-${entityId}`,
          action,
          entityType,
          entityId,
          JSON.stringify(previous),
          JSON.stringify({ verification_status: newStatus }),
          reason || `Batch ${action}`,
          'admin'
        ).run();
        
        results.push({ id: entityId, success: true });
      } catch (e) {
        results.push({ id: item.entityId, success: false, error: String(e) });
      }
    }
    
    return c.json({
      success: true,
      processed: results.length,
      succeeded: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      results,
    });
  } catch (error) {
    console.error('Batch verify error:', error);
    return c.json({ success: false, error: 'Failed to batch verify' }, 500);
  }
});

// GET /universe/confidence-formula - Explain confidence scoring
universeApi.get('/confidence-formula', async (c) => {
  const mode = getMode(c);
  
  return c.json({
    success: true,
    config: mode !== 'public' ? CONFIDENCE_CONFIG : undefined,
    explanation: {
      overview: 'Edge confidence is calculated from source reliability, edge type, evidence, and co-occurrence',
      formula: '0.3×SourceReliability + 0.4×EdgeTypeBase + 0.2×EvidenceBoost + 0.1×CoOccurrence',
      sourceReliability: 'Manual=100, YouTube=75, Twitter=70, Notes=60, Inferred=40',
      edgeTypeConfidence: 'WON_AT=95 (verifiable), BUILT_WITH=90, UNLOCKS=50 (speculative)',
      evidenceBoost: '+10 per evidence link (max +30)',
      coOccurrenceBoost: '+5 per related edge (max +15)',
    },
  });
});

// GET /universe/audit-log - View verification history
universeApi.get('/audit-log', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const limit = parseInt(c.req.query('limit') || '50');
    const entityType = c.req.query('entity_type');
    const action = c.req.query('action');
    
    let query = `SELECT * FROM audit_log WHERE 1=1`;
    const params: any[] = [];
    
    if (entityType) {
      query += ` AND entity_type = ?`;
      params.push(entityType);
    }
    
    if (action) {
      query += ` AND action = ?`;
      params.push(action);
    }
    
    query += ` ORDER BY created_at DESC LIMIT ?`;
    params.push(limit);
    
    const logs = await c.env.DB.prepare(query).bind(...params).all();
    
    return c.json({
      success: true,
      logs: (logs.results || []).map((log: any) => ({
        ...log,
        previous_value: JSON.parse(log.previous_value || '{}'),
        new_value: JSON.parse(log.new_value || '{}'),
      })),
    });
  } catch (error) {
    console.error('Get audit log error:', error);
    return c.json({ success: false, error: 'Failed to fetch audit log' }, 500);
  }
});

// ============================================
// PHASE 4: LEARNING GAP + OPPORTUNITY ENDPOINTS
// ============================================

// GET /universe/learning-gaps - Auto-detect learning gaps from universe data
universeApi.get('/learning-gaps', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    // First check for manually added gaps in DB
    const manualGaps = await c.env.DB.prepare(
      `SELECT g.*, c.label as cluster_label, c.color as cluster_color
       FROM learning_gaps g
       LEFT JOIN universe_clusters c ON g.cluster_id = c.id
       WHERE g.status = 'open'
       ORDER BY g.priority_score DESC, g.roi_score DESC`
    ).all();
    
    // Then auto-detect gaps
    const autoGaps = await detectLearningGaps(c.env.DB);
    
    // Combine, removing duplicates
    const manualIds = new Set((manualGaps.results || []).map((g: any) => g.id));
    const combinedGaps = [
      ...(manualGaps.results || []),
      ...autoGaps.filter(g => !manualIds.has(g.id)),
    ];
    
    // Get cluster colors for auto-detected gaps
    const clusters = await c.env.DB.prepare(`SELECT id, color, label FROM universe_clusters`).all();
    const clusterMap: Record<string, any> = {};
    for (const c of (clusters.results || []) as any[]) {
      clusterMap[c.id] = { color: c.color, label: c.label };
    }
    
    return c.json({
      success: true,
      gaps: combinedGaps.map((gap: any) => ({
        ...gap,
        cluster_label: gap.cluster_label || clusterMap[gap.cluster_id]?.label,
        cluster_color: gap.cluster_color || clusterMap[gap.cluster_id]?.color,
        is_auto_detected: !manualIds.has(gap.id),
      })),
      stats: {
        total: combinedGaps.length,
        manual: manualGaps.results?.length || 0,
        autoDetected: autoGaps.length,
        byType: {
          incomplete_node: autoGaps.filter(g => g.type === 'incomplete_node').length,
          weak_cluster: autoGaps.filter(g => g.type === 'weak_cluster').length,
          missing_connection: autoGaps.filter(g => g.type === 'missing_connection').length,
          stale_project: autoGaps.filter(g => g.type === 'stale_project').length,
        },
      },
      config: GAP_ENGINE_CONFIG,
    });
  } catch (error) {
    console.error('Get learning gaps error:', error);
    return c.json({ success: false, error: 'Failed to fetch gaps' }, 500);
  }
});

// POST /universe/learning-gaps - Add manual learning gap
universeApi.post('/learning-gaps', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const data = await c.req.json();
    const id = data.id || `gap-manual-${Date.now()}`;
    
    await c.env.DB.prepare(
      `INSERT INTO learning_gaps (id, type, label, description, priority_score, effort_score, roi_score, 
        cluster_id, related_nodes, suggested_action, suggested_collaborator, blocks_next_level, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      data.type || 'missing_skill',
      data.label,
      data.description || null,
      data.priority_score || 50,
      data.effort_score || 50,
      data.roi_score || ((data.priority_score || 50) / (data.effort_score || 50) * 100),
      data.cluster_id || null,
      JSON.stringify(data.related_nodes || []),
      data.suggested_action || null,
      data.suggested_collaborator || null,
      data.blocks_next_level || 0,
      'open'
    ).run();
    
    return c.json({ success: true, id });
  } catch (error) {
    console.error('Create learning gap error:', error);
    return c.json({ success: false, error: 'Failed to create gap' }, 500);
  }
});

// PATCH /universe/learning-gaps/:id - Close or update a gap
universeApi.patch('/learning-gaps/:id', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const { id } = c.req.param();
    const { status, notes } = await c.req.json();
    
    await c.env.DB.prepare(
      `UPDATE learning_gaps SET status = ?, closed_at = CURRENT_TIMESTAMP WHERE id = ?`
    ).bind(status || 'closed', id).run();
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Update learning gap error:', error);
    return c.json({ success: false, error: 'Failed to update gap' }, 500);
  }
});

// ============================================
// INTELLIGENT OPPORTUNITY ENGINE v3
// Graph traversal + Pattern matching + LLM reasoning
// ============================================

// GET /universe/opportunities/intelligent - Graph-based intelligent opportunities with LLM
universeApi.get('/opportunities/intelligent', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    // Load all nodes and edges
    const [nodesResult, edgesResult, clustersResult] = await Promise.all([
      c.env.DB.prepare(`SELECT * FROM universe_nodes WHERE verification_status = 'verified'`).all(),
      c.env.DB.prepare(`SELECT * FROM universe_edges WHERE verification_status = 'verified'`).all(),
      c.env.DB.prepare(`SELECT * FROM universe_clusters`).all(),
    ]);
    
    const nodes = (nodesResult.results || []).map((n: any) => ({
      id: n.id,
      label: n.label,
      type: n.type,
      description: n.description || '',
      cluster_id: n.cluster_id,
      impact_score: n.impact_score || 50,
      momentum: n.momentum || 50,
      meta: n.meta ? JSON.parse(n.meta) : {},
      url: n.url,
    }));
    
    const edges = (edgesResult.results || []).map((e: any) => ({
      id: e.id,
      source_id: e.source_id,
      target_id: e.target_id,
      type: e.type,
      label: e.label,
      weight: e.weight || 50,
    }));
    
    const clusters = (clustersResult.results || []).map((c: any) => ({
      id: c.id,
      label: c.label,
      description: c.description,
      color: c.color,
      level: c.level || 1,
      momentum: c.momentum || 50,
      core_skills: c.core_skills ? JSON.parse(c.core_skills) : [],
    }));
    
    // Build Laksh's context
    const lakshNode = nodes.find((n: any) => n.id === 'lakshveer');
    const lakshMeta = lakshNode?.meta || {};
    
    // Get key builds
    const projectNodes = nodes.filter((n: any) => n.type === 'project' || n.type === 'product');
    const keyBuilds = projectNodes.slice(0, 5).map((n: any) => n.label);
    
    // Get key skills
    const skillNodes = nodes.filter((n: any) => n.type === 'skill');
    const keySkills = skillNodes.map((n: any) => n.label);
    
    // Get achievements
    const awardNodes = nodes.filter((n: any) => n.type === 'award');
    const keyAchievements = awardNodes.map((n: any) => n.label);
    
    // Get existing connections
    const personNodes = nodes.filter((n: any) => n.type === 'person' && n.id !== 'lakshveer' && n.id !== 'capt-venkat');
    const existingConnections = personNodes.map((n: any) => n.label);
    
    // Recent activity from events
    const eventNodes = nodes.filter((n: any) => n.type === 'event');
    const recentActivity = eventNodes.slice(0, 5).map((n: any) => n.label);
    
    const context: OpportunityContext = {
      lakshProfile: {
        age: lakshMeta.age || 8,
        location: lakshMeta.location || 'Hyderabad, India',
        headline: lakshNode?.description || 'Hardware + AI Systems Builder',
        keyBuilds,
        keySkills,
        keyAchievements,
      },
      clusters,
      recentActivity,
      existingConnections,
    };
    
    // Build enhanced graph
    const graph = new EnhancedGraphTraversal(nodes, edges);
    
    // Create generator (without LLM for now - can enable later with OpenAI key)
    const generator = new LLMOpportunityGenerator(graph, clusters, context);
    
    // Generate opportunities
    const result = await generator.generateAllOpportunities();
    
    // Also generate using old engine for comparison/fallback
    const oldGraph = new GraphTraversal(nodes, edges);
    const oldGenerator = new OpportunityGenerator(oldGraph, clusters);
    const oldOpportunities = oldGenerator.generateOpportunities();
    
    // Merge, dedupe by title
    const seenTitles = new Set(result.opportunities.map(o => o.title.toLowerCase()));
    const mergedOpps = [
      ...result.opportunities,
      ...oldOpportunities.filter(o => !seenTitles.has(o.title.toLowerCase())),
    ];
    
    // Get node opportunity counts (for visual indicators)
    const nodeOpportunities: Record<string, { count: number; types: string[] }> = {};
    for (const opp of mergedOpps) {
      for (const nodeId of opp.pathNodes) {
        if (!nodeOpportunities[nodeId]) {
          nodeOpportunities[nodeId] = { count: 0, types: [] };
        }
        nodeOpportunities[nodeId].count++;
        if (!nodeOpportunities[nodeId].types.includes(opp.type)) {
          nodeOpportunities[nodeId].types.push(opp.type);
        }
      }
      if (opp.targetNodeId && !nodeOpportunities[opp.targetNodeId]) {
        nodeOpportunities[opp.targetNodeId] = { count: 0, types: [] };
      }
      if (opp.targetNodeId) {
        nodeOpportunities[opp.targetNodeId].count++;
        if (!nodeOpportunities[opp.targetNodeId].types.includes(opp.type)) {
          nodeOpportunities[opp.targetNodeId].types.push(opp.type);
        }
      }
    }
    
    // Group by type
    const byType = mergedOpps.reduce((acc, o) => {
      acc[o.type] = (acc[o.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return c.json({
      success: true,
      opportunities: mergedOpps,
      stats: {
        total: mergedOpps.length,
        byType,
        bySource: {
          graph: mergedOpps.filter(o => o.source === 'graph').length,
          llm: mergedOpps.filter(o => o.source === 'llm').length,
          hybrid: mergedOpps.filter(o => o.source === 'hybrid').length,
          legacy: mergedOpps.filter(o => !o.source).length,
        },
      },
      nodeOpportunities, // For visual indicators on graph
      graphInfo: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        clusterCount: clusters.length,
      },
    });
  } catch (error) {
    console.error('Intelligent opportunities error:', error);
    return c.json({ success: false, error: 'Failed to generate intelligent opportunities' }, 500);
  }
});

// GET /universe/opportunities/for-node/:nodeId - Get opportunities involving a specific node
universeApi.get('/opportunities/for-node/:nodeId', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const { nodeId } = c.req.param();
    
    // Load all nodes and edges
    const [nodesResult, edgesResult, clustersResult] = await Promise.all([
      c.env.DB.prepare(`SELECT * FROM universe_nodes WHERE verification_status = 'verified'`).all(),
      c.env.DB.prepare(`SELECT * FROM universe_edges WHERE verification_status = 'verified'`).all(),
      c.env.DB.prepare(`SELECT * FROM universe_clusters`).all(),
    ]);
    
    const nodes = (nodesResult.results || []).map((n: any) => ({
      id: n.id,
      label: n.label,
      type: n.type,
      description: n.description,
      cluster_id: n.cluster_id,
      impact_score: n.impact_score,
      meta: n.meta ? JSON.parse(n.meta) : {},
    }));
    
    const edges = (edgesResult.results || []).map((e: any) => ({
      id: e.id,
      source_id: e.source_id,
      target_id: e.target_id,
      type: e.type,
      label: e.label,
      weight: e.weight,
    }));
    
    const clusters = clustersResult.results || [];
    
    // Build graph and generate all opportunities
    const graph = new GraphTraversal(nodes, edges);
    const generator = new OpportunityGenerator(graph, clusters);
    const allOpportunities = generator.generateOpportunities();
    
    // Filter to opportunities involving this node
    const nodeOpportunities = allOpportunities.filter(opp => 
      opp.pathNodes.includes(nodeId) || opp.targetNodeId === nodeId
    );
    
    // Get node details
    const nodeDetails = graph.getNode(nodeId);
    
    return c.json({
      success: true,
      node: nodeDetails,
      opportunities: nodeOpportunities,
      count: nodeOpportunities.length,
    });
  } catch (error) {
    console.error('Node opportunities error:', error);
    return c.json({ success: false, error: 'Failed to get node opportunities' }, 500);
  }
});

// GET /universe/opportunities - Auto-detect opportunities based on alignment engine
universeApi.get('/opportunities', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    // Get manual opportunities from DB
    const manualOpps = await c.env.DB.prepare(
      `SELECT * FROM opportunities WHERE status = 'suggested' OR status = 'approved'
       ORDER BY confidence_score DESC`
    ).all();
    
    // Generate aligned opportunities using the alignment engine
    const alignedOpps = await generateAlignedOpportunities(c.env.DB);
    
    // Combine manual + auto-detected
    const manualIds = new Set((manualOpps.results || []).map((o: any) => o.id));
    const combinedOpps = [
      // Manual opportunities (stored in DB)
      ...(manualOpps.results || []).map((opp: any) => ({
        ...opp,
        related_nodes: JSON.parse(opp.related_nodes || '[]'),
        related_clusters: JSON.parse(opp.related_clusters || '[]'),
        is_auto_detected: false,
        source: 'manual',
      })),
      // Alignment-based opportunities
      ...alignedOpps.filter(o => !manualIds.has(o.id)).map(o => ({
        id: o.id,
        label: `${o.category.charAt(0).toUpperCase() + o.category.slice(1)}: ${o.targetLabel}`,
        description: o.reasoning,
        reasoning: o.reasoning,
        confidence_score: o.confidence,
        related_nodes: [o.targetNodeId],
        related_clusters: o.matchedClusters,
        suggested_action: o.suggestedAction,
        timeframe: 'immediate',
        status: 'suggested',
        is_auto_detected: true,
        source: 'alignment_engine',
        // Phase A: Alignment breakdown for transparency
        alignment: {
          score: o.alignmentScore,
          breakdown: o.alignmentBreakdown,
          matchedClusters: o.matchedClusters,
          supportingBuilds: o.supportingBuilds,
        },
        // Phase A: Value framing for dual-value communication
        valueFrame: o.valueFrame,
        category: o.category,
        targetNodeId: o.targetNodeId,
      })),
    ];
    
    // Group by category for stats
    const byCategory = alignedOpps.reduce((acc, o) => {
      acc[o.category] = (acc[o.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return c.json({
      success: true,
      opportunities: combinedOpps,
      stats: {
        total: combinedOpps.length,
        manual: manualOpps.results?.length || 0,
        autoDetected: alignedOpps.length,
        byCategory,
        alignmentThreshold: ALIGNMENT_ENGINE_CONFIG.opportunityThreshold,
      },
      config: ALIGNMENT_ENGINE_CONFIG,
    });
  } catch (error) {
    console.error('Get opportunities error:', error);
    return c.json({ success: false, error: 'Failed to fetch opportunities' }, 500);
  }
});

// GET /universe/alignment/:nodeId - Get alignment score for a specific node
universeApi.get('/alignment/:nodeId', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const { nodeId } = c.req.param();
    
    // Get the target node
    const targetNode = await c.env.DB.prepare(
      `SELECT * FROM universe_nodes WHERE id = ?`
    ).bind(nodeId).first();
    
    if (!targetNode) {
      return c.json({ success: false, error: 'Node not found' }, 404);
    }
    
    // Get Laksh's data
    const [clustersResult, buildsResult, skillsResult] = await Promise.all([
      c.env.DB.prepare(`SELECT * FROM universe_clusters`).all(),
      c.env.DB.prepare(`SELECT * FROM universe_nodes WHERE type = 'project' AND verification_status = 'verified'`).all(),
      c.env.DB.prepare(`SELECT * FROM universe_nodes WHERE type = 'skill' AND verification_status = 'verified'`).all(),
    ]);
    
    const clusters = clustersResult.results || [];
    const builds = buildsResult.results || [];
    const skills = skillsResult.results || [];
    
    // Calculate alignment
    const alignment = await calculateAlignment(c.env.DB, targetNode, clusters, builds, skills);
    
    // Determine category
    const nodeDesc = ((targetNode as any).description || '').toLowerCase();
    let category = 'collab';
    if (nodeDesc.includes('grant')) category = 'grant';
    else if (nodeDesc.includes('accelerator') || nodeDesc.includes('incubator')) category = 'partnership';
    else if (nodeDesc.includes('hackathon') || nodeDesc.includes('competition')) category = 'invite';
    else if (nodeDesc.includes('sponsor')) category = 'sponsorship';
    else if (nodeDesc.includes('media')) category = 'pitch';
    else if ((targetNode as any).type === 'person') category = 'learning';
    
    // Generate value framing
    const valueFrame = generateValueFrame(alignment, targetNode, category, clusters, builds);
    
    // Find supporting builds
    const supportingBuilds = builds
      .filter((b: any) => alignment.matchedClusters.some(c => 
        b.cluster_id?.toLowerCase().includes(c.toLowerCase().replace(/\s+/g, '-'))
      ))
      .slice(0, 5)
      .map((b: any) => ({
        id: b.id,
        label: b.label,
        clusterId: b.cluster_id,
      }));
    
    return c.json({
      success: true,
      node: {
        id: (targetNode as any).id,
        label: (targetNode as any).label,
        type: (targetNode as any).type,
        description: (targetNode as any).description,
      },
      alignment: {
        score: alignment.total,
        meetsThreshold: alignment.total >= ALIGNMENT_ENGINE_CONFIG.opportunityThreshold,
        threshold: ALIGNMENT_ENGINE_CONFIG.opportunityThreshold,
        breakdown: {
          clusterOverlap: {
            score: Math.round(alignment.breakdown.clusterOverlap),
            weight: ALIGNMENT_ENGINE_CONFIG.weights.clusterOverlap,
            weighted: Math.round(alignment.breakdown.clusterOverlap * ALIGNMENT_ENGINE_CONFIG.weights.clusterOverlap),
            matchedClusters: alignment.matchedClusters,
          },
          buildRelevance: {
            score: Math.round(alignment.breakdown.buildRelevance),
            weight: ALIGNMENT_ENGINE_CONFIG.weights.buildRelevance,
            weighted: Math.round(alignment.breakdown.buildRelevance * ALIGNMENT_ENGINE_CONFIG.weights.buildRelevance),
            supportingBuilds,
          },
          stageCompatibility: {
            score: Math.round(alignment.breakdown.stageCompatibility),
            weight: ALIGNMENT_ENGINE_CONFIG.weights.stageCompatibility,
            weighted: Math.round(alignment.breakdown.stageCompatibility * ALIGNMENT_ENGINE_CONFIG.weights.stageCompatibility),
          },
          recency: {
            score: Math.round(alignment.breakdown.recency),
            weight: ALIGNMENT_ENGINE_CONFIG.weights.recency,
            weighted: Math.round(alignment.breakdown.recency * ALIGNMENT_ENGINE_CONFIG.weights.recency),
          },
          domainSimilarity: {
            score: Math.round(alignment.breakdown.domainSimilarity),
            weight: ALIGNMENT_ENGINE_CONFIG.weights.domainSimilarity,
            weighted: Math.round(alignment.breakdown.domainSimilarity * ALIGNMENT_ENGINE_CONFIG.weights.domainSimilarity),
            matchedDomains: alignment.matchedDomains,
          },
        },
        reasoning: alignment.reasoning,
      },
      valueFrame,
      suggestedCategory: category,
      config: {
        weights: ALIGNMENT_ENGINE_CONFIG.weights,
        threshold: ALIGNMENT_ENGINE_CONFIG.opportunityThreshold,
      },
    });
  } catch (error) {
    console.error('Get alignment error:', error);
    return c.json({ success: false, error: 'Failed to calculate alignment' }, 500);
  }
});

// POST /universe/opportunities - Add manual opportunity
universeApi.post('/opportunities', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const data = await c.req.json();
    const id = data.id || `opp-manual-${Date.now()}`;
    
    await c.env.DB.prepare(
      `INSERT INTO opportunities (id, label, description, reasoning, confidence_score, 
        related_nodes, related_clusters, suggested_action, timeframe, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      data.label,
      data.description || null,
      data.reasoning || 'Manually added',
      data.confidence_score || 70,
      JSON.stringify(data.related_nodes || []),
      JSON.stringify(data.related_clusters || []),
      data.suggested_action || null,
      data.timeframe || null,
      'suggested'
    ).run();
    
    return c.json({ success: true, id });
  } catch (error) {
    console.error('Create opportunity error:', error);
    return c.json({ success: false, error: 'Failed to create opportunity' }, 500);
  }
});

// PATCH /universe/opportunities/:id - Approve or reject opportunity
universeApi.patch('/opportunities/:id', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const { id } = c.req.param();
    const { status, rejected_reason } = await c.req.json();
    
    if (status === 'approved') {
      await c.env.DB.prepare(
        `UPDATE opportunities SET status = 'approved', approved_at = CURRENT_TIMESTAMP WHERE id = ?`
      ).bind(id).run();
    } else if (status === 'rejected') {
      await c.env.DB.prepare(
        `UPDATE opportunities SET status = 'rejected', rejected_reason = ? WHERE id = ?`
      ).bind(rejected_reason || null, id).run();
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Update opportunity error:', error);
    return c.json({ success: false, error: 'Failed to update opportunity' }, 500);
  }
});

// GET /universe/outreach-queue - Get outreach drafts
universeApi.get('/outreach-queue', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const outreach = await c.env.DB.prepare(
      `SELECT o.*, n.label as target_node_label, n.type as target_node_type
       FROM outreach_queue o
       LEFT JOIN universe_nodes n ON o.target_node_id = n.id
       WHERE o.status IN ('draft', 'reviewed')
       ORDER BY o.created_at DESC`
    ).all();
    
    return c.json({
      success: true,
      outreach: (outreach.results || []).map((item: any) => ({
        ...item,
        proof_links: JSON.parse(item.proof_links || '[]'),
      }))
    });
  } catch (error) {
    console.error('Get outreach queue error:', error);
    return c.json({ success: false, error: 'Failed to fetch outreach' }, 500);
  }
});

// ============================================
// POST /universe/generate-outreach - Generate alignment-aware outreach draft
// ============================================
universeApi.post('/generate-outreach', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const { nodeId, context, specificAsk, opportunityId } = await c.req.json();
    
    // Get the target node
    const targetNode = await c.env.DB.prepare(
      `SELECT * FROM universe_nodes WHERE id = ?`
    ).bind(nodeId).first();
    
    if (!targetNode) {
      return c.json({ success: false, error: 'Node not found' }, 404);
    }
    
    // Get Laksh's data for alignment calculation
    const [clustersResult, buildsResult, skillsResult] = await Promise.all([
      c.env.DB.prepare(`SELECT * FROM universe_clusters`).all(),
      c.env.DB.prepare(`SELECT * FROM universe_nodes WHERE type = 'project' AND verification_status = 'verified'`).all(),
      c.env.DB.prepare(`SELECT * FROM universe_nodes WHERE type = 'skill' AND verification_status = 'verified'`).all(),
    ]);
    
    const clusters = clustersResult.results || [];
    const builds = buildsResult.results || [];
    const skills = skillsResult.results || [];
    
    // Calculate alignment for this specific target
    const alignment = await calculateAlignment(c.env.DB, targetNode, clusters, builds, skills);
    
    // Determine opportunity category from node type
    const nodeDesc = ((targetNode as any).description || '').toLowerCase();
    let category = 'collab';
    if (nodeDesc.includes('grant')) category = 'grant';
    else if (nodeDesc.includes('accelerator') || nodeDesc.includes('incubator')) category = 'partnership';
    else if (nodeDesc.includes('hackathon') || nodeDesc.includes('competition')) category = 'invite';
    else if (nodeDesc.includes('sponsor')) category = 'sponsorship';
    else if (nodeDesc.includes('media')) category = 'pitch';
    else if ((targetNode as any).type === 'person') category = 'learning';
    
    // Generate value framing
    const valueFrame = generateValueFrame(alignment, targetNode, category, clusters, builds);
    
    // Find supporting builds that match the alignment
    const supportingBuilds = builds
      .filter((b: any) => alignment.matchedClusters.some(c => 
        b.cluster_id?.toLowerCase().includes(c.toLowerCase().replace(/\s+/g, '-'))
      ))
      .slice(0, 3);
    
    // Use CircuitHeroes and MotionX if no specific matches
    const relevantBuilds = supportingBuilds.length > 0 
      ? supportingBuilds 
      : builds.filter((b: any) => ['circuitheroes', 'motionx', 'drishtikon-yantra'].includes(b.id)).slice(0, 2);
    
    // Get key build highlights
    const buildHighlights = VALUE_FRAMING_CONFIG.buildHighlights;
    const highlightedBuilds = relevantBuilds.map((b: any) => {
      const highlight = buildHighlights.find(h => h.id === b.id);
      return {
        label: b.label,
        description: b.description,
        highlight: highlight?.highlight || b.description?.split('.')[0],
      };
    });
    
    // Generate subject line based on alignment
    const subjectOptions: Record<string, string> = {
      grant: `Young hardware builder seeking ${(targetNode as any).label} support`,
      invite: `8yo builder demo request for ${(targetNode as any).label}`,
      sponsorship: `Partnership opportunity: Young hardware+AI builder`,
      partnership: `Collaboration interest from young hardware builder`,
      collab: `From an 8-year-old building at the hardware+AI intersection`,
      learning: `Seeking mentorship: 8yo hardware builder`,
      pitch: `Story pitch: 8-year-old hardware+AI builder from India`,
      scholarship: `Application inquiry: Young builder seeking ${(targetNode as any).label}`,
    };
    
    // Generate draft with alignment-aware content
    const draft = {
      id: `outreach-${Date.now()}`,
      target_node_id: nodeId,
      target_name: (targetNode as any).label,
      target_contact: null,
      trigger_type: opportunityId ? 'opportunity' : 'manual',
      trigger_node_id: opportunityId || null,
      subject: subjectOptions[category] || subjectOptions.collab,
      
      // Enhanced draft with alignment + value framing
      draft: `Hi ${(targetNode as any).label.split(' ')[0]},

I'm Laksh, an 8-year-old hardware and AI systems builder from Hyderabad, India. I've been building since I was 4.

${alignment.reasoning ? `I found ${(targetNode as any).label} particularly interesting because ${alignment.reasoning.toLowerCase()}.` : `I came across your work and thought there might be an opportunity to connect.`}

${context || ''}

**What I've built:**
${highlightedBuilds.map((b: any) => `• **${b.label}**: ${b.highlight}`).join('\n')}

**Why this matters for both of us:**
${valueFrame.mutualBenefit}

${specificAsk || valueFrame.forLaksh[0]?.description ? `**My ask:** ${specificAsk || `I'd love to explore ${category === 'grant' ? 'funding support' : category === 'learning' ? 'mentorship' : category === 'invite' ? 'participating in your events' : 'collaboration'} given our alignment on ${alignment.matchedClusters[0] || 'hardware+AI'}.`}` : ''}

Best,
Laksh
(with help from Dad - @CaptVenk on X)

---
*This is a draft. Review before sending.*`,
      
      context: context || null,
      specific_ask: specificAsk || null,
      proof_links: JSON.stringify(relevantBuilds.map((b: any) => b.url).filter(Boolean)),
      status: 'draft',
      created_at: new Date().toISOString(),
      
      // Phase A: Include alignment metadata for transparency
      alignment_data: {
        score: alignment.total,
        breakdown: alignment.breakdown,
        matchedClusters: alignment.matchedClusters,
        matchedDomains: alignment.matchedDomains,
        reasoning: alignment.reasoning,
      },
      value_frame: valueFrame,
      category,
      supporting_builds: highlightedBuilds,
    };
    
    // Save to queue
    await c.env.DB.prepare(
      `INSERT INTO outreach_queue (id, target_node_id, target_name, trigger_type, subject, draft, context, specific_ask, proof_links, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      draft.id,
      draft.target_node_id,
      draft.target_name,
      draft.trigger_type,
      draft.subject,
      draft.draft,
      draft.context,
      draft.specific_ask,
      draft.proof_links,
      draft.status
    ).run();
    
    return c.json({ 
      success: true, 
      draft,
      alignment: draft.alignment_data,
      valueFrame: draft.value_frame,
    });
  } catch (error) {
    console.error('Generate outreach error:', error);
    return c.json({ success: false, error: 'Failed to generate outreach' }, 500);
  }
});

// ============================================
// CRUD OPERATIONS (Private mode only)
// ============================================

// POST /universe/nodes - Create node
universeApi.post('/nodes', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const data = await c.req.json();
    const id = data.id || `node-${Date.now()}`;
    
    await c.env.DB.prepare(
      `INSERT INTO universe_nodes (
        id, label, type, description, url, timestamp, year, cluster_id,
        growth_weight, impact_score, momentum, status, verification_status,
        confidence_score, evidence, why_it_matters, what_it_unlocked,
        what_it_enables, learning_gaps, ways_to_help, meta, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      data.label,
      data.type,
      data.description || null,
      data.url || null,
      data.timestamp || null,
      data.year || null,
      data.cluster_id || null,
      data.growth_weight || 0,
      data.impact_score || 0,
      data.momentum || 0,
      data.status || 'active',
      data.verification_status || 'pending',
      data.confidence_score || 0,
      JSON.stringify(data.evidence || []),
      data.why_it_matters || null,
      JSON.stringify(data.what_it_unlocked || []),
      JSON.stringify(data.what_it_enables || []),
      JSON.stringify(data.learning_gaps || []),
      JSON.stringify(data.ways_to_help || []),
      JSON.stringify(data.meta || {}),
      data.source || 'manual'
    ).run();
    
    return c.json({ success: true, id });
  } catch (error) {
    console.error('Create node error:', error);
    return c.json({ success: false, error: 'Failed to create node' }, 500);
  }
});

// PUT /universe/nodes/:id - Update node
universeApi.put('/nodes/:id', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const { id } = c.req.param();
    const data = await c.req.json();
    
    // Build update query dynamically
    const updateFields: string[] = [];
    const params: any[] = [];
    
    const allowedFields = [
      'label', 'type', 'description', 'url', 'timestamp', 'year', 'cluster_id',
      'growth_weight', 'impact_score', 'momentum', 'status', 'verification_status',
      'confidence_score', 'why_it_matters',
    ];
    
    const jsonFields = ['evidence', 'what_it_unlocked', 'what_it_enables', 'learning_gaps', 'ways_to_help', 'meta'];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }
    
    for (const field of jsonFields) {
      if (data[field] !== undefined) {
        updateFields.push(`${field} = ?`);
        params.push(JSON.stringify(data[field]));
      }
    }
    
    if (updateFields.length === 0) {
      return c.json({ success: false, error: 'No fields to update' }, 400);
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);
    
    await c.env.DB.prepare(
      `UPDATE universe_nodes SET ${updateFields.join(', ')} WHERE id = ?`
    ).bind(...params).run();
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Update node error:', error);
    return c.json({ success: false, error: 'Failed to update node' }, 500);
  }
});

// POST /universe/edges - Create edge
universeApi.post('/edges', async (c) => {
  const mode = getMode(c);
  
  if (mode === 'public') {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  
  try {
    const data = await c.req.json();
    const id = data.id || `edge-${Date.now()}`;
    
    await c.env.DB.prepare(
      `INSERT INTO universe_edges (
        id, source_id, target_id, type, label, weight, timestamp,
        verification_status, confidence_score, inference_reason, evidence, source
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      data.source_id,
      data.target_id,
      data.type,
      data.label || null,
      data.weight || 50,
      data.timestamp || null,
      data.verification_status || 'pending',
      data.confidence_score || 0,
      data.inference_reason || null,
      JSON.stringify(data.evidence || []),
      data.source || 'manual'
    ).run();
    
    return c.json({ success: true, id });
  } catch (error) {
    console.error('Create edge error:', error);
    return c.json({ success: false, error: 'Failed to create edge' }, 500);
  }
});

// ============================================
// WEEKLY OS ENDPOINT
// ============================================

// Simple test endpoint
universeApi.get('/weekly-os-test', async (c) => {
  return c.json({ success: true, message: 'Route works' });
});

// Test imports one by one
universeApi.get('/weekly-os-test-imports', async (c) => {
  try {
    const results = {
      energyCheck: false,
      humanOverride: false,
      weeklyCompression: false,
      opportunityIntelligence: false
    };
    
    try {
      await import('./energy-check');
      results.energyCheck = true;
    } catch (e) {
      results.energyCheck = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
    }
    
    try {
      await import('./human-override');
      results.humanOverride = true;
    } catch (e) {
      results.humanOverride = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
    }
    
    try {
      await import('./weekly-compression');
      results.weeklyCompression = true;
    } catch (e) {
      results.weeklyCompression = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
    }
    
    try {
      await import('./opportunity-intelligence');
      results.opportunityIntelligence = true;
    } catch (e) {
      results.opportunityIntelligence = `ERROR: ${e instanceof Error ? e.message : String(e)}`;
    }
    
    return c.json({ success: true, imports: results });
  } catch (error) {
    return c.json({ 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

universeApi.get('/weekly-os', async (c) => {
  const privateMode = isPrivateModeRequest(c);
  
  if (!privateMode) {
    return c.json({
      success: false,
      error: 'Weekly OS only available in private mode'
    }, 403);
  }
  
  try {
    console.log('[WEEKLY_OS] Starting generation...');
    
    const { detectEnergyMode, getWeekStart, formatDate } = await import('./energy-check');
    const { getWeeklyOverrides, getOverridesSummary, getOverriddenEnergyMode } = await import('./human-override');
    const { compressToWeeklyOS } = await import('./weekly-compression');
    const { EnhancedGraphTraversal, LLMOpportunityGenerator } = await import('./opportunity-intelligence');
    
    console.log('[WEEKLY_OS] Imports loaded');
    
    // Get current week (Monday-Sunday)
    const weekStart = getWeekStart();
    console.log('[WEEKLY_OS] Week start:', formatDate(weekStart));
    
    // Load all nodes and edges (same as /opportunities/intelligent endpoint)
    console.log('[WEEKLY_OS] Loading nodes, edges, clusters from DB...');
    const [nodesResult, edgesResult, clustersResult] = await Promise.all([
      c.env.DB.prepare(`SELECT * FROM universe_nodes WHERE verification_status = 'verified'`).all(),
      c.env.DB.prepare(`SELECT * FROM universe_edges WHERE verification_status = 'verified'`).all(),
      c.env.DB.prepare(`SELECT * FROM universe_clusters`).all(),
    ]);
    
    console.log('[WEEKLY_OS] DB results:', {
      nodes: nodesResult.results?.length || 0,
      edges: edgesResult.results?.length || 0,
      clusters: clustersResult.results?.length || 0
    });
    
    const nodes = (nodesResult.results || []).map((n: any) => ({
      id: n.id,
      label: n.label,
      type: n.type,
      description: n.description || '',
      cluster_id: n.cluster_id,
      impact_score: n.impact_score || 50,
      momentum: n.momentum || 50,
      meta: n.meta ? JSON.parse(n.meta) : {},
      url: n.url,
    }));
    
    const edges = (edgesResult.results || []).map((e: any) => ({
      id: e.id,
      source_id: e.source_id,
      target_id: e.target_id,
      type: e.type,
      weight: e.weight || 50,
    }));
    
    const clusters = (clustersResult.results || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description,
    }));
    
    console.log('[WEEKLY_OS] Parsed data structures');
    
    // Build context
    const recentActivity = nodes.filter((n: any) => {
      if (!n.meta?.date) return false;
      const nodeDate = new Date(n.meta.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return nodeDate >= thirtyDaysAgo;
    });
    
    console.log('[WEEKLY_OS] Recent activity nodes:', recentActivity.length);
    
    const context = {
      clusters,
      recentActivity,
      existingConnections: edges,
    };
    
    // Generate opportunities using intelligent engine
    console.log('[WEEKLY_OS] Creating graph and generator...');
    const graph = new EnhancedGraphTraversal(nodes, edges);
    const generator = new LLMOpportunityGenerator(graph, clusters, context);
    
    console.log('[WEEKLY_OS] Generating opportunities...');
    const result = await generator.generateAllOpportunities();
    
    const opportunities = result.opportunities || [];
    console.log('[WEEKLY_OS] Generated opportunities:', opportunities.length);
    
    // Log first opportunity structure
    if (opportunities.length > 0) {
      console.log('[WEEKLY_OS] Sample opportunity:', JSON.stringify(opportunities[0], null, 2));
    }
    
    // Detect energy mode
    console.log('[WEEKLY_OS] Detecting energy mode...');
    const energyMetrics = await detectEnergyMode(c.env.DB, weekStart);
    console.log('[WEEKLY_OS] Energy mode:', energyMetrics.mode, 'score:', energyMetrics.score);
    
    // Get weekly overrides
    console.log('[WEEKLY_OS] Fetching overrides...');
    const overrides = await getWeeklyOverrides(c.env.DB, weekStart);
    console.log('[WEEKLY_OS] Overrides:', overrides.length);
    
    // Apply energy mode override if exists
    const overriddenMode = getOverriddenEnergyMode(overrides);
    const finalEnergyMode = overriddenMode || energyMetrics.mode;
    console.log('[WEEKLY_OS] Final energy mode:', finalEnergyMode);
    
    // Run compression
    console.log('[WEEKLY_OS] Starting compression...');
    const moves = await compressToWeeklyOS(
      c.env.DB,
      opportunities,
      finalEnergyMode,
      overrides
    );
    console.log('[WEEKLY_OS] Compression complete, moves:', moves.length);
    
    // Build output
    const output = {
      success: true,
      week: formatDate(weekStart),
      moves,
      energyMode: finalEnergyMode,
      energyMetrics,
      overridesSummary: getOverridesSummary(overrides),
      generatedAt: new Date().toISOString()
    };
    
    console.log('[WEEKLY_OS] Success!');
    return c.json(output);
  } catch (error) {
    const errorDetails = {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack?.split('\n').slice(0, 10).join('\n') : undefined,
      name: error instanceof Error ? error.name : undefined,
      type: typeof error
    };
    
    console.error('[WEEKLY_OS_ERROR]', errorDetails);
    
    return c.json({ 
      success: false, 
      error: 'Failed to generate weekly OS',
      details: errorDetails
    }, 500);
  }
});

// ============================================
// DEBUG ENDPOINT - WEEKLY OS WITHOUT COMPRESSION
// ============================================

universeApi.get('/weekly-os-debug', async (c) => {
  const privateMode = isPrivateModeRequest(c);
  
  if (!privateMode) {
    return c.json({ success: false, error: 'Private mode required' }, 403);
  }
  
  try {
    console.log('[DEBUG] Starting...');
    
    const { EnhancedGraphTraversal, LLMOpportunityGenerator } = await import('./opportunity-intelligence');
    
    // Load nodes, edges, clusters
    const [nodesResult, edgesResult, clustersResult] = await Promise.all([
      c.env.DB.prepare(`SELECT * FROM universe_nodes WHERE verification_status = 'verified'`).all(),
      c.env.DB.prepare(`SELECT * FROM universe_edges WHERE verification_status = 'verified'`).all(),
      c.env.DB.prepare(`SELECT * FROM universe_clusters`).all(),
    ]);
    
    console.log('[DEBUG] DB loaded');
    
    const nodes = (nodesResult.results || []).map((n: any) => ({
      id: n.id,
      label: n.label,
      type: n.type,
      description: n.description || '',
      cluster_id: n.cluster_id,
      impact_score: n.impact_score || 50,
      momentum: n.momentum || 50,
      meta: n.meta ? JSON.parse(n.meta) : {},
      url: n.url,
    }));
    
    const edges = (edgesResult.results || []).map((e: any) => ({
      id: e.id,
      source_id: e.source_id,
      target_id: e.target_id,
      type: e.type,
      weight: e.weight || 50,
    }));
    
    const clusters = (clustersResult.results || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description,
    }));
    
    console.log('[DEBUG] Building context...');
    
    const recentActivity = nodes.filter((n: any) => {
      if (!n.meta?.date) return false;
      const nodeDate = new Date(n.meta.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return nodeDate >= thirtyDaysAgo;
    });
    
    const context = {
      clusters,
      recentActivity,
      existingConnections: edges,
    };
    
    console.log('[DEBUG] Creating generator...');
    const graph = new EnhancedGraphTraversal(nodes, edges);
    const generator = new LLMOpportunityGenerator(graph, clusters, context);
    
    console.log('[DEBUG] Generating opportunities...');
    const result = await generator.generateAllOpportunities();
    const opportunities = result.opportunities || [];
    
    console.log('[DEBUG] Generated', opportunities.length, 'opportunities');
    
    // Return WITHOUT compression
    return c.json({
      success: true,
      debug: true,
      opportunityCount: opportunities.length,
      sample: opportunities[0],
      allFields: opportunities[0] ? Object.keys(opportunities[0]) : []
    });
    
  } catch (error) {
    console.error('[DEBUG_ERROR]', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 500);
  }
});

// ============================================
// OVERRIDE MANAGEMENT ENDPOINTS
// ============================================

// Get overrides for a specific week
universeApi.get('/overrides/:week', async (c) => {
  const privateMode = isPrivateModeRequest(c);
  
  if (!privateMode) {
    return c.json({ success: false, error: 'Private mode required' }, 403);
  }
  
  try {
    const { getWeeklyOverrides } = await import('./human-override');
    const weekStr = c.req.param('week');
    const weekStart = new Date(weekStr);
    
    const overrides = await getWeeklyOverrides(c.env.DB, weekStart);
    
    return c.json({ success: true, overrides });
  } catch (error) {
    console.error('Get overrides error:', error);
    return c.json({ success: false, error: 'Failed to get overrides' }, 500);
  }
});

// Create new override
universeApi.post('/overrides', async (c) => {
  const privateMode = isPrivateModeRequest(c);
  
  if (!privateMode) {
    return c.json({ success: false, error: 'Private mode required' }, 403);
  }
  
  try {
    const { createOverride } = await import('./human-override');
    const data = await c.req.json();
    
    const weekStart = new Date(data.weekStart);
    const override = await createOverride(
      c.env.DB,
      weekStart,
      data.type,
      data.reason,
      data.config,
      data.createdBy || 'venkat'
    );
    
    return c.json({ success: true, override });
  } catch (error) {
    console.error('Create override error:', error);
    return c.json({ success: false, error: 'Failed to create override' }, 500);
  }
});

// Delete override
universeApi.delete('/overrides/:id', async (c) => {
  const privateMode = isPrivateModeRequest(c);
  
  if (!privateMode) {
    return c.json({ success: false, error: 'Private mode required' }, 403);
  }
  
  try {
    const { deleteOverride } = await import('./human-override');
    const overrideId = c.req.param('id');
    
    const success = await deleteOverride(c.env.DB, overrideId);
    
    return c.json({ success });
  } catch (error) {
    console.error('Delete override error:', error);
    return c.json({ success: false, error: 'Failed to delete override' }, 500);
  }
});

export default universeApi;
