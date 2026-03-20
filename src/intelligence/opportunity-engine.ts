// ============================================
// OPPORTUNITY ENGINE — Universe v5.5
// Maps nodes to real-world opportunities
// Sources: hackathons, grants, labs, competitions, programs
// ============================================

import { nodes } from '../web/data/universe-data';
import { capabilityClusters } from '../web/data/universe-intelligence';
import { activePatterns } from './pattern-engine';
import { getSignalsForNode, getAllSignals } from './signal-engine';
import type { Signal } from '../data/signal-store';
import type { SignalSurface } from '../data/signal-store';

// ============================================
// TYPES
// ============================================

export type OpportunityType = 'hackathon' | 'grant' | 'lab' | 'competition' | 'program' | 'fellowship' | 'accelerator' | 'community';

export interface OpportunityMatch {
  id: string;
  title: string;
  type: OpportunityType;
  description: string;
  source?: string;
  link?: string;
  relevance: string;
  matchScore: number; // 0–100
  triggeredBy?: string; // signal ID or 'graph'
  triggerSurface?: SignalSurface; // v7: surface of the triggering signal
}

// ============================================
// OPPORTUNITY CATALOG
// Static catalog of known opportunities mapped to domains/clusters
// ============================================

interface OpportunityCatalogEntry {
  id: string;
  title: string;
  type: OpportunityType;
  description: string;
  link?: string;
  source?: string;
  // Matching criteria
  matchDomains: string[];     // node IDs or domains
  matchClusters?: string[];   // cluster IDs
  matchSignalKeywords?: string[]; // keywords in signals that boost relevance
  baseScore: number;          // 0–100
}

