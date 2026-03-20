// ============================================
// WORKSPACE ENGINE — Universe v5.5
// Generates actionable workspace context for each node
// v5.5: Added discover section from opportunity + signal engines
// ============================================

import { nodes, edges } from '../web/data/universe-data';
import { capabilityClusters } from '../web/data/universe-intelligence';
import { futurePredictions, opportunityMatches } from './future-engine';
import { activePatterns } from './pattern-engine';
import { getOpportunitiesForNode } from './opportunity-engine';
import { getSignalsForNode } from './signal-engine';
import type { NodeWorkspace, WorkspaceItem } from '../workspaces/node-workspace';

const MAX_ITEMS = 5;

// ============================================
// HELPERS
// ============================================

function getNeighborIds(nodeId: string): Set<string> {
  const ids = new Set<string>();
  for (const edge of edges) {
    if (edge.source === nodeId) ids.add(edge.target);
    if (edge.target === nodeId) ids.add(edge.source);
  }
  return ids;
}

function getClusterFor(nodeId: string) {
  return capabilityClusters.find(c => c.nodeIds.includes(nodeId));
}

// ============================================
// LEARN — What to explore next from this node
// ============================================

function generateLearn(nodeId: string): WorkspaceItem[] {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return [];

  const items: WorkspaceItem[] = [];

  // Future paths directly enabled by this node
  const enabledPaths = futurePredictions
    .filter(p => p.enabledBy.includes(nodeId))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 3);

  for (const path of enabledPaths) {
    items.push({
      id: `learn-path-${path.id}`,
      title: `Learn: ${path.label}`,
      description: path.description,
      action: 'Explore this path',
      effort: path.probability > 80 ? 'low' : 'medium',
      priority: path.probability,
      badge: path.impact === 'transformative' ? 'High Impact' : undefined,
    });
  }

  // Cluster-level learning suggestions
  const cluster = getClusterFor(nodeId);
  if (cluster && items.length < MAX_ITEMS) {
    const clusterLevel = cluster.level || 1;
    if (clusterLevel < 5) {
      items.push({
        id: `learn-cluster-${cluster.id}`,
        title: `Advance in ${cluster.name}`,
        description: `You're at Level ${clusterLevel} in ${cluster.name}. Deepen this cluster to unlock compound capabilities.`,
        action: 'See cluster path',
        effort: 'medium',
        priority: clusterLevel * 15,
        badge: clusterLevel >= 4 ? 'Almost Mastery' : undefined,
      });
    }
  }

  // Node-type specific suggestions
  if (node.type === 'skill' && items.length < MAX_ITEMS) {
    items.push({
      id: `learn-skill-docs-${nodeId}`,
      title: `Deep documentation for ${node.label}`,
      description: `Explore official documentation, open-source projects, and research papers to push ${node.label} to the next level.`,
      action: 'Find resources',
      effort: 'low',
      priority: 40,
    });
  }

  if (node.type === 'product' && items.length < MAX_ITEMS) {
    const neighborIds = getNeighborIds(nodeId);
    const relatedSkills = nodes.filter(n => n.type === 'skill' && !neighborIds.has(n.id) && n.id !== nodeId).slice(0, 2);
    for (const skill of relatedSkills) {
      if (items.length >= MAX_ITEMS) break;
      items.push({
        id: `learn-related-${nodeId}-${skill.id}`,
        title: `Apply ${skill.label} to ${node.label}`,
        description: `Connecting ${skill.label} skills to ${node.label} could open new feature directions.`,
        effort: 'medium',
        priority: 35,
      });
    }
  }

  return items.slice(0, MAX_ITEMS);
}

// ============================================
// BUILD — Project ideas, prototypes, extensions
// ============================================

