// Lakshveer's Universe - Momentum Intelligence Engine
// Cross-pollination, capability compounding, future path inference

import { nodes as rawNodes, edges as rawEdges, UniverseNode, UniverseEdge, NodeType } from './universe-data';

// ============================================
// ENHANCED TYPE DEFINITIONS
// ============================================

export type ExtendedNodeType = 
  | NodeType 
  | 'trip' 
  | 'capability' 
  | 'potential_build' 
  | 'influence' 
  | 'endorsement';

export type EdgeRelationType = 
  | 'created' | 'built' | 'uses' | 'knows' | 'learning' | 'mentors' | 'supports'
  | 'EVOLVED_INTO' | 'CROSS_POLLINATED_WITH' | 'CAPABILITY_EXPANSION' | 'FUTURE_PATH'
  | 'UNLOCKED' | 'COMPOUNDS_WITH' | 'LED_TO';

export interface CapabilityCluster {
  id: string;
  name: string;
  description: string;
  color: string;
  nodeIds: string[];
  coreSkills: string[];
  level: 1 | 2 | 3 | 4 | 5; // Mastery level
  growthRate: number; // Projects per month in this cluster
}

export interface GrowthArc {
  id: string;
  name: string;
  description: string;
  milestones: { nodeId: string; date: string; achievement: string }[];
  startDate: string;
  currentPhase: string;
}

export interface CrossPollination {
  sourceProject: string;
  targetProject: string;
  sharedLearning: string;
  date: string;
  impactScore: number;
}

export interface FuturePath {
  id: string;
  name: string;
  description: string;
  prerequisites: string[];
  unlocks: string[];
  probability: number; // 0-100
  impact: 'low' | 'medium' | 'high' | 'transformative';
  timeframe: string;
}

export interface MomentumMetrics {
  skillDensity: number;
  networkExpansion: number;
  brandImpact: number;
  buildFrequency: number;
  recognitionGrowth: number;
  overallMomentum: number;
}

export interface EnhancedNode extends UniverseNode {
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
  clusterId?: string;
  growthWeight?: number; // How much this contributed to growth
  crossPollinationScore?: number;
  capabilityExpansion?: string[];
  futurePathId?: string;
  momentumContribution?: number;
}

export interface EnhancedEdge extends UniverseEdge {
  timestamp?: string;
  evolutionType?: 'direct' | 'indirect' | 'compound';
  strengthOverTime?: { date: string; strength: number }[];
}

// ============================================
// CAPABILITY CLUSTERS - Grouped skill domains
// ============================================

export const capabilityClusters: CapabilityCluster[] = [
  {
    id: 'cluster-hardware',
    name: 'Hardware Engineering',
    description: 'Electronics, circuits, motors, sensors - the foundation',
    color: '#10b981',
    nodeIds: ['electronics', 'arduino', 'esp32', 'raspberry-pi', 'glyph-board', 'bbc-microbit', 'circuitheroes'],
    coreSkills: ['electronics', 'cpp'],
    level: 5,
    growthRate: 4.2,
  },
  {
    id: 'cluster-robotics',
    name: 'Robotics & Automation',
    description: 'From simple motors to autonomous navigation',
    color: '#8b5cf6',
    nodeIds: ['robotics', 'line-robot', 'obstacle-car', 'self-driving-car', 'concept-autonomy'],
    coreSkills: ['robotics', 'electronics', 'cpp'],
    level: 4,
    growthRate: 3.1,
  },
  {
    id: 'cluster-ai-vision',
    name: 'AI & Computer Vision',
    description: 'Machine learning, object detection, smart systems',
    color: '#3b82f6',
    nodeIds: ['computer-vision', 'machine-learning', 'tensorflow', 'opencv', 'mediapipe', 'motionx', 'drishtikon-yantra', 'kyabol'],
    coreSkills: ['python', 'computer-vision', 'machine-learning'],
    level: 3,
    growthRate: 5.8,
  },
  {
    id: 'cluster-fabrication',
    name: '3D Printing & Fabrication',
    description: 'Physical prototyping and manufacturing',
    color: '#f59e0b',
    nodeIds: ['3d-printing', 'prusa-printer', 'bambu-lab', 'fusion360', 'cad-design'],
    coreSkills: ['3d-printing', 'cad-design'],
    level: 4,
    growthRate: 2.5,
  },
  {
    id: 'cluster-entrepreneurship',
    name: 'Entrepreneurship',
    description: 'Business, sales, product thinking',
    color: '#ec4899',
    nodeIds: ['entrepreneurship', 'circuitheroes', 'chhotacreator', 'diy-ebook', 'trademark'],
    coreSkills: ['entrepreneurship', 'public-speaking'],
    level: 4,
    growthRate: 2.0,
  },
  {
    id: 'cluster-aerial',
    name: 'Aerial Systems',
    description: 'Drones, FPV, flight control',
    color: '#06b6d4',
    nodeIds: ['drone-tech', 'hovercraft'],
    coreSkills: ['drone-tech', 'electronics'],
    level: 2,
    growthRate: 1.5,
  },
];

