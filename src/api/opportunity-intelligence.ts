// ============================================
// OPPORTUNITY INTELLIGENCE ENGINE v3
// LLM-powered creative opportunity generation
// Graph traversal → Pattern detection → LLM reasoning
// ============================================

// Note: LLM integration commented out for now - will be added via external API call

// Types
interface GraphNode {
  id: string;
  label: string;
  type: string;
  description: string;
  cluster_id?: string;
  impact_score?: number;
  momentum?: number;
  meta?: any;
  url?: string;
}

interface GraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
  label?: string;
  weight?: number;
}

interface Cluster {
  id: string;
  label: string;
  description?: string;
  color?: string;
  level: number;
  momentum?: number;
  core_skills?: string[];
}

export interface IntelligentOpportunity {
  id: string;
  type: 'path' | 'combination' | 'network' | 'timing' | 'content' | 'gap' | 'product' | 'partnership';
  title: string;
  insight: string;
  reasoning: string[];
  pathNodes: string[];
  pathEdges: string[];
  nodeLabels: string[];
  valueForLaksh: string;
  valueForThem: string;
  mutualBenefit: string;
  nextStep: string;
  actionSteps?: string[];
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  confidence: number;
  novelty: number;
  targetNodeId?: string;
  category?: string;
  source: 'graph' | 'llm' | 'hybrid';
}

interface OpportunityContext {
  lakshProfile: {
    age: number;
    location: string;
    headline: string;
    keyBuilds: string[];
    keySkills: string[];
    keyAchievements: string[];
  };
  clusters: Cluster[];
  recentActivity: string[];
  existingConnections: string[];
}

// ============================================
// ENHANCED GRAPH TRAVERSAL
// ============================================