const OPPORTUNITY_CATALOG: OpportunityCatalogEntry[] = [
  // ── Hackathons ──
  {
    id: 'opp-opencv-ai-comp',
    title: 'OpenCV AI Competition',
    type: 'competition',
    description: 'Annual computer vision competition by OpenCV.org. Build real-world CV applications using OpenCV and deploy on edge devices.',
    link: 'https://opencv.org/competition/',
    source: 'OpenCV',
    matchDomains: ['computer-vision', 'opencv', 'python', 'machine-learning'],
    matchClusters: ['cluster-ai-vision'],
    baseScore: 85,
  },
  {
    id: 'opp-nvidia-jetson-challenge',
    title: 'NVIDIA Jetson Community Projects',
    type: 'program',
    description: 'NVIDIA actively features young builders using Jetson for AI at the edge. Submit projects for developer spotlight and hardware grants.',
    link: 'https://developer.nvidia.com/embedded/community',
    source: 'NVIDIA',
    matchDomains: ['computer-vision', 'machine-learning', 'robotics', 'python'],
    matchClusters: ['cluster-ai-vision'],
    matchSignalKeywords: ['nvidia', 'jetson', 'edge ai', 'gpu'],
    baseScore: 78,
  },
  {
    id: 'opp-first-robotics',
    title: 'FIRST Robotics Competition',
    type: 'competition',
    description: 'Global robotics competition for young builders. Combines hardware engineering, programming, and teamwork.',
    link: 'https://www.firstinspires.org/',
    source: 'FIRST',
    matchDomains: ['robotics', 'electronics', 'arduino', 'cad-design'],
    matchClusters: ['cluster-robotics'],
    baseScore: 80,
  },
  {
    id: 'opp-robocup-junior',
    title: 'RoboCup Junior India',
    type: 'competition',
    description: 'International robotics competition with India chapter. Categories include rescue, soccer, and on-stage performance robots.',
    link: 'https://www.robocup.org/leagues/junior',
    source: 'RoboCup',
    matchDomains: ['robotics', 'electronics', 'computer-vision', 'python'],
    matchClusters: ['cluster-robotics'],
    baseScore: 75,
  },

  // ── Grants ──
  {
    id: 'opp-atal-innovation',
    title: 'Atal Innovation Mission — Tinkering Labs',
    type: 'grant',
    description: 'Government of India program supporting young innovators. Provides grants, mentorship, and lab access for STEM projects.',
    link: 'https://aim.gov.in',
    source: 'Government of India',
    matchDomains: ['electronics', 'robotics', 'circuitheroes', 'entrepreneurship'],
    matchSignalKeywords: ['atal', 'innovation', 'government', 'stem'],
    baseScore: 72,
  },
  {
    id: 'opp-inspire-awards',
    title: 'INSPIRE Awards — MANAK',
    type: 'grant',
    description: 'Department of Science & Technology awards for young innovators aged 6–18. Up to ₹10,000 for prototype development.',
    link: 'https://www.inspireawards-dst.gov.in/',
    source: 'DST India',
    matchDomains: ['electronics', 'drishtikon-yantra', 'robotics'],
    baseScore: 68,
  },

  // ── Labs & Programs ──
  {
    id: 'opp-iit-hyd-lab',
    title: 'IIT Hyderabad — Robotics Research Lab',
    type: 'lab',
    description: 'Collaborative research opportunity. IIT Hyderabad robotics lab accepts student collaborators for autonomous systems projects.',
    source: 'IIT Hyderabad',
    matchDomains: ['robotics', 'computer-vision', 'iit-hyderabad-workshop'],
    matchClusters: ['cluster-robotics'],
    matchSignalKeywords: ['iit', 'hyderabad', 'research', 'lab'],
    baseScore: 70,
  },
  {
    id: 'opp-isro-sspo',
    title: 'ISRO Student Satellite Program (SSPO)',
    type: 'program',
    description: 'ISRO program for students to design and build CubeSat payloads. Requires hardware + programming skills.',
    link: 'https://www.isro.gov.in',
    source: 'ISRO',
    matchDomains: ['isro-demo', 'electronics', 'robotics', 'python'],
    matchSignalKeywords: ['isro', 'satellite', 'space', 'cubesat'],
    baseScore: 65,
  },

  // ── Fellowships & Accelerators ──
  {
    id: 'opp-thiel-fellowship',
    title: 'Thiel Fellowship',
    type: 'fellowship',
    description: '$100K grant for young builders who want to build instead of attending traditional education. Age 22 and under.',
    link: 'https://thielfellowship.org/',
    source: 'Thiel Foundation',
    matchDomains: ['entrepreneurship', 'circuitheroes', 'malpani-grant'],
    matchSignalKeywords: ['fellowship', 'thiel', 'founder', 'grant'],
    baseScore: 55,
  },
  {
    id: 'opp-t-hub-hyderabad',
    title: 'T-Hub — Young Innovators Program',
    type: 'accelerator',
    description: 'Hyderabad-based startup incubator. Runs programs for early-stage hardware and edtech founders.',
    link: 'https://t-hub.co',
    source: 'T-Hub',
    matchDomains: ['entrepreneurship', 'circuitheroes', 'malpani-grant', 'chhotacreator'],
    matchSignalKeywords: ['t-hub', 'incubator', 'accelerator', 'hyderabad'],
    baseScore: 68,
  },

  // ── Communities ──
  {
    id: 'opp-arduino-ambassador',
    title: 'Arduino Education Ambassador',
    type: 'community',
    description: 'Arduino actively partners with young content creators. 65+ Arduino projects + YouTube channel is a strong profile.',
    link: 'https://www.arduino.cc/education/',
    source: 'Arduino',
    matchDomains: ['arduino', 'youtube-channel', '170-projects', 'teaching'],
    matchSignalKeywords: ['arduino', 'education', 'ambassador'],
    baseScore: 72,
  },
  {
    id: 'opp-rpi-foundation-spotlight',
    title: 'Raspberry Pi Foundation — Young Maker Spotlight',
    type: 'community',
    description: 'RPi Foundation features young builders. Drishtikon Yantra (RPi-based vision device) is exactly what they highlight.',
    link: 'https://www.raspberrypi.org/community/',
    source: 'Raspberry Pi Foundation',
    matchDomains: ['raspberry-pi', 'drishtikon-yantra', 'computer-vision'],
    matchSignalKeywords: ['raspberry pi', 'foundation', 'maker'],
    baseScore: 70,
  },
  {
    id: 'opp-hackaday-prize',
    title: 'Hackaday Prize',
    type: 'competition',
    description: 'Global hardware innovation competition. Categories include assistive tech, sustainability, and connected devices.',
    link: 'https://prize.supplyframe.com/',
    source: 'Hackaday / Supplyframe',
    matchDomains: ['electronics', 'drishtikon-yantra', '170-projects', 'robotics'],
    matchSignalKeywords: ['hackaday', 'hardware', 'open source', 'maker'],
    baseScore: 74,
  },
  {
    id: 'opp-google-science-fair',
    title: 'Regeneron ISEF / Google Science Fair',
    type: 'competition',
    description: 'International science fair. Drishtikon Yantra (assistive tech) and CircuitHeroes (STEM education) are strong entries.',
    source: 'Regeneron / Society for Science',
    matchDomains: ['drishtikon-yantra', 'circuitheroes', 'computer-vision', 'electronics'],
    matchSignalKeywords: ['science fair', 'isef', 'regeneron'],
    baseScore: 65,
  },
  {
    id: 'opp-makeathon',
    title: 'National Makeathon / ATL Marathon',
    type: 'hackathon',
    description: 'India-wide maker hackathon for young innovators. Hardware + AI profile is rare and valued.',
    source: 'Atal Innovation Mission',
    matchDomains: ['electronics', 'robotics', 'arduino', 'circuitheroes'],
    matchSignalKeywords: ['makeathon', 'atl', 'innovation'],
    baseScore: 70,
  },
];

