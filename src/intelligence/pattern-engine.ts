// ============================================
// PATTERN ENGINE — Neural-style capability discovery
// Finds non-obvious compound relationships
// ============================================

import { nodes, edges } from '../web/data/universe-data';
import type { CapabilityPattern, NarratorInsight } from '../core/universe/node-schema';
import SignalStore from '../data/signal-store';

// ============================================
// COMPOUND PATTERN DEFINITIONS
// These are the known high-signal combinations
// ============================================

interface PatternRule {
  id: string;
  name: string;
  inputNodeIds: string[];
  inputTags?: string[]; // alternate matching by tag
  outputDescription: string;
  type: CapabilityPattern['type'];
  strength: number;
  narratorInsight?: string;
}

const PATTERN_RULES: PatternRule[] = [
  {
    id: 'hardware-ai-compound',
    name: 'Hardware + AI → Autonomous Machines',
    inputNodeIds: ['electronics', 'computer-vision'],
    outputDescription: 'Rare builder profile: physical systems that see, decide, and act. Most AI builders lack hardware depth.',
    type: 'skill_compound',
    strength: 95,
    narratorInsight: 'The combination of deep hardware (Level 5) with computer vision creates a profile most AI researchers spend years trying to achieve.'
  },
  {
    id: 'electronics-teaching-compound',
    name: 'Electronics + Teaching → Educational Hardware Products',
    inputNodeIds: ['electronics', 'teaching'],
    outputDescription: 'Translating complex circuits into teachable, sellable products. CircuitHeroes is the proof.',
    type: 'capability_convergence',
    strength: 88,
    narratorInsight: 'CircuitHeroes is not just a product — it is proof that electronics mastery + teaching instinct creates an entirely new category.'
  },
  {
    id: 'robotics-vision-compound',
    name: 'Robotics + Computer Vision → Self-Directing Systems',
    inputNodeIds: ['robotics', 'computer-vision'],
    outputDescription: 'Machines that navigate by seeing. Foundation for autonomous vehicles, drones, industrial robots.',
    type: 'skill_compound',
    strength: 90,
    narratorInsight: 'Every robotics project so far relies on sensors. Add vision and these projects leap from reactive to truly autonomous.'
  },
  {
    id: 'hardware-startup-chain',
    name: 'Hardware Build → IP → Product → Grant',
    inputNodeIds: ['circuitheroes', 'trademark', 'malpani-grant'],
    outputDescription: 'Full hardware startup arc in one year: build, protect, sell, fund.',
    type: 'project_chain',
    strength: 85,
    narratorInsight: 'This sequence — build product, register trademark, earn grant — is something most adult founders take 3–5 years to do.'
  },
  {
    id: 'ai-acceleration-2026',
    name: 'AI Acceleration Arc',
    inputNodeIds: ['motionx', 'drishtikon-yantra', 'kyabol', 'grant-agent'],
    outputDescription: '4 AI projects shipped in 2 months. Velocity accelerating sharply into 2026.',
    type: 'recognition_acceleration',
    strength: 92,
    narratorInsight: 'January–February 2026: MotionX, Drishtikon Yantra, Kyabol, and Grant Agent all emerged. Cluster velocity: 5.8 projects/month.'
  },
  {
    id: 'teaching-platform-chain',
    name: 'Teaching → eBook → Platform',
    inputNodeIds: ['teaching', 'diy-ebook', 'chhotacreator'],
    outputDescription: 'Teaching instinct evolving into a scalable peer-learning platform.',
    type: 'domain_expansion',
    strength: 78,
    narratorInsight: 'ChhotaCreator grew out of the same instinct that produced the eBook. The teaching DNA is consistent — the format is scaling.'
  },
  {
    id: 'public-stage-acceleration',
    name: 'Speaking → Demos → Media → Grants',
    inputNodeIds: ['public-speaking', 'south-park-commons', 'beats-in-brief', 'malpani-grant'],
    outputDescription: 'Each public appearance generates coverage, which generates funding, which enables more building.',
    type: 'recognition_acceleration',
    strength: 82,
    narratorInsight: 'Recognition is compounding: every stage appearance generates press, press generates grants, grants generate more builds to speak about.'
  },
  {
    id: 'python-ai-stack',
    name: 'Python → Vision → Agents',
    inputNodeIds: ['python', 'opencv', 'ai-agents'],
    outputDescription: 'The full AI software stack is now operational — from data manipulation to real-time vision to autonomous decision-making.',
    type: 'skill_compound',
    strength: 80,
    narratorInsight: 'Python unlocked vision. Vision unlocked agents. The stack is now complete enough to build almost any AI application.'
  },
  {
    id: 'isro-space-unlock',
    name: 'ISRO Demo → CubeSat Path',
    inputNodeIds: ['isro-demo', 'electronics', 'robotics'],
    outputDescription: 'A single meeting with the ISRO chief activated the most ambitious future path: space systems.',
    type: 'domain_expansion',
    strength: 70,
    narratorInsight: 'The demo to Shri Somanath is a rare activation event. CubeSat programs are accessible to young builders with this kind of network.'
  },
  {
    id: 'maker-content-flywheel',
    name: 'Build → Document → Teach → Inspire',
    inputNodeIds: ['youtube-channel', '170-projects', 'chhotacreator', 'teaching'],
    outputDescription: 'A content flywheel: every project becomes a video, videos inspire students, students become the next builders.',
    type: 'capability_convergence',
    strength: 75,
    narratorInsight: '170+ documented projects is not just a portfolio — it is a curriculum. ChhotaCreator is the platform this curriculum needed.'
  },
  // ── Brand Surface Patterns (v7) ──────────────────────────────────
  {
    id: 'event-demos-unlock-collabs',
    name: 'Event Demos → Collaborations',
    inputNodeIds: ['south-park-commons', 'isro-demo', 'public-speaking'],
    outputDescription: 'Live event signals consistently generate direct collaboration requests. Demo days are the highest-leverage surface.',
    type: 'recognition_acceleration',
    strength: 82,
    narratorInsight: 'Every major collaboration in the graph traces back to a live demo or event. The SPC pitch and ISRO meeting are proof: showing work in person accelerates opportunities 3x faster than online presence.',
  },
  {
    id: 'youtube-engineering-credibility',
    name: 'YouTube Builds → Engineering Credibility',
    inputNodeIds: ['youtube-channel', '170-projects', 'motionx'],
    outputDescription: 'Documented builds on YouTube create compounding credibility with engineering communities. Each video is a permanent proof point.',
    type: 'capability_convergence',
    strength: 78,
    narratorInsight: '170+ documented projects is not just a number — it signals systematic, sustained output. Engineering communities reward consistency. Arduino ambassadors, NVIDIA spotlights, and OpenCV communities all actively recruit this profile.',
  },
  {
    id: 'press-coverage-sponsor-magnet',
    name: 'Press Coverage → Sponsor Interest',
    inputNodeIds: ['beats-in-brief', 'malpani-grant', 'param-award'],
    outputDescription: 'Media coverage converts into institutional interest. Grants and awards follow press attention.',
    type: 'project_chain',
    strength: 75,
    narratorInsight: 'Beats in Brief → Malpani Grant is not coincidence — visibility in media directly signals credibility to grant-makers and institutional supporters. Each press feature is worth more than 10 social media posts.',
  },
];