export class EnhancedGraphTraversal {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];
  private adjacency: Map<string, { nodeId: string; edge: GraphEdge; direction: 'out' | 'in' }[]> = new Map();
  private nodeOpportunityCount: Map<string, number> = new Map();
  
  constructor(nodes: GraphNode[], edges: GraphEdge[]) {
    for (const node of nodes) {
      this.nodes.set(node.id, node);
      this.adjacency.set(node.id, []);
      this.nodeOpportunityCount.set(node.id, 0);
    }
    
    this.edges = edges;
    for (const edge of edges) {
      const sourceAdj = this.adjacency.get(edge.source_id) || [];
      const targetAdj = this.adjacency.get(edge.target_id) || [];
      
      sourceAdj.push({ nodeId: edge.target_id, edge, direction: 'out' });
      targetAdj.push({ nodeId: edge.source_id, edge, direction: 'in' });
      
      this.adjacency.set(edge.source_id, sourceAdj);
      this.adjacency.set(edge.target_id, targetAdj);
    }
  }
  
  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }
  
  getAllNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }
  
  getNeighbors(nodeId: string): { nodeId: string; edge: GraphEdge; direction: 'out' | 'in' }[] {
    return this.adjacency.get(nodeId) || [];
  }
  
  /**
   * Get all paths from a node with detailed metadata
   */
  getAllPathsWithMetadata(fromNode: string, maxLength: number = 3): {
    path: string[];
    nodes: GraphNode[];
    edges: GraphEdge[];
    types: string[];
    totalWeight: number;
  }[] {
    const results: {
      path: string[];
      nodes: GraphNode[];
      edges: GraphEdge[];
      types: string[];
      totalWeight: number;
    }[] = [];
    const visited = new Set<string>();
    
    const dfs = (
      current: string,
      path: string[],
      pathNodes: GraphNode[],
      pathEdges: GraphEdge[],
      depth: number
    ) => {
      if (depth > maxLength) return;
      
      visited.add(current);
      const node = this.nodes.get(current);
      if (node) {
        path.push(current);
        pathNodes.push(node);
      }
      
      if (path.length >= 2) {
        const types = pathNodes.map(n => n.type);
        const totalWeight = pathEdges.reduce((sum, e) => sum + (e.weight || 50), 0);
        results.push({
          path: [...path],
          nodes: [...pathNodes],
          edges: [...pathEdges],
          types,
          totalWeight,
        });
      }
      
      const neighbors = this.adjacency.get(current) || [];
      for (const { nodeId, edge } of neighbors) {
        if (!visited.has(nodeId)) {
          dfs(nodeId, path, pathNodes, [...pathEdges, edge], depth + 1);
        }
      }
      
      path.pop();
      pathNodes.pop();
      visited.delete(current);
    };
    
    dfs(fromNode, [], [], [], 0);
    return results;
  }
  
  /**
   * Find second-degree connections (introductions)
   */
  findIntroductionOpportunities(fromNode: string): {
    intermediary: GraphNode;
    target: GraphNode;
    edge1: GraphEdge;
    edge2: GraphEdge;
    strength: number;
  }[] {
    const opportunities: {
      intermediary: GraphNode;
      target: GraphNode;
      edge1: GraphEdge;
      edge2: GraphEdge;
      strength: number;
    }[] = [];
    
    const directConnections = new Set(this.getNeighbors(fromNode).map(n => n.nodeId));
    directConnections.add(fromNode);
    
    for (const { nodeId: intermediaryId, edge: edge1 } of this.getNeighbors(fromNode)) {
      const intermediary = this.nodes.get(intermediaryId);
      if (!intermediary) continue;
      
      // Only consider people as intermediaries
      if (intermediary.type !== 'person') continue;
      
      for (const { nodeId: targetId, edge: edge2 } of this.getNeighbors(intermediaryId)) {
        if (directConnections.has(targetId)) continue;
        
        const target = this.nodes.get(targetId);
        if (!target) continue;
        
        // Interesting targets: orgs, events, high-impact people
        const isInteresting = 
          target.type === 'organization' ||
          target.type === 'event' ||
          target.type === 'company' ||
          (target.type === 'person' && (target.impact_score || 0) > 60);
        
        if (isInteresting) {
          const strength = (intermediary.impact_score || 50) * ((target.impact_score || 50) / 100);
          opportunities.push({ intermediary, target, edge1, edge2, strength });
        }
      }
    }
    
    return opportunities.sort((a, b) => b.strength - a.strength);
  }
  
  /**
   * Find cluster bridges - nodes connecting multiple capability areas
   */
  findClusterBridgeOpportunities(): {
    node: GraphNode;
    bridgedClusters: string[];
    potential: string;
  }[] {
    const bridges: {
      node: GraphNode;
      bridgedClusters: string[];
      potential: string;
    }[] = [];
    
    for (const [nodeId, neighbors] of this.adjacency.entries()) {
      const node = this.nodes.get(nodeId);
      if (!node || node.type !== 'project') continue;
      
      const clusters = new Set<string>();
      if (node.cluster_id) clusters.add(node.cluster_id);
      
      for (const { nodeId: neighborId } of neighbors) {
        const neighbor = this.nodes.get(neighborId);
        if (neighbor?.cluster_id) clusters.add(neighbor.cluster_id);
      }
      
      if (clusters.size >= 2) {
        const clusterLabels = Array.from(clusters);
        bridges.push({
          node,
          bridgedClusters: clusterLabels,
          potential: `${node.label} connects ${clusterLabels.join(' + ')} - unique combination`,
        });
      }
    }
    
    return bridges;
  }
  
  /**
   * Get nodes by type with filtering
   */
  getNodesByType(type: string, filter?: (node: GraphNode) => boolean): GraphNode[] {
    const nodes = Array.from(this.nodes.values()).filter(n => n.type === type);
    return filter ? nodes.filter(filter) : nodes;
  }
  
  /**
   * Get external opportunity targets (orgs, events, companies not directly connected)
   */
  getExternalTargets(excludeConnectedTo: string): GraphNode[] {
    const connected = new Set(this.getNeighbors(excludeConnectedTo).map(n => n.nodeId));
    connected.add(excludeConnectedTo);
    
    return Array.from(this.nodes.values()).filter(n => 
      !connected.has(n.id) &&
      (n.type === 'organization' || n.type === 'event' || n.type === 'company')
    );
  }
  
  /**
   * Increment opportunity count for a node (for visual indicators)
   */
  incrementOpportunityCount(nodeId: string): void {
    const current = this.nodeOpportunityCount.get(nodeId) || 0;
    this.nodeOpportunityCount.set(nodeId, current + 1);
  }
  
  /**
   * Get all node opportunity counts
   */
  getOpportunityCounts(): Map<string, number> {
    return this.nodeOpportunityCount;
  }
}