// ============================================
// GROWTH ARCS - Evolution over time
// ============================================

export const growthArcs: GrowthArc[] = [
  {
    id: 'arc-hardware-mastery',
    name: 'Hardware Mastery Arc',
    description: 'From first DC motor to complex autonomous systems',
    startDate: '2022-07',
    currentPhase: 'Advanced Integration',
    milestones: [
      { nodeId: 'first-dc-fan', date: '2022-08', achievement: 'First circuit build' },
      { nodeId: 'hovercraft', date: '2023-12', achievement: 'Complex motor systems' },
      { nodeId: 'self-driving-car', date: '2023-12', achievement: 'Autonomous logic' },
      { nodeId: 'obstacle-car', date: '2025-02', achievement: 'Multi-sensor integration' },
      { nodeId: 'line-robot', date: '2025-11', achievement: 'Advanced navigation' },
      { nodeId: 'drishtikon-yantra', date: '2026-01', achievement: 'Hardware + AI fusion' },
    ],
  },
  {
    id: 'arc-ai-journey',
    name: 'AI & Vision Arc',
    description: 'From basic Python to real-time AI systems',
    startDate: '2024-01',
    currentPhase: 'Real-time Systems',
    milestones: [
      { nodeId: 'python', date: '2024-01', achievement: 'Programming foundation' },
      { nodeId: 'computer-vision', date: '2025-06', achievement: 'Vision basics' },
      { nodeId: 'motionx', date: '2026-01', achievement: 'Real-time motion tracking' },
      { nodeId: 'drishtikon-yantra', date: '2026-01', achievement: 'Assistive vision' },
      { nodeId: 'kyabol', date: '2026-02', achievement: 'Conversational AI' },
    ],
  },
  {
    id: 'arc-entrepreneur',
    name: 'Entrepreneur Arc',
    description: 'From hobby projects to registered products',
    startDate: '2024-03',
    currentPhase: 'Scaling',
    milestones: [
      { nodeId: 'diy-ebook', date: '2024-09', achievement: 'First digital product' },
      { nodeId: 'circuitheroes', date: '2024-10', achievement: 'Physical product launch' },
      { nodeId: 'trademark', date: '2025-01', achievement: 'IP protection' },
      { nodeId: 'malpani-grant', date: '2026-01', achievement: 'External funding' },
    ],
  },
  {
    id: 'arc-recognition',
    name: 'Recognition Arc',
    description: 'From YouTube uploads to global stage',
    startDate: '2022-07',
    currentPhase: 'International',
    milestones: [
      { nodeId: 'first-youtube', date: '2022-07', achievement: 'First documented build' },
      { nodeId: 'hackathon-finalist', date: '2025-07', achievement: 'Competition success' },
      { nodeId: 'residency-youngest', date: '2025-10', achievement: 'USA program' },
      { nodeId: 'isro-demo', date: '2026-02', achievement: 'Demo to ISRO chief' },
      { nodeId: 'gemini-hackathon', date: '2026-02', achievement: 'San Francisco hackathon' },
    ],
  },
];

// ============================================
// CROSS-POLLINATION - Learning transfers
// ============================================