// ============================================
// MATCHING ENGINE
// Score and filter opportunities for a node
// ============================================

function getClusterIdsForNode(nodeId: string): string[] {
  return capabilityClusters
    .filter(c => c.nodeIds.includes(nodeId))
    .map(c => c.id);
}


// Confidence multiplier — high signals boost score more
const CONFIDENCE_MULTIPLIER: Record<string, number> = {
  high: 1.3,
  medium: 1.0,
  low: 0.7,
};

function scoreOpportunity(entry: OpportunityCatalogEntry, nodeId: string): number {
  let score = 0;

  // Domain match (primary)
  const domainMatches = entry.matchDomains.filter(d => d === nodeId).length;
  score += domainMatches * 25;

  const node = nodes.find(n => n.id === nodeId);
  if (node) {
    // Cluster match with strength weighting
    const nodeClusters = getClusterIdsForNode(nodeId);
    if (entry.matchClusters) {
      const clusterOverlap = entry.matchClusters.filter(c => nodeClusters.includes(c)).length;
      // Boost by cluster level if available
      const clusterStrength = capabilityClusters
        .filter(c => nodeClusters.includes(c.id) && entry.matchClusters!.includes(c.id))
        .reduce((acc, c) => acc + (c.level || 1), 0);
      score += clusterOverlap * 15 + clusterStrength * 3;
    }

    // Pattern boost: if node is part of an active pattern
    const nodeInPattern = activePatterns.some(p => p.inputNodes.includes(nodeId));
    if (nodeInPattern) score += 8;
  }

  // Signal keyword boost — weighted by confidence
  const nodeSignals = getSignalsForNode(nodeId);
  let signalBoost = 0;
  for (const signal of nodeSignals) {
    if (entry.matchSignalKeywords) {
      const text = [signal.title, signal.rawText, ...(signal.entities || [])].join(' ').toLowerCase();
      const hasKw = entry.matchSignalKeywords.some(kw => text.includes(kw.toLowerCase()));
      if (hasKw) {
        const multiplier = CONFIDENCE_MULTIPLIER[signal.confidence] ?? 1.0;
        signalBoost = Math.max(signalBoost, Math.round(12 * multiplier));
      }
    }
  }
  score += signalBoost;

  // Recent high-confidence signal boost
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const recentHighConf = nodeSignals.some(
    s => s.date && new Date(s.date) >= threeMonthsAgo && s.confidence === 'high'
  );
  const recentAnyConf = nodeSignals.some(s => s.date && new Date(s.date) >= threeMonthsAgo);
  if (recentHighConf) score += 8;
  else if (recentAnyConf) score += 4;

  // Normalize: blend with base score
  const finalScore = Math.min(100, Math.round((entry.baseScore * 0.5) + (score * 0.5)));

  return finalScore;
}