function generateBuild(nodeId: string): WorkspaceItem[] {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return [];

  const items: WorkspaceItem[] = [];
  const neighborIds = getNeighborIds(nodeId);

  // Pattern-based build ideas
  const relatedPatterns = activePatterns
    .filter(p => p.inputNodes.includes(nodeId))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 2);

  for (const pattern of relatedPatterns) {
    items.push({
      id: `build-pattern-${pattern.id}`,
      title: `Build: ${pattern.name}`,
      description: pattern.outputDescription,
      action: 'Start building',
      effort: 'medium',
      priority: pattern.strength,
      badge: pattern.strength >= 90 ? 'High Signal' : undefined,
    });
  }

  // Future paths as build targets
  const buildPaths = futurePredictions
    .filter(p => p.enabledBy.includes(nodeId) && p.impact !== 'low')
    .filter(p => !items.find(i => i.id.includes(p.id)))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, 2);

  for (const path of buildPaths) {
    if (items.length >= MAX_ITEMS) break;
    items.push({
      id: `build-future-${path.id}`,
      title: path.label,
      description: path.description,
      action: 'Prototype it',
      effort: path.probability > 75 ? 'low' : 'high',
      priority: path.probability,
      badge: path.timeframe.includes('3') ? 'Quick Start' : undefined,
    });
  }

  // Product nodes get extension ideas
  if (node.type === 'product' && items.length < MAX_ITEMS) {
    items.push({
      id: `build-extend-${nodeId}`,
      title: `Extend ${node.label}`,
      description: `Add a new feature, expansion, or integration to ${node.label}. Analyze current user feedback and gap areas.`,
      action: 'Brainstorm features',
      effort: 'medium',
      priority: 55,
    });
  }

  // Project nodes: document + open-source
  if (node.type === 'project' && items.length < MAX_ITEMS) {
    items.push({
      id: `build-oss-${nodeId}`,
      title: `Open-source ${node.label}`,
      description: `Publish ${node.label} on GitHub with documentation. Increases visibility and invites collaborators.`,
      action: 'Prepare for open-source',
      effort: 'low',
      priority: 50,
      badge: 'Quick Win',
    });
  }

  // Skill + neighbor cross-pollination
  if (node.type === 'skill' && items.length < MAX_ITEMS) {
    const connectedProjects = nodes.filter(n =>
      (n.type === 'project' || n.type === 'product') && neighborIds.has(n.id)
    ).slice(0, 2);

    for (const project of connectedProjects) {
      if (items.length >= MAX_ITEMS) break;
      items.push({
        id: `build-cross-${nodeId}-${project.id}`,
        title: `Upgrade ${project.label} with ${node.label}`,
        description: `Apply deeper ${node.label} capabilities to push ${project.label} forward. Unlock new capabilities.`,
        effort: 'medium',
        priority: 45,
      });
    }
  }

  return items.slice(0, MAX_ITEMS);
}

// ============================================
// OPPORTUNITIES — Grants, programs, competitions
// Sourced from future-engine opportunityMatches
// ============================================

function generateOpportunities(nodeId: string): WorkspaceItem[] {
  const relevant = opportunityMatches
    .filter(o => o.matchedCapabilities.includes(nodeId))
    .sort((a, b) => b.probability - a.probability)
    .slice(0, MAX_ITEMS);

  return relevant.map(o => ({
    id: `opp-${o.id}`,
    title: o.title,
    description: o.whyRelevant,
    action: o.nextAction,
    url: o.url,
    effort: o.effort,
    priority: o.probability,
    badge: o.probability >= 80 ? 'Strong Match' : o.effort === 'low' ? 'Easy Apply' : undefined,
  }));
}

// ============================================
// CONNECT — People, orgs, communities to reach
// ============================================