export const crossPollinations: CrossPollination[] = [
  {
    sourceProject: 'circuitheroes',
    targetProject: 'chhotacreator',
    sharedLearning: 'Teaching methodology from card game to platform',
    date: '2024-11',
    impactScore: 85,
  },
  {
    sourceProject: 'obstacle-car',
    targetProject: 'line-robot',
    sharedLearning: 'Sensor array → maze solving algorithms',
    date: '2025-11',
    impactScore: 90,
  },
  {
    sourceProject: 'self-driving-car',
    targetProject: 'drishtikon-yantra',
    sharedLearning: 'Autonomous navigation → assistive vision',
    date: '2026-01',
    impactScore: 95,
  },
  {
    sourceProject: 'opencv',
    targetProject: 'motionx',
    sharedLearning: 'Computer vision basics → real-time body tracking',
    date: '2026-01',
    impactScore: 88,
  },
  {
    sourceProject: 'line-robot',
    targetProject: 'hardvare',
    sharedLearning: 'Hardware logic validation → platform safety',
    date: '2026-02',
    impactScore: 75,
  },
  {
    sourceProject: 'hydration-assistant',
    targetProject: 'drishtikon-yantra',
    sharedLearning: 'Sensor-based assistive tech',
    date: '2026-01',
    impactScore: 70,
  },
  {
    sourceProject: 'diy-ebook',
    targetProject: 'circuitheroes',
    sharedLearning: 'Content creation → product design',
    date: '2024-10',
    impactScore: 65,
  },
  {
    sourceProject: 'arduino',
    targetProject: 'esp32',
    sharedLearning: 'Microcontroller basics → WiFi/BT integration',
    date: '2025-06',
    impactScore: 80,
  },
];

// ============================================
// FUTURE PATHS - Strategic possibilities
// ============================================

export const futurePaths: FuturePath[] = [
  {
    id: 'path-ros',
    name: 'ROS Integration',
    description: 'Industry-standard robotics framework',
    prerequisites: ['robotics', 'line-robot', 'python'],
    unlocks: ['poss-ros', 'Advanced robotics', 'Research collaborations'],
    probability: 75,
    impact: 'high',
    timeframe: '3-6 months',
  },
  {
    id: 'path-custom-pcb',
    name: 'Custom PCB Design',
    description: 'From breadboard to professional boards',
    prerequisites: ['electronics', 'circuitheroes', 'glyph-board'],
    unlocks: ['poss-pcb-design', 'Hardware scaling', 'Product manufacturing'],
    probability: 80,
    impact: 'transformative',
    timeframe: '6-12 months',
  },
  {
    id: 'path-satellite',
    name: 'CubeSat Project',
    description: 'Space tech aligned with ISRO connection',
    prerequisites: ['isro-demo', 'robotics', 'electronics', 'python'],
    unlocks: ['poss-satellite', 'Space industry', 'Global recognition'],
    probability: 60,
    impact: 'transformative',
    timeframe: '12-18 months',
  },
  {
    id: 'path-ted',
    name: 'TEDx Talk',
    description: 'Public speaking milestone',
    prerequisites: ['public-speaking', 'south-park-commons', 'august-fest'],
    unlocks: ['poss-ted-talk', 'Global audience', 'Speaking circuit'],
    probability: 85,
    impact: 'high',
    timeframe: '6-9 months',
  },
  {
    id: 'path-nvidia',
    name: 'NVIDIA Jetson Projects',
    description: 'Next-level edge AI compute',
    prerequisites: ['computer-vision', 'machine-learning', 'python', 'drishtikon-yantra'],
    unlocks: ['poss-nvidia-jetson', 'Advanced AI', 'Industrial applications'],
    probability: 70,
    impact: 'high',
    timeframe: '3-6 months',
  },
  {
    id: 'path-arduino-sponsor',
    name: 'Arduino Partnership',
    description: 'Official sponsorship/collaboration',
    prerequisites: ['arduino', 'circuitheroes', 'concept-maker-education', '170-projects'],
    unlocks: ['poss-arduino-sponsor', 'Hardware sponsorship', 'Global reach'],
    probability: 65,
    impact: 'high',
    timeframe: '6-12 months',
  },
  {
    id: 'path-wearable',
    name: 'Wearable Health Device',
    description: 'Health monitoring using current skills',
    prerequisites: ['electronics', 'iot', 'esp32', 'hydration-assistant'],
    unlocks: ['poss-wearable', 'Healthcare tech', 'Impact-driven products'],
    probability: 55,
    impact: 'high',
    timeframe: '9-12 months',
  },
  {
    id: 'path-smart-farm',
    name: 'Smart Farming System',
    description: 'IoT + automation for agriculture',
    prerequisites: ['iot', 'electronics', 'esp32', 'raspberry-pi'],
    unlocks: ['poss-smart-farm', 'AgriTech', 'Rural impact'],
    probability: 50,
    impact: 'medium',
    timeframe: '12+ months',
  },
];