// ============================================
// PATTERN SCANNER
// Checks which patterns are active based on present nodes
// ============================================

export function scanPatterns(): CapabilityPattern[] {
  const nodeIds = new Set(nodes.map(n => n.id));
  const activePatterns: CapabilityPattern[] = [];

  // Confidence multiplier from recent high-confidence signals
  const recentHighConf = new Set<string>();
  const signals = SignalStore.getAllSignals();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  for (const s of signals) {
    if (s.confidence === 'high' && s.date && new Date(s.date) >= threeMonthsAgo) {
      (s.domains || []).forEach(d => recentHighConf.add(d));
      (s.entities || []).forEach(e => recentHighConf.add(e));
    }
  }

  for (const rule of PATTERN_RULES) {
    const allPresent = rule.inputNodeIds.every(id => nodeIds.has(id));
    if (allPresent) {
      // Boost strength if any input node has recent high-confidence signals
      const signalBoost = rule.inputNodeIds.some(id => recentHighConf.has(id)) ? 3 : 0;
      const adjustedStrength = Math.min(100, rule.strength + signalBoost);

      activePatterns.push({
        id: rule.id,
        name: rule.name,
        inputNodes: rule.inputNodeIds,
        outputDescription: rule.outputDescription,
        strength: adjustedStrength,
        type: rule.type,
        discoveredAt: new Date().toISOString().slice(0, 7),
      });
    }
  }

  // Sort by strength descending
  return activePatterns.sort((a, b) => b.strength - a.strength);
}