// ============================================
// LLM-POWERED OPPORTUNITY GENERATOR
// ============================================

export class LLMOpportunityGenerator {
  private graph: EnhancedGraphTraversal;
  private clusters: Cluster[];
  private context: OpportunityContext;
  private llmEnabled: boolean = false;
  
  constructor(
    graph: EnhancedGraphTraversal,
    clusters: Cluster[],
    context: OpportunityContext,
    openaiKey?: string
  ) {
    this.graph = graph;
    this.clusters = clusters;
    this.context = context;
    
    // LLM can be enabled later via external API
    this.llmEnabled = false;
  }
  
  /**
   * Generate all opportunities using graph analysis + LLM
   */
  async generateAllOpportunities(): Promise<{
    opportunities: IntelligentOpportunity[];
    nodeCounts: Record<string, number>;
    byType: Record<string, number>;
  }> {
    const opportunities: IntelligentOpportunity[] = [];
    
    // 1. Path-based opportunities (graph traversal)
    const pathOpps = this.generatePathOpportunities();
    opportunities.push(...pathOpps);
    
    // 2. Introduction opportunities (2-hop network)
    const introOpps = this.generateIntroductionOpportunities();
    opportunities.push(...introOpps);
    
    // 3. Skill combination opportunities
    const comboOpps = await this.generateCombinationOpportunities();
    opportunities.push(...comboOpps);
    
    // 4. Content/narrative opportunities
    const contentOpps = this.generateContentOpportunities();
    opportunities.push(...contentOpps);
    
    // 5. Gap-filling opportunities
    const gapOpps = this.generateGapOpportunities();
    opportunities.push(...gapOpps);
    
    // 6. LLM creative opportunities (disabled for now - can be enabled via external API)
    // if (this.llmEnabled) {
    //   const llmOpps = await this.generateLLMOpportunities();
    //   opportunities.push(...llmOpps);
    // }
    
    // Update node opportunity counts
    for (const opp of opportunities) {
      if (opp.targetNodeId) {
        this.graph.incrementOpportunityCount(opp.targetNodeId);
      }
      for (const nodeId of opp.pathNodes) {
        this.graph.incrementOpportunityCount(nodeId);
      }
    }
    
    // Sort by score
    opportunities.sort((a, b) => (b.confidence * b.novelty) - (a.confidence * a.novelty));
    
    // Calculate stats
    const byType: Record<string, number> = {};
    for (const opp of opportunities) {
      byType[opp.type] = (byType[opp.type] || 0) + 1;
    }
    
    const nodeCounts: Record<string, number> = {};
    for (const [nodeId, count] of this.graph.getOpportunityCounts()) {
      if (count > 0) nodeCounts[nodeId] = count;
    }
    
    return { opportunities, nodeCounts, byType };
  }
  
  /**
   * Generate path-based opportunities
   */
  private generatePathOpportunities(): IntelligentOpportunity[] {
    const opportunities: IntelligentOpportunity[] = [];
    const paths = this.graph.getAllPathsWithMetadata('lakshveer', 3);
    
    // Find interesting paths
    for (const { path, nodes, edges, types, totalWeight } of paths) {
      if (nodes.length < 2) continue;
      
      const endNode = nodes[nodes.length - 1];
      
      // Look for high-value end nodes
      const isHighValue = 
        endNode.type === 'organization' ||
        endNode.type === 'event' ||
        (endNode.type === 'person' && endNode.id !== 'capt-venkat' && (endNode.impact_score || 0) > 70);
      
      if (!isHighValue) continue;
      
      // Build reasoning chain
      const reasoning: string[] = [];
      for (let i = 0; i < nodes.length - 1; i++) {
        const from = nodes[i];
        const to = nodes[i + 1];
        const edge = edges[i];
        reasoning.push(`${from.label} ${edge?.type?.toLowerCase().replace(/_/g, ' ') || 'connects to'} ${to.label}`);
      }
      
      const confidence = Math.max(30, 100 - (nodes.length * 15) + (totalWeight / 10));
      const novelty = nodes.length >= 3 ? 75 : 50;
      
      opportunities.push({
        id: `path-${path.join('-')}-${Date.now()}`,
        type: 'path',
        title: `Connect with ${endNode.label}`,
        insight: `There's a ${nodes.length - 1}-hop path to ${endNode.label} through your network`,
        reasoning,
        pathNodes: path,
        pathEdges: edges.map(e => e.id),
        nodeLabels: nodes.map(n => n.label),
        valueForLaksh: `Access to ${endNode.label}'s network and resources`,
        valueForThem: `Connection to young hardware builder with proven track record`,
        mutualBenefit: `Warm introduction path: ${nodes.map(n => n.label).join(' → ')}`,
        nextStep: `Reach out to ${nodes[1]?.label || 'intermediary'} for introduction`,
        effort: nodes.length <= 2 ? 'low' : 'medium',
        timeframe: 'immediate',
        confidence,
        novelty,
        targetNodeId: endNode.id,
        source: 'graph',
      });
    }
    
    return opportunities.slice(0, 15);
  }
  