// ============================================
// INTELLIGENCE EDGES - Evolution & compound
// ============================================

export const intelligenceEdges: EnhancedEdge[] = [
  // Evolution edges - how things evolved
  { source: 'first-dc-fan', target: 'hovercraft', relation: 'EVOLVED_INTO', weight: 60 },
  { source: 'hovercraft', target: 'self-driving-car', relation: 'EVOLVED_INTO', weight: 70 },
  { source: 'self-driving-car', target: 'obstacle-car', relation: 'EVOLVED_INTO', weight: 80 },
  { source: 'obstacle-car', target: 'line-robot', relation: 'EVOLVED_INTO', weight: 85 },
  { source: 'line-robot', target: 'drishtikon-yantra', relation: 'EVOLVED_INTO', weight: 90 },
  
  // Cross-pollination edges
  { source: 'circuitheroes', target: 'chhotacreator', relation: 'CROSS_POLLINATED_WITH', weight: 85 },
  { source: 'opencv', target: 'motionx', relation: 'CROSS_POLLINATED_WITH', weight: 88 },
  { source: 'self-driving-car', target: 'drishtikon-yantra', relation: 'CROSS_POLLINATED_WITH', weight: 95 },
  { source: 'hydration-assistant', target: 'drishtikon-yantra', relation: 'CROSS_POLLINATED_WITH', weight: 70 },
  
  // Capability expansion edges
  { source: 'python', target: 'computer-vision', relation: 'CAPABILITY_EXPANSION', weight: 75 },
  { source: 'computer-vision', target: 'machine-learning', relation: 'CAPABILITY_EXPANSION', weight: 70 },
  { source: 'electronics', target: 'iot', relation: 'CAPABILITY_EXPANSION', weight: 65 },
  { source: 'cpp', target: 'robotics', relation: 'CAPABILITY_EXPANSION', weight: 80 },
  { source: 'entrepreneurship', target: 'trademark', relation: 'CAPABILITY_EXPANSION', weight: 60 },
  
  // Future path edges
  { source: 'robotics', target: 'poss-ros', relation: 'FUTURE_PATH', weight: 75 },
  { source: 'electronics', target: 'poss-pcb-design', relation: 'FUTURE_PATH', weight: 80 },
  { source: 'isro-demo', target: 'poss-satellite', relation: 'FUTURE_PATH', weight: 60 },
  { source: 'public-speaking', target: 'poss-ted-talk', relation: 'FUTURE_PATH', weight: 85 },
  { source: 'computer-vision', target: 'poss-nvidia-jetson', relation: 'FUTURE_PATH', weight: 70 },
  
  // Unlocked achievements
  { source: 'circuitheroes', target: 'trademark', relation: 'UNLOCKED', weight: 90 },
  { source: 'drishtikon-yantra', target: 'param-award', relation: 'UNLOCKED', weight: 85 },
  { source: 'hardvare', target: 'malpani-grant', relation: 'UNLOCKED', weight: 80 },
  
  // Compound edges - skills that amplify each other
  { source: 'electronics', target: 'python', relation: 'COMPOUNDS_WITH', weight: 70 },
  { source: 'robotics', target: 'computer-vision', relation: 'COMPOUNDS_WITH', weight: 80 },
  { source: '3d-printing', target: 'cad-design', relation: 'COMPOUNDS_WITH', weight: 90 },
  { source: 'public-speaking', target: 'entrepreneurship', relation: 'COMPOUNDS_WITH', weight: 75 },
];

// ============================================
// MOMENTUM CALCULATION
// ============================================

export function calculateMomentum(): MomentumMetrics {
  // Skill density: unique skills per year of building
  const skillNodes = rawNodes.filter(n => n.type === 'skill');
  const yearsBuilding = 4; // 2022-2026
  const skillDensity = (skillNodes.length / yearsBuilding) * 10;
  
  // Network expansion: mentors + companies + media
  const networkNodes = rawNodes.filter(n => 
    n.type === 'person' || n.type === 'company' || n.type === 'media'
  );
  const networkExpansion = networkNodes.length * 2.5;
  
  // Brand impact: reach across all connected entities
  const totalReach = rawNodes.reduce((sum, n) => sum + (n.reach || 0), 0);
  const brandImpact = Math.min(100, totalReach / 50000);
  
  // Build frequency: projects per month (170 projects / 42 months)
  const buildFrequency = (170 / 42) * 20;
  
  // Recognition growth: achievements, events, media
  const recognitionNodes = rawNodes.filter(n => 
    n.type === 'achievement' || n.type === 'event' || n.type === 'media'
  );
  const recognitionGrowth = recognitionNodes.length * 3;
  
  // Overall momentum
  const overallMomentum = (
    skillDensity * 0.2 + 
    networkExpansion * 0.15 + 
    brandImpact * 0.25 + 
    buildFrequency * 0.25 + 
    recognitionGrowth * 0.15
  );
  
  return {
    skillDensity: Math.round(skillDensity),
    networkExpansion: Math.round(networkExpansion),
    brandImpact: Math.round(brandImpact),
    buildFrequency: Math.round(buildFrequency),
    recognitionGrowth: Math.round(recognitionGrowth),
    overallMomentum: Math.round(overallMomentum),
  };
}