// ============================================
// COMPOUND ANALYZER
// Finds new potential patterns from node co-occurrence
// ============================================

export function discoverEmergentPatterns(): {
  nodeA: string;
  nodeB: string;
  sharedConnections: number;
  emergentCapability: string;
  strength: number;
}[] {
  const results: { nodeA: string; nodeB: string; sharedConnections: number; emergentCapability: string; strength: number; }[] = [];
  
  // Build adjacency
  const adj: Map<string, Set<string>> = new Map();
  for (const edge of edges) {
    if (!adj.has(edge.source)) adj.set(edge.source, new Set());
    if (!adj.has(edge.target)) adj.set(edge.target, new Set());
    adj.get(edge.source)!.add(edge.target);
    adj.get(edge.target)!.add(edge.source);
  }

  // Skill nodes — look for co-occurring skills
  const skillNodes = nodes.filter(n => n.type === 'skill');
  
  for (let i = 0; i < skillNodes.length; i++) {
    for (let j = i + 1; j < skillNodes.length; j++) {
      const a = skillNodes[i];
      const b = skillNodes[j];
      const aNeighbors = adj.get(a.id) || new Set();
      const bNeighbors = adj.get(b.id) || new Set();
      
      // Count shared project/product connections
      let sharedCount = 0;
      for (const n of aNeighbors) {
        if (bNeighbors.has(n)) sharedCount++;
      }

      if (sharedCount >= 2) {
        results.push({
          nodeA: a.id,
          nodeB: b.id,
          sharedConnections: sharedCount,
          emergentCapability: `${a.label} × ${b.label} co-occurrence across ${sharedCount} projects`,
          strength: Math.min(100, sharedCount * 20),
        });
      }
    }
  }

  return results.sort((a, b) => b.strength - a.strength).slice(0, 8);
}

// ============================================
// PATTERN → NARRATOR INSIGHTS
// ============================================

export function patternsToInsights(patterns: CapabilityPattern[]): NarratorInsight[] {
  return patterns.map(pattern => {
    const rule = PATTERN_RULES.find(r => r.id === pattern.id);
    return {
      id: `insight-${pattern.id}`,
      type: pattern.type === 'recognition_acceleration' ? 'milestone' :
            pattern.type === 'skill_compound' ? 'compound' :
            pattern.type === 'project_chain' ? 'growth' : 'pattern',
      priority: pattern.strength >= 88 ? 'high' : pattern.strength >= 75 ? 'medium' : 'low',
      headline: pattern.name,
      explanation: rule?.narratorInsight || pattern.outputDescription,
      relatedNodeIds: pattern.inputNodes,
    } as NarratorInsight;
  });
}

// ============================================
// EXPORT: All pattern intelligence
// ============================================

export const activePatterns = scanPatterns();
export const emergentPatterns = discoverEmergentPatterns();
export const patternInsights = patternsToInsights(activePatterns);