  /**
   * Generate introduction opportunities (2-hop network leverage)
   */
  private generateIntroductionOpportunities(): IntelligentOpportunity[] {
    const opportunities: IntelligentOpportunity[] = [];
    const intros = this.graph.findIntroductionOpportunities('lakshveer');
    
    for (const { intermediary, target, edge1, edge2, strength } of intros.slice(0, 10)) {
      const category = target.type === 'organization' ? 'partnership' :
                       target.type === 'event' ? 'invite' : 'network';
      
      opportunities.push({
        id: `intro-${intermediary.id}-${target.id}-${Date.now()}`,
        type: 'network',
        title: `Intro to ${target.label} via ${intermediary.label}`,
        insight: `${intermediary.label} can introduce you to ${target.label}`,
        reasoning: [
          `You know ${intermediary.label}`,
          `${intermediary.label} is connected to ${target.label}`,
          `You're not directly connected to ${target.label}`,
          `A warm intro could unlock ${target.type === 'organization' ? 'partnership' : 'opportunities'}`,
        ],
        pathNodes: ['lakshveer', intermediary.id, target.id],
        pathEdges: [edge1.id, edge2.id],
        nodeLabels: ['Lakshveer', intermediary.label, target.label],
        valueForLaksh: `Access to ${target.label}'s ${target.type === 'organization' ? 'resources and network' : 'platform'}`,
        valueForThem: `Connection to authentic young builder story`,
        mutualBenefit: `${intermediary.label} facilitates mutually beneficial connection`,
        nextStep: `Ask ${intermediary.label} for introduction to ${target.label}`,
        effort: 'low',
        timeframe: 'immediate',
        confidence: Math.min(90, strength),
        novelty: 65,
        targetNodeId: target.id,
        category,
        source: 'graph',
      });
    }
    
    return opportunities;
  }
  