// ============================================
// AUTO-GENERATED INSIGHTS
// ============================================

export interface Insight {
  id: string;
  type: 'growth' | 'opportunity' | 'compound' | 'milestone' | 'next_step';
  title: string;
  description: string;
  relatedNodes: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionable?: string;
}

export function generateInsights(): Insight[] {
  const insights: Insight[] = [
    {
      id: 'insight-ai-momentum',
      type: 'growth',
      title: 'AI/Vision cluster growing fastest',
      description: 'The AI & Computer Vision cluster has the highest growth rate (5.8 projects/month). MotionX, Drishtikon Yantra, and Kyabol all emerged in 2026.',
      relatedNodes: ['computer-vision', 'motionx', 'drishtikon-yantra', 'kyabol'],
      priority: 'high',
    },
    {
      id: 'insight-hardware-ai-fusion',
      type: 'compound',
      title: 'Hardware + AI = Unique Edge',
      description: 'The combination of deep hardware skills (Level 5) with emerging AI capabilities (Level 3) creates a rare profile. Most AI builders lack hardware depth.',
      relatedNodes: ['electronics', 'computer-vision', 'drishtikon-yantra'],
      priority: 'high',
    },
    {
      id: 'insight-ros-opportunity',
      type: 'opportunity',
      title: 'ROS is 1 step away',
      description: 'Current robotics projects (line-robot, obstacle-car) are perfect foundation for Robot Operating System. This unlocks research collaborations.',
      relatedNodes: ['robotics', 'line-robot', 'poss-ros'],
      priority: 'medium',
      actionable: 'Start with ROS tutorials using Raspberry Pi',
    },
    {
      id: 'insight-pcb-ready',
      type: 'next_step',
      title: 'Ready for custom PCB design',
      description: 'With CircuitHeroes teaching circuits and 50+ hardware projects, next logical step is KiCAD/Altium for custom PCB design.',
      relatedNodes: ['electronics', 'circuitheroes', 'poss-pcb-design'],
      priority: 'medium',
      actionable: 'Design first PCB for a CircuitHeroes expansion',
    },
    {
      id: 'insight-isro-cubesat',
      type: 'opportunity',
      title: 'CubeSat path unlocked',
      description: 'The demo to ISRO chief opens doors for space tech projects. India has active student CubeSat programs.',
      relatedNodes: ['isro-demo', 'poss-satellite'],
      priority: 'low',
    },
    {
      id: 'insight-ted-ready',
      type: 'milestone',
      title: 'TEDx stage ready',
      description: 'With SPC pitch, August Fest panel, and 5+ public speaking events, Laksh has the experience for a TEDx talk.',
      relatedNodes: ['public-speaking', 'south-park-commons', 'august-fest', 'poss-ted-talk'],
      priority: 'high',
      actionable: 'Apply to TEDxHyderabad or TEDxYouth events',
    },
    {
      id: 'insight-entrepreneurship-milestone',
      type: 'milestone',
      title: '₹1.4L+ in grants at age 8',
      description: 'Malpani Grant + AI Grants India + Param support - external validation of builder capabilities.',
      relatedNodes: ['malpani-grant', 'ai-grants-india', 'param-foundation'],
      priority: 'high',
    },
    {
      id: 'insight-cross-pollination-strength',
      type: 'compound',
      title: 'High cross-pollination score',
      description: '8 documented learning transfers between projects. CircuitHeroes teaching methods now power ChhotaCreator.',
      relatedNodes: ['circuitheroes', 'chhotacreator', 'drishtikon-yantra'],
      priority: 'medium',
    },
  ];
  
  return insights;
}

