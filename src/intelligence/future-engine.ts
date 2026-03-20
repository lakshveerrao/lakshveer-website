// ============================================
// FUTURE ENGINE — Growth prediction and capability expansion
// Generates ranked future nodes from current graph state
// ============================================

import { nodes } from '../web/data/universe-data';
import { capabilityClusters } from '../web/data/universe-intelligence';
import { activePatterns } from './pattern-engine';
import type { PredictedPath, OpportunityMatch } from '../core/universe/node-schema';

// ============================================
// FUTURE PATH DEFINITIONS
// Each path has prerequisites (current nodes that enable it)
// ============================================

interface FuturePathDefinition {
  id: string;
  label: string;
  description: string;
  prerequisites: string[]; // node IDs required
  probability: number; // base probability 0–100
  timeframe: string;
  impact: PredictedPath['impact'];
  clusterBoost?: string; // cluster ID that boosts probability
  tags: string[];
}

const FUTURE_PATH_DEFINITIONS: FuturePathDefinition[] = [
  {
    id: 'future-ros',
    label: 'ROS Integration',
    description: 'Robot Operating System — industry standard for autonomous machines. Unlocks research lab collaboration, academic competitions, and industrial robotics projects.',
    prerequisites: ['robotics', 'python', 'raspberry-pi'],
    probability: 75,
    timeframe: '3–6 months',
    impact: 'high',
    clusterBoost: 'cluster-robotics',
    tags: ['robotics', 'autonomy', 'research'],
  },
  {
    id: 'future-pcb',
    label: 'Custom PCB Design',
    description: 'KiCAD or Altium for professional circuit board design. First CircuitHeroes expansion PCB. Transforms prototype hardware into manufacturable products.',
    prerequisites: ['electronics', 'circuitheroes', 'cad-design'],
    probability: 80,
    timeframe: '6–12 months',
    impact: 'transformative',
    clusterBoost: 'cluster-hardware',
    tags: ['hardware', 'manufacturing', 'product'],
  },
  {
    id: 'future-cubesat',
    label: 'CubeSat / Space Systems',
    description: 'Student satellite programs enabled by ISRO connection. India has active CubeSat programs for young builders with hardware credentials.',
    prerequisites: ['isro-demo', 'electronics', 'robotics'],
    probability: 60,
    timeframe: '12–18 months',
    impact: 'transformative',
    tags: ['space', 'government', 'ISRO', 'milestone'],
  },
  {
    id: 'future-tedx',
    label: 'TEDx Talk',
    description: 'Public speaking milestone. 5+ documented speaking events, SPC pitch, and August Fest panel establish credibility. TEDxHyderabad or TEDxYouth is the logical next stage.',
    prerequisites: ['public-speaking', 'south-park-commons', 'august-fest'],
    probability: 85,
    timeframe: '6–9 months',
    impact: 'high',
    clusterBoost: 'cluster-entrepreneurship',
    tags: ['speaking', 'media', 'brand'],
  },
  {
    id: 'future-jetson',
    label: 'NVIDIA Jetson Projects',
    description: 'GPU-accelerated edge AI. Takes computer vision projects to a new performance tier — real-time object detection, autonomous navigation, multi-camera systems.',
    prerequisites: ['machine-learning', 'computer-vision', 'python'],
    probability: 70,
    timeframe: '3–6 months',
    impact: 'high',
    clusterBoost: 'cluster-ai-vision',
    tags: ['AI', 'edge', 'nvidia', 'hardware'],
  },
  {
    id: 'future-product-line',
    label: 'CircuitHeroes Product Expansion',
    description: 'Expansion packs, advanced decks, or a new game in the CircuitHeroes universe. 300+ decks sold is enough proof of demand.',
    prerequisites: ['circuitheroes', 'entrepreneurship', 'trademark'],
    probability: 88,
    timeframe: '3–6 months',
    impact: 'high',
    clusterBoost: 'cluster-entrepreneurship',
    tags: ['product', 'startup', 'hardware', 'education'],
  },
  {
    id: 'future-online-course',
    label: 'Online Course on ChhotaCreator',
    description: 'Structured electronics/AI course for kids. 170+ YouTube videos is already a curriculum — package it.',
    prerequisites: ['teaching', 'chhotacreator', 'youtube-channel'],
    probability: 72,
    timeframe: '6 months',
    impact: 'medium',
    tags: ['education', 'content', 'platform'],
  },
  {
    id: 'future-seed',
    label: 'Seed Funding Round',
    description: 'Institutional funding for hardware venture. Malpani grant + residency + Bangalore pitch track point toward first institutional round.',
    prerequisites: ['malpani-grant', 'the-residency', 'circuitheroes'],
    probability: 45,
    timeframe: '12–18 months',
    impact: 'transformative',
    tags: ['funding', 'startup', 'VC'],
  },
  {
    id: 'future-iit-collab',
    label: 'IIT Research Collaboration',
    description: 'Joint project with IIT Hyderabad — autonomous systems or AI hardware. IIT workshops already established the connection.',
    prerequisites: ['iit-hyderabad-workshop', 'robotics', 'computer-vision'],
    probability: 55,
    timeframe: '6–12 months',
    impact: 'high',
    tags: ['research', 'IIT', 'academia'],
  },
  {
    id: 'future-maker-faire',
    label: 'Maker Faire Exhibition',
    description: 'Global maker showcase. Profile now strong enough for international Maker Faire acceptance.',
    prerequisites: ['170-projects', 'public-speaking', 'circuitheroes'],
    probability: 60,
    timeframe: '9–12 months',
    impact: 'high',
    tags: ['exhibition', 'global', 'maker'],
  },
];