  /**
   * Generate skill combination opportunities (product ideas)
   */
  private async generateCombinationOpportunities(): Promise<IntelligentOpportunity[]> {
    const opportunities: IntelligentOpportunity[] = [];
    
    // Analyze cluster combinations
    const strongClusters = this.clusters.filter(c => (c.level || 1) >= 3);
    
    // Product idea templates based on skill combinations
    const productIdeas: {
      requiredClusters: string[];
      title: string;
      insight: string;
      description: string;
      effort: 'low' | 'medium' | 'high';
      novelty: number;
    }[] = [
      {
        requiredClusters: ['cluster-hardware', 'cluster-entrepreneurship'],
        title: 'RoboCards: Robotics Learning Card Game',
        insight: 'CircuitHeroes proved card games work for STEM. Robotics is the natural next domain.',
        description: 'Like CircuitHeroes but for robotics concepts - servos, sensors, actuators as cards',
        effort: 'medium',
        novelty: 85,
      },
      {
        requiredClusters: ['cluster-ai-vision', 'cluster-hardware'],
        title: 'CV Workshop Kit for Schools',
        insight: 'MotionX and Drishtikon Yantra prove CV expertise. Schools need hands-on curriculum.',
        description: 'Package CV expertise into teachable kit with real projects',
        effort: 'medium',
        novelty: 80,
      },
      {
        requiredClusters: ['cluster-robotics', 'cluster-fabrication'],
        title: 'DIY Robot Platform Kit',
        insight: '3D printing + electronics + robotics = customizable robot kit opportunity',
        description: '3D printed robot chassis with modular electronics sold as kit',
        effort: 'high',
        novelty: 75,
      },
      {
        requiredClusters: ['cluster-aerial', 'cluster-ai-vision'],
        title: 'Educational Drone with CV',
        insight: 'Drones hot in education + CV skills = unique market offering',
        description: 'Small drone with CV for object tracking, perfect for STEM classes',
        effort: 'high',
        novelty: 90,
      },
      {
        requiredClusters: ['cluster-hardware', 'cluster-entrepreneurship'],
        title: 'Young Maker Workshop Series',
        insight: 'Teaching + product sales + speaking skills = packaged workshop business',
        description: 'Workshop series for schools combining hardware building + entrepreneurship',
        effort: 'low',
        novelty: 70,
      },
      {
        requiredClusters: ['cluster-ai-vision', 'cluster-robotics'],
        title: 'TinyML Starter Kit',
        insight: 'Edge ML growing fast. Combine ML + hardware for TinyML kit.',
        description: 'ESP32-based kit with pre-trained models for gesture/voice recognition',
        effort: 'high',
        novelty: 85,
      },
    ];
    
    const strongClusterIds = new Set(strongClusters.map(c => c.id));
    
    for (const idea of productIdeas) {
      // Check if Laksh has the required clusters
      const hasRequired = idea.requiredClusters.every(c => strongClusterIds.has(c));
      const partialMatch = idea.requiredClusters.filter(c => strongClusterIds.has(c)).length;
      
      if (partialMatch >= 1) {
        const matchingClusters = idea.requiredClusters
          .filter(c => strongClusterIds.has(c))
          .map(c => this.clusters.find(cl => cl.id === c)?.label || c);
        
        const confidence = hasRequired ? 85 : 60 + (partialMatch * 10);
        
        opportunities.push({
          id: `combo-${idea.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          type: 'product',
          title: idea.title,
          insight: idea.insight,
          reasoning: [
            `You have strong skills in: ${matchingClusters.join(', ')}`,
            idea.insight,
            'Market opportunity exists for this combination',
          ],
          pathNodes: idea.requiredClusters,
          pathEdges: [],
          nodeLabels: matchingClusters,
          valueForLaksh: 'New product leveraging existing skills and proven success',
          valueForThem: 'N/A - self-generated product',
          mutualBenefit: 'Novel product only someone with your skill combination could create',
          nextStep: 'Design prototype or create concept document',
          actionSteps: [
            'Identify 5 core concepts for the product',
            'Create rough prototype/mockup',
            'Test with target audience (schools, makers)',
            'Iterate based on feedback',
          ],
          effort: idea.effort,
          timeframe: idea.effort === 'low' ? '2-4 weeks' : idea.effort === 'medium' ? '1-2 months' : '3+ months',
          confidence,
          novelty: idea.novelty,
          source: 'graph',
        });
      }
    }
    
    return opportunities;
  }
  
  /**
   * Generate content/narrative opportunities
   */
  private generateContentOpportunities(): IntelligentOpportunity[] {
    const opportunities: IntelligentOpportunity[] = [];
    
    // Get achievements count
    const projects = this.graph.getNodesByType('project');
    const awards = this.graph.getNodesByType('award');
    const events = this.graph.getNodesByType('event');
    
    // Content angles based on achievements
    if (projects.length >= 3) {
      opportunities.push({
        id: `content-maker-journey-${Date.now()}`,
        type: 'content',
        title: 'Young Maker\'s Journey Content Series',
        insight: `${projects.length} shipped projects tell a compelling story`,
        reasoning: [
          `You have ${projects.length} completed projects`,
          'Each project has a unique story and learning',
          'This creates compelling content for maker community',
        ],
        pathNodes: projects.slice(0, 5).map(p => p.id),
        pathEdges: [],
        nodeLabels: projects.slice(0, 5).map(p => p.label),
        valueForLaksh: 'Visibility, credibility, audience building',
        valueForThem: 'Unique content from young maker perspective',
        mutualBenefit: 'Authentic story that resonates with maker community',
        nextStep: 'Outline 5-part series covering key projects',
        actionSteps: [
          'Pick 5 most interesting projects',
          'Write outline for each story',
          'Choose platform (YouTube, blog, Twitter)',
          'Create first piece of content',
        ],
        effort: 'medium',
        timeframe: '2-4 weeks per piece',
        confidence: 80,
        novelty: 70,
        source: 'graph',
      });
    }
    
    // Media pitch angle
    if (this.context.lakshProfile.age <= 10 && projects.length >= 2) {
      opportunities.push({
        id: `content-media-pitch-${Date.now()}`,
        type: 'content',
        title: 'Media Story Pitch: Youngest Hardware Entrepreneur',
        insight: `${this.context.lakshProfile.age}-year-old with ${projects.length}+ shipped products is newsworthy`,
        reasoning: [
          `Age ${this.context.lakshProfile.age} building hardware is extremely rare`,
          `${projects.length}+ shipped products shows this isn't a hobby`,
          'Human interest angle + tech innovation = media story',
        ],
        pathNodes: [],
        pathEdges: [],
        nodeLabels: [],
        valueForLaksh: 'National/international visibility, credibility',
        valueForThem: 'Compelling human interest tech story',
        mutualBenefit: 'Inspiring story that showcases young maker potential',
        nextStep: 'Draft pitch email to tech journalists',
        actionSteps: [
          'Identify 5 tech journalists covering maker/education',
          'Draft compelling pitch (under 200 words)',
          'Prepare high-res photos and demo videos',
          'Send pitches, follow up after 1 week',
        ],
        effort: 'low',
        timeframe: '1-2 weeks',
        confidence: 75,
        novelty: 80,
        source: 'graph',
      });
    }
    
    return opportunities;
  }
  