// ============================================
// TIMELINE DATA - For slider animation
// ============================================

export interface TimelineEvent {
  date: string; // YYYY-MM
  nodeId: string;
  type: 'birth' | 'growth' | 'connection' | 'achievement';
}

export const timelineEvents: TimelineEvent[] = [
  // 2022
  { date: '2022-07', nodeId: 'first-youtube', type: 'birth' },
  { date: '2022-08', nodeId: 'first-dc-fan', type: 'birth' },
  
  // 2023
  { date: '2023-09', nodeId: 'food-crane', type: 'birth' },
  { date: '2023-10', nodeId: 'robotic-table', type: 'birth' },
  { date: '2023-11', nodeId: 'drill-bicycle', type: 'birth' },
  { date: '2023-11', nodeId: 'clothes-washer', type: 'birth' },
  { date: '2023-12', nodeId: 'hovercraft', type: 'birth' },
  { date: '2023-12', nodeId: 'self-driving-car', type: 'birth' },
  
  // 2024
  { date: '2024-03', nodeId: 'entrepreneurship', type: 'growth' },
  { date: '2024-04', nodeId: 'electric-skateboard', type: 'birth' },
  { date: '2024-09', nodeId: 'diy-ebook', type: 'birth' },
  { date: '2024-10', nodeId: 'circuitheroes', type: 'birth' },
  
  // 2025
  { date: '2025-01', nodeId: 'obstacle-car', type: 'birth' },
  { date: '2025-02', nodeId: 'trademark', type: 'achievement' },
  { date: '2025-04', nodeId: 't-hub', type: 'connection' },
  { date: '2025-06', nodeId: 'iit-hyderabad', type: 'connection' },
  { date: '2025-07', nodeId: 'hardware-hackathon-2', type: 'achievement' },
  { date: '2025-07', nodeId: 'hackathon-finalist', type: 'achievement' },
  { date: '2025-08', nodeId: 'august-fest', type: 'achievement' },
  { date: '2025-10', nodeId: 'the-residency', type: 'achievement' },
  { date: '2025-10', nodeId: 'residency-youngest', type: 'achievement' },
  { date: '2025-11', nodeId: 'south-park-commons', type: 'achievement' },
  { date: '2025-11', nodeId: 'line-robot', type: 'birth' },
  
  // 2026
  { date: '2026-01', nodeId: 'runtogether-hackathon', type: 'achievement' },
  { date: '2026-01', nodeId: 'motionx', type: 'birth' },
  { date: '2026-01', nodeId: 'param-makeathon', type: 'achievement' },
  { date: '2026-01', nodeId: 'drishtikon-yantra', type: 'birth' },
  { date: '2026-01', nodeId: 'param-award', type: 'achievement' },
  { date: '2026-01', nodeId: 'malpani-grant', type: 'achievement' },
  { date: '2026-02', nodeId: 'gemini-hackathon', type: 'achievement' },
  { date: '2026-02', nodeId: 'kyabol', type: 'birth' },
  { date: '2026-02', nodeId: 'isro-demo', type: 'achievement' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getNodesAtDate(targetDate: string): string[] {
  return timelineEvents
    .filter(e => e.date <= targetDate)
    .map(e => e.nodeId);
}

export function getClusterForNode(nodeId: string): CapabilityCluster | undefined {
  return capabilityClusters.find(c => c.nodeIds.includes(nodeId));
}

export function getGrowthArcsForNode(nodeId: string): GrowthArc[] {
  return growthArcs.filter(arc => 
    arc.milestones.some(m => m.nodeId === nodeId)
  );
}

export function getCrossPollinationsForNode(nodeId: string): CrossPollination[] {
  return crossPollinations.filter(cp => 
    cp.sourceProject === nodeId || cp.targetProject === nodeId
  );
}

export function getFuturePathsForNode(nodeId: string): FuturePath[] {
  return futurePaths.filter(fp => 
    fp.prerequisites.includes(nodeId) || fp.unlocks.includes(nodeId)
  );
}

export function getNodesByYear(year: number): UniverseNode[] {
  return rawNodes.filter(n => n.year === year);
}

// All enhanced edges (original + intelligence)
export function getAllEdges(): EnhancedEdge[] {
  return [...rawEdges as EnhancedEdge[], ...intelligenceEdges];
}

// Export original data
export { rawNodes as nodes, rawEdges as edges };