function generateConnect(nodeId: string): WorkspaceItem[] {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return [];

  const items: WorkspaceItem[] = [];
  const neighborIds = getNeighborIds(nodeId);

  // Person nodes that could be relevant
  const personNodes = nodes.filter(n =>
    n.type === 'person' && !neighborIds.has(n.id) && n.id !== nodeId
  ).slice(0, 3);

  for (const person of personNodes) {
    items.push({
      id: `connect-person-${nodeId}-${person.id}`,
      title: `Reach ${person.label}`,
      description: person.description || `${person.label} may offer valuable connections or mentorship for ${node.label}.`,
      action: person.url ? 'Connect online' : 'Find contact',
      url: person.url,
      effort: 'low',
      priority: (person.reach || 0) > 1000 ? 70 : 45,
      badge: (person.reach || 0) > 10000 ? 'High Reach' : undefined,
    });
  }

  // Company/org nodes that match this node's cluster
  const cluster = getClusterFor(nodeId);
  const orgNodes = nodes.filter(n =>
    (n.type === 'company') && !neighborIds.has(n.id) && n.id !== nodeId
  ).slice(0, 2);

  for (const org of orgNodes) {
    if (items.length >= MAX_ITEMS) break;
    items.push({
      id: `connect-org-${nodeId}-${org.id}`,
      title: `Engage with ${org.label}`,
      description: org.description || `${org.label} is an organization in this space worth connecting with${cluster ? ` for ${cluster.name}` : ''}.`,
      action: org.url ? 'Visit website' : 'Research first',
      url: org.url,
      effort: 'low',
      priority: 50,
    });
  }

  // Opportunity-based connections
  const oppConnections = opportunityMatches
    .filter(o => o.matchedCapabilities.includes(nodeId) && o.type === 'collaborator')
    .slice(0, 2);

  for (const opp of oppConnections) {
    if (items.length >= MAX_ITEMS) break;
    items.push({
      id: `connect-opp-${opp.id}`,
      title: opp.title,
      description: opp.whyRelevant,
      action: opp.nextAction,
      url: opp.url,
      effort: opp.effort,
      priority: opp.probability,
    });
  }

  return items.slice(0, MAX_ITEMS);
}

// ============================================
// COLLABORATE — Projects or teams to join
// ============================================

function generateCollaborate(nodeId: string): WorkspaceItem[] {
  const node = nodes.find(n => n.id === nodeId);
  if (!node) return [];

  const items: WorkspaceItem[] = [];

  // Nodes in building/potential status — collaboration targets
  const buildingNodes = nodes.filter(n =>
    (n.status === 'building' || n.status === 'potential') &&
    n.id !== nodeId && n.type !== 'possibility'
  ).slice(0, 3);

  for (const target of buildingNodes) {
    items.push({
      id: `collab-${nodeId}-${target.id}`,
      title: `Contribute to ${target.label}`,
      description: target.description || `${target.label} is being built. Relevant skills from ${node.label} could accelerate it.`,
      action: 'Explore collaboration',
      effort: 'medium',
      priority: target.weight || 40,
      badge: target.status === 'building' ? 'Active Build' : undefined,
    });
  }

  // Pattern-based collaborations
  const relatedPatterns = activePatterns
    .filter(p => p.inputNodes.includes(nodeId))
    .slice(0, 2);

  for (const pattern of relatedPatterns) {
    if (items.length >= MAX_ITEMS) break;
    const otherNodes = pattern.inputNodes.filter(id => id !== nodeId);
    for (const otherId of otherNodes.slice(0, 1)) {
      const otherNode = nodes.find(n => n.id === otherId);
      if (otherNode) {
        items.push({
          id: `collab-pattern-${pattern.id}-${otherId}`,
          title: `Collaborate via ${pattern.name}`,
          description: `The ${pattern.name} pattern suggests joint work with ${otherNode.label} could produce: ${pattern.outputDescription}`,
          action: 'Set up collaboration',
          effort: 'medium',
          priority: pattern.strength,
          badge: 'Pattern Match',
        });
      }
    }
  }

  // Fellowship / lab opportunities
  const labOpps = opportunityMatches
    .filter(o => o.matchedCapabilities.includes(nodeId) && (o.type === 'lab' || o.type === 'fellowship'))
    .slice(0, 2);

  for (const opp of labOpps) {
    if (items.length >= MAX_ITEMS) break;
    items.push({
      id: `collab-lab-${opp.id}`,
      title: opp.title,
      description: opp.whyRelevant,
      action: opp.nextAction,
      url: opp.url,
      effort: opp.effort,
      priority: opp.probability,
    });
  }

  return items.slice(0, MAX_ITEMS);
}

// ============================================
// COMPETE — Competitions, hackathons, challenges
// ============================================