// ============================================
// PROBABILITY CALCULATOR
// Boosts base probability based on cluster strength and active patterns
// ============================================

function calculateProbability(
  definition: FuturePathDefinition,
  presentNodeIds: Set<string>
): number {
  let prob = definition.probability;

  // Check how many prerequisites are actually present
  const metPrereqs = definition.prerequisites.filter(id => presentNodeIds.has(id)).length;
  const totalPrereqs = definition.prerequisites.length;
  const prereqRatio = metPrereqs / totalPrereqs;

  // Boost if all prerequisites met
  if (prereqRatio === 1) prob = Math.min(95, prob + 10);
  else if (prereqRatio >= 0.67) prob = Math.min(90, prob + 5);
  else if (prereqRatio < 0.5) prob = Math.max(10, prob - 20);

  // Cluster boost
  if (definition.clusterBoost) {
    const cluster = capabilityClusters.find(c => c.id === definition.clusterBoost);
    if (cluster && cluster.growthRate > 3) {
      prob = Math.min(95, prob + Math.round(cluster.growthRate * 2));
    }
  }

  // Pattern boost
  const patternBoost = activePatterns.some(p =>
    p.inputNodes.some(id => definition.prerequisites.includes(id))
  );
  if (patternBoost) prob = Math.min(95, prob + 5);

  return prob;
}

// ============================================
// GENERATE FUTURE PATHS
// ============================================

export function generateFuturePaths(): PredictedPath[] {
  const presentNodeIds = new Set(nodes.map(n => n.id));

  return FUTURE_PATH_DEFINITIONS
    .map(def => ({
      id: def.id,
      label: def.label,
      description: def.description,
      probability: calculateProbability(def, presentNodeIds),
      timeframe: def.timeframe,
      impact: def.impact,
      enabledBy: def.prerequisites.filter(id => presentNodeIds.has(id)),
    }))
    .sort((a, b) => {
      // Sort: transformative first, then by probability
      const impactOrder = { transformative: 4, high: 3, medium: 2, low: 1 };
      const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
      return impactDiff !== 0 ? impactDiff : b.probability - a.probability;
    });
}

// ============================================
// OPPORTUNITY SCANNER
// Maps current capabilities to external opportunities
// ============================================