  /**
   * Generate gap-filling opportunities
   */
  private generateGapOpportunities(): IntelligentOpportunity[] {
    const opportunities: IntelligentOpportunity[] = [];
    
    // Find weak clusters that could be leveled up
    for (const cluster of this.clusters) {
      const level = cluster.level || 1;
      
      if (level <= 2 && (cluster.momentum || 0) > 30) {
        // This cluster has potential but needs work
        const clusterNodes = this.graph.getNodesByType('project', n => n.cluster_id === cluster.id);
        
        opportunities.push({
          id: `gap-${cluster.id}-${Date.now()}`,
          type: 'gap',
          title: `Level Up: ${cluster.label}`,
          insight: `${cluster.label} is at level ${level} but has momentum - small push could level it up`,
          reasoning: [
            `Current level: ${level}/5`,
            `Momentum: ${cluster.momentum || 0}%`,
            `Related projects: ${clusterNodes.length}`,
            'Shipping one focused project could breakthrough',
          ],
          pathNodes: [cluster.id, ...clusterNodes.slice(0, 3).map(n => n.id)],
          pathEdges: [],
          nodeLabels: [cluster.label, ...clusterNodes.slice(0, 3).map(n => n.label)],
          valueForLaksh: `Stronger ${cluster.label} capability, new project types unlocked`,
          valueForThem: 'N/A - internal growth',
          mutualBenefit: 'Self-improvement that unlocks external opportunities',
          nextStep: `Plan one ${cluster.label} focused project`,
          actionSteps: [
            `Review existing ${cluster.label} skills`,
            'Identify simplest project that demonstrates capability',
            'Build and document in 2 weeks',
            'Share publicly for credibility',
          ],
          effort: 'medium',
          timeframe: '2-4 weeks',
          confidence: 70,
          novelty: 50,
          source: 'graph',
        });
      }
    }
    
    return opportunities;
  }
  
  /**
   * Generate creative opportunities using LLM (placeholder for future implementation)
   */
  private async generateLLMOpportunities(): Promise<IntelligentOpportunity[]> {
    // LLM integration disabled for now - can be added via external API
    // This would use the context to generate creative non-obvious opportunities
    return [];
  }
  
  /**
   * Get opportunities for a specific node
   */
  getOpportunitiesForNode(nodeId: string, allOpps: IntelligentOpportunity[]): IntelligentOpportunity[] {
    return allOpps.filter(opp => 
      opp.targetNodeId === nodeId ||
      opp.pathNodes.includes(nodeId)
    );
  }
}

// Export types
export type { GraphNode, GraphEdge, Cluster, OpportunityContext };