function generateCompete(nodeId: string): WorkspaceItem[] {
  const items: WorkspaceItem[] = [];

  // Hackathon & conference opportunities
  const competeOpps = opportunityMatches
    .filter(o =>
      o.matchedCapabilities.includes(nodeId) &&
      (o.type === 'hackathon' || o.type === 'conference' || o.type === 'grant')
    )
    .sort((a, b) => b.probability - a.probability)
    .slice(0, MAX_ITEMS);

  for (const opp of competeOpps) {
    items.push({
      id: `compete-${opp.id}`,
      title: opp.title,
      description: opp.whyRelevant,
      action: opp.nextAction,
      url: opp.url,
      effort: opp.effort,
      priority: opp.probability,
      badge: opp.probability >= 80 ? 'Top Match' : undefined,
    });
  }

  // Future paths with competitive angle
  if (items.length < MAX_ITEMS) {
    const compPaths = futurePredictions
      .filter(p =>
        p.enabledBy.includes(nodeId) &&
        p.impact === 'transformative'
      )
      .slice(0, 2);

    for (const path of compPaths) {
      if (items.length >= MAX_ITEMS) break;
      items.push({
        id: `compete-path-${path.id}`,
        title: path.label,
        description: path.description,
        action: 'Start preparation',
        effort: 'high' as const,
        priority: path.probability,
        badge: 'Milestone',
      });
    }
  }

  return items.slice(0, MAX_ITEMS);
}

// ============================================
// v5.5: DISCOVER — Real-world events, competitions, labs, grants
// Sourced from opportunity engine + signal engine
// ============================================

function generateDiscover(nodeId: string): WorkspaceItem[] {
  const items: WorkspaceItem[] = [];

  // 1. Opportunity engine results (real-world opportunities)
  const opportunities = getOpportunitiesForNode(nodeId);
  for (const opp of opportunities) {
    items.push({
      id: `discover-opp-${opp.id}`,
      title: opp.title,
      description: opp.description,
      action: opp.link ? 'Explore →' : 'Research',
      url: opp.link,
      priority: opp.matchScore,
      badge: opp.triggeredBy !== 'graph' ? 'Signal' :
             opp.matchScore >= 75 ? 'Strong Match' :
             opp.type === 'hackathon' || opp.type === 'competition' ? 'Competition' :
             opp.type === 'grant' ? 'Funding' :
             opp.type === 'lab' ? 'Research' :
             opp.type === 'community' ? 'Community' : undefined,
    });
  }

  // 2. Signal-derived: if a signal mentions organizations not in graph, surface them
  const signals = getSignalsForNode(nodeId);
  const existingNodeIds = new Set(nodes.map(n => n.id));

  for (const signal of signals) {
    if (items.length >= MAX_ITEMS) break;
    if (signal.organizations) {
      for (const org of signal.organizations) {
        if (items.length >= MAX_ITEMS) break;
        // Only surface if not already an opportunity
        const orgLower = org.toLowerCase();
        const alreadyCovered = items.some(i => i.title.toLowerCase().includes(orgLower));
        if (!alreadyCovered) {
          items.push({
            id: `discover-sig-org-${signal.id}-${org.replace(/\s+/g, '-').toLowerCase()}`,
            title: `Explore ${org}`,
            description: `Mentioned in: ${signal.title}. Potential collaboration or program opportunity.`,
            action: signal.url ? 'Visit →' : 'Research',
            url: signal.url || undefined,
            priority: 45,
            badge: 'Signal',
          });
        }
      }
    }
  }

  return items.slice(0, MAX_ITEMS);
}

// ============================================
// MAIN GENERATOR
// ============================================

export function generateWorkspace(nodeId: string): NodeWorkspace {
  return {
    nodeId,
    generatedAt: Date.now(),
    learn: generateLearn(nodeId),
    build: generateBuild(nodeId),
    discover: generateDiscover(nodeId),
    opportunities: generateOpportunities(nodeId),
    connect: generateConnect(nodeId),
    collaborate: generateCollaborate(nodeId),
    compete: generateCompete(nodeId),
  };
}
