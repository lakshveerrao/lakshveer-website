// ============================================
// NARRATOR — Converts system intelligence into human language
// Simple, clear, no jargon. Sounds like a thoughtful mentor.
// ============================================

import { nodes } from '../web/data/universe-data';
import { capabilityClusters, calculateMomentum, futurePaths } from '../web/data/universe-intelligence';
import { activePatterns } from './pattern-engine';
import type { NarratorInsight } from '../core/universe/node-schema';

// ============================================
// CORE NARRATIVE GENERATOR
// ============================================

export function generateNarrative(): {
  summary: string;
  clusterNarrative: string;
  momentumNarrative: string;
  trajectoryNarrative: string;
  uniqueEdgeNarrative: string;
} {
  const momentum = calculateMomentum();
  const topCluster = [...capabilityClusters].sort((a, b) => b.growthRate - a.growthRate)[0];
  const topPattern = activePatterns[0];

  // --- Summary ---
  const projectCount = nodes.filter(n => n.type === 'project' || n.type === 'product').length;
  const summary = `Lakshveer is an 8-year-old builder from Hyderabad who has shipped ${projectCount} documented projects across hardware, robotics, and AI. He started with a DC motor at age 4 and is now building systems that see, decide, and act on their own.`;

  // --- Cluster Narrative ---
  const clusterNarrative = `The strongest cluster right now is ${topCluster?.name || 'Hardware Engineering'}, growing at ${topCluster?.growthRate || 4.2} projects per month. The AI & Computer Vision cluster is accelerating fastest — three significant AI projects shipped in the first two months of 2026 alone.`;

  // --- Momentum Narrative ---
  const momentumNarrative = `Overall momentum sits at ${momentum.overallMomentum}/100. Recognition is the standout metric at ${momentum.recognitionGrowth}/100 — external validation from grants, awards, and press is outpacing what most adult founders achieve in years. Build frequency at ${momentum.buildFrequency}/100 reflects a consistent shipping habit.`;

  // --- Trajectory Narrative ---
  const trajectoryNarrative = `The trajectory shows a deliberate shift: early years were pure hardware mastery. 2024 introduced entrepreneurship. 2025 layered in machine learning and public visibility. 2026 is the AI systems year — every new project combines hardware and intelligence. The next logical step is systems that operate fully autonomously.`;

  // --- Unique Edge Narrative ---
  const uniqueEdgeNarrative = topPattern
    ? `The rarest capability in the current profile is this: ${topPattern.outputDescription} Most builders develop either deep hardware OR AI skills. Having both at level 3+ before age 9 is unusual enough to attract attention from research labs, hardware startups, and accelerators.`
    : `Hardware depth combined with emerging AI capabilities creates a profile most engineers spend years building. This convergence is the clearest differentiator.`;

  return {
    summary,
    clusterNarrative,
    momentumNarrative,
    trajectoryNarrative,
    uniqueEdgeNarrative,
  };
}

// ============================================
// INSIGHT GENERATOR — produces NarratorInsights
// ============================================