// ============================================
// MAIN: GET OPPORTUNITIES FOR NODE
// ============================================

export function getOpportunitiesForNode(nodeId: string): OpportunityMatch[] {
  const results: OpportunityMatch[] = [];

  for (const entry of OPPORTUNITY_CATALOG) {
    // Must have at least one domain match
    const hasDomainMatch = entry.matchDomains.includes(nodeId);
    if (!hasDomainMatch) continue;

    const matchScore = scoreOpportunity(entry, nodeId);
    if (matchScore < 25) continue; // too low relevance

    // Determine what triggered this match
    const signals = getSignalsForNode(nodeId);
    const triggerSignal = signals.find(s => {
      if (!entry.matchSignalKeywords) return false;
      const text = [s.title, s.rawText].join(' ').toLowerCase();
      return entry.matchSignalKeywords.some(kw => text.includes(kw.toLowerCase()));
    });

    // v7: surface comes directly from the signal's built-in surface field
    const triggerSignalId = triggerSignal?.id ?? 'graph';

    results.push({
      id: entry.id,
      title: entry.title,
      type: entry.type,
      description: entry.description,
      source: entry.source,
      link: entry.link,
      relevance: generateRelevanceText(entry, nodeId),
      matchScore,
      triggeredBy: triggerSignalId,
      triggerSurface: triggerSignal?.surface,
    });
  }

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
}

// ============================================
// MULTI-NODE: Get opportunities across a set of nodes
// ============================================

export function getOpportunitiesForNodes(nodeIds: string[]): OpportunityMatch[] {
  const seen = new Set<string>();
  const all: OpportunityMatch[] = [];

  for (const nodeId of nodeIds) {
    const opps = getOpportunitiesForNode(nodeId);
    for (const opp of opps) {
      if (!seen.has(opp.id)) {
        seen.add(opp.id);
        all.push(opp);
      }
    }
  }

  return all.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
}

// ============================================
// SIGNAL-TRIGGERED OPPORTUNITIES
// Given a new signal, find relevant opportunities
// ============================================

export function getOpportunitiesFromSignal(signal: Signal): OpportunityMatch[] {
  const results: OpportunityMatch[] = [];
  const signalText = [signal.title, signal.rawText, ...(signal.entities || [])].join(' ').toLowerCase();

  for (const entry of OPPORTUNITY_CATALOG) {
    let match = false;

    // Check signal domains against opportunity domains
    if (signal.domains) {
      const overlap = entry.matchDomains.filter(d => signal.domains!.includes(d)).length;
      if (overlap > 0) match = true;
    }

    // Check signal keywords
    if (entry.matchSignalKeywords) {
      if (entry.matchSignalKeywords.some(kw => signalText.includes(kw.toLowerCase()))) {
        match = true;
      }
    }

    if (match) {
      results.push({
        id: entry.id,
        title: entry.title,
        type: entry.type,
        description: entry.description,
        source: entry.source,
        link: entry.link,
        relevance: `Triggered by signal: ${signal.title}`,
        matchScore: entry.baseScore,
        triggeredBy: signal.id,
      });
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
}

// ============================================
// RELEVANCE TEXT GENERATOR
// ============================================

function generateRelevanceText(entry: OpportunityCatalogEntry, nodeId: string): string {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return entry.description;

  const matchedCount = entry.matchDomains.filter(d => {
    return nodes.some(n => n.id === d);
  }).length;

  return `Matched via ${node.label}. ${matchedCount} capability${matchedCount > 1 ? ' overlaps' : ''} with your graph.`;
}

// ============================================
// CATALOG STATS
// ============================================

export function getOpportunityStats(): {
  total: number;
  byType: Record<string, number>;
} {
  const byType: Record<string, number> = {};
  for (const entry of OPPORTUNITY_CATALOG) {
    byType[entry.type] = (byType[entry.type] || 0) + 1;
  }
  return { total: OPPORTUNITY_CATALOG.length, byType };
}