export function scanOpportunities(): OpportunityMatch[] {
  const presentNodeIds = new Set(nodes.map(n => n.id));

  const opportunities: OpportunityMatch[] = [
    {
      id: 'opp-nas-hackathon',
      title: 'National AI & Robotics Hackathon',
      type: 'hackathon',
      whyRelevant: 'AI + robotics profile with 5 hackathon wins is a strong match. Competitions at this level regularly feature builders in this capability tier.',
      probability: 82,
      nextAction: 'Search devfolio.co and unstop.com for AI + robotics categories with junior tracks.',
      effort: 'medium',
      matchedCapabilities: ['robotics', 'computer-vision', 'python'],
    },
    {
      id: 'opp-raspberry-pi-foundation',
      title: 'Raspberry Pi Foundation – Young Maker Spotlight',
      type: 'media',
      whyRelevant: 'Uses Raspberry Pi in multiple projects (Drishtikon Yantra, vision experiments). RPi Foundation actively features young builders globally.',
      probability: 70,
      nextAction: 'Submit project documentation via Raspberry Pi Foundation community portal.',
      url: 'https://www.raspberrypi.org/community/',
      effort: 'low',
      matchedCapabilities: ['raspberry-pi', 'computer-vision', 'drishtikon-yantra'],
    },
    {
      id: 'opp-t-hub-young',
      title: 'T-Hub Young Innovators Program',
      type: 'accelerator',
      whyRelevant: 'Hyderabad-based. CircuitHeroes is a live hardware startup with trademark and 300+ sales. T-Hub runs programs for early-stage hardware founders.',
      probability: 68,
      nextAction: 'Connect via LinkedIn or attend T-Hub open days.',
      url: 'https://t-hub.co',
      effort: 'low',
      matchedCapabilities: ['circuitheroes', 'entrepreneurship', 'malpani-grant'],
    },
    {
      id: 'opp-google-science-fair',
      title: 'Google Science Fair / Regeneron ISEF',
      type: 'conference',
      whyRelevant: 'Drishtikon Yantra (assistive vision device) is exactly the kind of project that wins in accessibility + AI categories at international science fairs.',
      probability: 60,
      nextAction: 'Prepare Drishtikon Yantra project documentation for submission.',
      effort: 'medium',
      matchedCapabilities: ['drishtikon-yantra', 'computer-vision', 'param-award'],
    },
    {
      id: 'opp-stem-school-sponsor',
      title: 'STEM School Curriculum Partner',
      type: 'collaborator',
      whyRelevant: 'ChhotaCreator platform + 170+ documented builds + CircuitHeroes card game — this is a complete hands-on curriculum waiting to enter schools.',
      probability: 65,
      nextAction: 'Identify 3 CBSE schools in Hyderabad for a pilot partnership pitch.',
      effort: 'medium',
      matchedCapabilities: ['chhotacreator', 'teaching', 'circuitheroes'],
    },
    {
      id: 'opp-arduino-education',
      title: 'Arduino Education Partnership',
      type: 'sponsor',
      whyRelevant: '65+ Arduino-based builds documented. Arduino Education actively partners with young content creators and curriculum developers.',
      probability: 62,
      nextAction: 'Apply to Arduino Education Ambassador program.',
      url: 'https://www.arduino.cc/education/',
      effort: 'low',
      matchedCapabilities: ['arduino', 'youtube-channel', '170-projects'],
    },
    {
      id: 'opp-atal-innovation',
      title: 'Atal Innovation Mission Grant',
      type: 'grant',
      whyRelevant: 'Government of India grant for young innovators. Drishtikon Yantra (assistive tech) + CircuitHeroes (STEM education) both align with ATL mission priorities.',
      probability: 75,
      nextAction: 'Prepare application via atal.innovation.gov.in',
      url: 'https://aim.gov.in',
      effort: 'medium',
      matchedCapabilities: ['malpani-grant', 'drishtikon-yantra', 'circuitheroes'],
    },
    {
      id: 'opp-nasa-inspire',
      title: 'NASA Inspire / Student Satellite Programs',
      type: 'lab',
      whyRelevant: 'ISRO connection now active. Combined with electronics L5 and robotics L4, the profile is ready for student space programs.',
      probability: 40,
      nextAction: 'Begin with ISRO Student Satellite Program (SSPO) registration.',
      url: 'https://www.isro.gov.in/student-satellite',
      effort: 'high',
      matchedCapabilities: ['isro-demo', 'electronics', 'robotics'],
    },
  ];

  // Filter: only show opportunities where at least 2 capabilities are present
  return opportunities.filter(opp => {
    const matched = opp.matchedCapabilities.filter(id => presentNodeIds.has(id)).length;
    return matched >= 2;
  }).sort((a, b) => b.probability - a.probability);
}

// ============================================
// EXPORTS
// ============================================

export const futurePredictions = generateFuturePaths();
export const opportunityMatches = scanOpportunities();