export function generateAllInsights(): NarratorInsight[] {
  const momentum = calculateMomentum();
  const insights: NarratorInsight[] = [];

  // 1. Fastest growing cluster
  const fastestCluster = [...capabilityClusters].sort((a, b) => b.growthRate - a.growthRate)[0];
  if (fastestCluster) {
    insights.push({
      id: 'insight-fastest-cluster',
      type: 'growth',
      priority: 'high',
      headline: `${fastestCluster.name} growing fastest`,
      explanation: `The ${fastestCluster.name} cluster has a growth rate of ${fastestCluster.growthRate} projects per month — the highest across all capability domains. This cluster is where the most recent energy is going.`,
      relatedNodeIds: fastestCluster.nodeIds.slice(0, 4),
    });
  }

  // 2. Hardware + AI compound
  const hwNodes = nodes.filter(n => ['electronics', 'arduino', 'raspberry-pi'].includes(n.id));
  const aiNodes = nodes.filter(n => ['computer-vision', 'machine-learning', 'tensorflow'].includes(n.id));
  if (hwNodes.length >= 2 && aiNodes.length >= 2) {
    insights.push({
      id: 'insight-hardware-ai-compound',
      type: 'compound',
      priority: 'high',
      headline: 'Hardware + AI = Rare Profile',
      explanation: 'Deep hardware skills (Level 5) combined with AI capabilities (Level 3) creates a profile most engineers take years to build. Most AI builders lack hardware depth. Most hardware engineers lack AI intuition. Having both before age 9 is genuinely rare.',
      relatedNodeIds: ['electronics', 'computer-vision', 'drishtikon-yantra'],
    });
  }

  // 3. Recognition milestone
  if (momentum.recognitionGrowth >= 85) {
    insights.push({
      id: 'insight-recognition-peak',
      type: 'milestone',
      priority: 'high',
      headline: `₹1.4L+ in grants at age 8`,
      explanation: 'Malpani Grant, AI Grants India support, and Param Foundation backing — multiple independent funding sources at age 8 signal external validation well beyond typical youth recognition.',
      relatedNodeIds: ['malpani-grant', 'ai-grants-india', 'param-foundation'],
    });
  }

  // 4. TEDx readiness
  const speakingEvents = nodes.filter(n => 
    ['august-fest', 'south-park-commons', 'isro-demo', 'param-makeathon', 'iit-hyderabad-workshop'].includes(n.id)
  );
  if (speakingEvents.length >= 4) {
    insights.push({
      id: 'insight-tedx-ready',
      type: 'milestone',
      priority: 'high',
      headline: 'TEDx stage ready',
      explanation: `With ${speakingEvents.length}+ documented public speaking events including a panel at August Fest and a pitch at South Park Commons, the public speaking foundation for a TEDx is already in place.`,
      relatedNodeIds: ['public-speaking', 'south-park-commons', 'august-fest'],
      actionable: 'Next step: Apply to TEDxHyderabad or TEDxYouth',
    });
  }

  // 5. ROS opportunity
  insights.push({
    id: 'insight-ros-opportunity',
    type: 'opportunity',
    priority: 'medium',
    headline: 'ROS is 1 step away',
    explanation: 'The line-following robot and obstacle-avoiding car are exactly the kinds of projects that ROS was designed for. Adding ROS now unlocks research lab collaborations, IISER/IIT project partnerships, and a different tier of robotics competition.',
    relatedNodeIds: ['robotics', 'line-robot', 'poss-ros'],
    actionable: 'Start with ROS2 tutorials on Raspberry Pi — first project: port the line robot.',
  });

  // 6. PCB design next step
  insights.push({
    id: 'insight-pcb-next',
    type: 'next_step',
    priority: 'medium',
    headline: 'Custom PCB is the next hardware unlock',
    explanation: 'CircuitHeroes already teaches circuit design. With 50+ hardware projects and a Trademark registered, designing a custom PCB for a CircuitHeroes expansion is the logical next level. KiCAD is free and learnable.',
    relatedNodeIds: ['electronics', 'circuitheroes', 'poss-pcb-design'],
    actionable: 'Design first PCB on KiCAD: a custom CircuitHeroes expansion card.',
  });

  // 7. Cross-pollination insight
  insights.push({
    id: 'insight-cross-pollination',
    type: 'compound',
    priority: 'medium',
    headline: '8 documented learning transfers',
    explanation: 'CircuitHeroes teaching methods power ChhotaCreator. Robotics sensor work feeds into computer vision. Each domain is enriching the others — this is compounding learning, not linear accumulation.',
    relatedNodeIds: ['circuitheroes', 'chhotacreator', 'drishtikon-yantra'],
  });

  // 8. ISRO space path
  insights.push({
    id: 'insight-space-path',
    type: 'opportunity',
    priority: 'low',
    headline: 'CubeSat path is unlocked',
    explanation: 'The demo to former ISRO Chief Shri Somanath opens the door to student satellite programs. India runs active CubeSat programs for young builders. This is a 12–18 month path, but the door is now open.',
    relatedNodeIds: ['isro-demo', 'poss-satellite'],
  });

  return insights;
}

// ============================================
// NODE NARRATOR — generate a readable description for any node
// ============================================

export function narrateNode(nodeId: string): string {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return '';

  const cluster = capabilityClusters.find(c => c.nodeIds.includes(nodeId));
  const relatedFuturePaths = futurePaths.filter(fp => fp.prerequisites.includes(nodeId));

  let narrative = node.description || '';

  if (cluster) {
    narrative += ` Part of the ${cluster.name} cluster (Level ${cluster.level}).`;
  }

  if (relatedFuturePaths.length > 0) {
    const paths = relatedFuturePaths.map(fp => fp.name).join(', ');
    narrative += ` This node is a prerequisite for: ${paths}.`;
  }

  return narrative;
}

// ============================================
// EXPORT: Singleton insights and narrative
// ============================================

export const narrative = generateNarrative();
export const narratorInsights = generateAllInsights();
