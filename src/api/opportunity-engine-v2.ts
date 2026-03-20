// ============================================
// OPPORTUNITY ENGINE v2 - Intelligence Layer
// Graph traversal + Pattern matching + LLM reasoning
// ============================================

import { Hono } from 'hono';

// Types
interface GraphNode {
  id: string;
  label: string;
  type: string;
  description: string;
  cluster_id?: string;
  impact_score?: number;
  meta?: any;
}

interface GraphEdge {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
  label?: string;
  weight?: number;
}

interface GraphPath {
  nodes: string[];
  edges: string[];
  nodeDetails: GraphNode[];
  edgeDetails: GraphEdge[];
  length: number;
}

interface OpportunityPattern {
  type: 'path' | 'combination' | 'network' | 'timing' | 'content' | 'gap' | 'product';
  nodes: string[];
  edges: string[];
  strength: number;
  description: string;
}

interface IntelligentOpportunity {
  id: string;
  type: OpportunityPattern['type'];
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
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  confidence: number;
  novelty: number;
  targetNodeId?: string;
}

// ============================================
// GRAPH TRAVERSAL ENGINE
// ============================================

export class GraphTraversal {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: GraphEdge[] = [];
  private adjacency: Map<string, { nodeId: string; edge: GraphEdge }[]> = new Map();
  
  constructor(nodes: GraphNode[], edges: GraphEdge[]) {
    // Build node map
    for (const node of nodes) {
      this.nodes.set(node.id, node);
      this.adjacency.set(node.id, []);
    }
    
    // Build adjacency list (bidirectional)
    this.edges = edges;
    for (const edge of edges) {
      const sourceAdj = this.adjacency.get(edge.source_id) || [];
      const targetAdj = this.adjacency.get(edge.target_id) || [];
      
      sourceAdj.push({ nodeId: edge.target_id, edge });
      targetAdj.push({ nodeId: edge.source_id, edge });
      
      this.adjacency.set(edge.source_id, sourceAdj);
      this.adjacency.set(edge.target_id, targetAdj);
    }
  }
  
  getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }
  
  getNeighbors(nodeId: string): { nodeId: string; edge: GraphEdge }[] {
    return this.adjacency.get(nodeId) || [];
  }
  
  /**
   * Find all paths from a node up to maxLength
   */
  getAllPaths(fromNode: string, maxLength: number = 3): GraphPath[] {
    const paths: GraphPath[] = [];
    const visited = new Set<string>();
    
    const dfs = (current: string, path: string[], edgePath: string[], depth: number) => {
      if (depth > maxLength) return;
      
      visited.add(current);
      path.push(current);
      
      // Record path if length >= 2
      if (path.length >= 2) {
        paths.push({
          nodes: [...path],
          edges: [...edgePath],
          nodeDetails: path.map(id => this.nodes.get(id)!).filter(Boolean),
          edgeDetails: edgePath.map(id => this.edges.find(e => e.id === id)!).filter(Boolean),
          length: path.length - 1,
        });
      }
      
      // Continue DFS
      const neighbors = this.adjacency.get(current) || [];
      for (const { nodeId, edge } of neighbors) {
        if (!visited.has(nodeId)) {
          dfs(nodeId, path, [...edgePath, edge.id], depth + 1);
        }
      }
      
      path.pop();
      visited.delete(current);
    };
    
    dfs(fromNode, [], [], 0);
    return paths;
  }
  
  /**
   * Find triangles involving a node (A-B-C where A connects to B, B connects to C)
   */
  findTriangles(nodeId: string): { nodes: [string, string, string]; edges: [GraphEdge, GraphEdge] }[] {
    const triangles: { nodes: [string, string, string]; edges: [GraphEdge, GraphEdge] }[] = [];
    const neighbors = this.getNeighbors(nodeId);
    
    for (const { nodeId: neighborId, edge: edge1 } of neighbors) {
      const secondDegree = this.getNeighbors(neighborId);
      for (const { nodeId: secondId, edge: edge2 } of secondDegree) {
        if (secondId !== nodeId && !neighbors.some(n => n.nodeId === secondId)) {
          // Found a triangle: nodeId -> neighborId -> secondId
          // where nodeId is NOT directly connected to secondId
          triangles.push({
            nodes: [nodeId, neighborId, secondId],
            edges: [edge1, edge2],
          });
        }
      }
    }
    
    return triangles;
  }
  
  /**
   * Find high-connectivity bridge nodes
   */
  findBridgeNodes(minConnections: number = 3): { node: GraphNode; connections: number; types: string[] }[] {
    const bridges: { node: GraphNode; connections: number; types: string[] }[] = [];
    
    for (const [nodeId, neighbors] of this.adjacency.entries()) {
      if (neighbors.length >= minConnections) {
        const node = this.nodes.get(nodeId);
        if (node) {
          const connectedTypes = [...new Set(neighbors.map(n => this.nodes.get(n.nodeId)?.type).filter(Boolean))];
          bridges.push({
            node,
            connections: neighbors.length,
            types: connectedTypes as string[],
          });
        }
      }
    }
    
    return bridges.sort((a, b) => b.connections - a.connections);
  }
  
  /**
   * Get nodes by type
   */
  getNodesByType(type: string): GraphNode[] {
    return Array.from(this.nodes.values()).filter(n => n.type === type);
  }
  
  /**
   * Get nodes by cluster
   */
  getNodesByCluster(clusterId: string): GraphNode[] {
    return Array.from(this.nodes.values()).filter(n => n.cluster_id === clusterId);
  }
  
  /**
   * Find cluster intersections (nodes that bridge multiple clusters)
   */
  findClusterBridges(): { node: GraphNode; clusters: string[] }[] {
    const bridges: { node: GraphNode; clusters: string[] }[] = [];
    
    for (const [nodeId, neighbors] of this.adjacency.entries()) {
      const node = this.nodes.get(nodeId);
      if (!node) continue;
      
      const connectedClusters = new Set<string>();
      if (node.cluster_id) connectedClusters.add(node.cluster_id);
      
      for (const { nodeId: neighborId } of neighbors) {
        const neighbor = this.nodes.get(neighborId);
        if (neighbor?.cluster_id) {
          connectedClusters.add(neighbor.cluster_id);
        }
      }
      
      if (connectedClusters.size >= 2) {
        bridges.push({
          node,
          clusters: Array.from(connectedClusters),
        });
      }
    }
    
    return bridges;
  }
}

// ============================================
// PATTERN MATCHERS
// ============================================

export class PatternMatcher {
  private graph: GraphTraversal;
  private clusters: any[];
  
  constructor(graph: GraphTraversal, clusters: any[]) {
    this.graph = graph;
    this.clusters = clusters;
  }
  
  /**
   * Find path-based opportunities
   * "You connect to A, A connects to B, B has opportunity C"
   */
  findPathOpportunities(fromNode: string): OpportunityPattern[] {
    const patterns: OpportunityPattern[] = [];
    const paths = this.graph.getAllPaths(fromNode, 3);
    
    for (const path of paths) {
      // Skip paths that are too short
      if (path.length < 2) continue;
      
      const endNode = path.nodeDetails[path.nodeDetails.length - 1];
      if (!endNode) continue;
      
      // Look for interesting end nodes (orgs, events, people with influence)
      const isInteresting = 
        endNode.type === 'organization' ||
        endNode.type === 'event' ||
        (endNode.type === 'person' && endNode.id !== 'lakshveer' && endNode.id !== 'capt-venkat') ||
        (endNode.impact_score && endNode.impact_score > 70);
      
      if (isInteresting) {
        // Calculate strength based on path length and node importance
        const strength = Math.max(0, 100 - (path.length * 20)) * (endNode.impact_score || 50) / 100;
        
        patterns.push({
          type: 'path',
          nodes: path.nodes,
          edges: path.edges,
          strength,
          description: `Path: ${path.nodeDetails.map(n => n.label).join(' → ')}`,
        });
      }
    }
    
    return patterns.sort((a, b) => b.strength - a.strength).slice(0, 20);
  }
  
  /**
   * Find skill combination opportunities
   * "You have skill A + skill B + skill C → could create product X"
   */
  findCombinationOpportunities(fromNode: string): OpportunityPattern[] {
    const patterns: OpportunityPattern[] = [];
    
    // Get all skills from the graph
    const allSkills = this.graph.getNodesByType('skill');
    const allProjects = this.graph.getNodesByType('project');
    const allProducts = this.graph.getNodesByType('product');
    
    // Find skills connected to Laksh's projects (2-hop: Laksh -> Project -> Skill)
    const lakshProjects = this.graph.getNeighbors(fromNode)
      .map(n => this.graph.getNode(n.nodeId))
      .filter(n => n?.type === 'project' || n?.type === 'product');
    
    // Get all skills used in Laksh's projects
    const lakshSkillIds = new Set<string>();
    for (const project of lakshProjects) {
      if (!project) continue;
      const projectNeighbors = this.graph.getNeighbors(project.id);
      for (const { nodeId } of projectNeighbors) {
        const node = this.graph.getNode(nodeId);
        if (node?.type === 'skill' || node?.type === 'technology') {
          lakshSkillIds.add(node.id);
        }
      }
    }
    
    // Also check cluster-based skills
    for (const skill of allSkills) {
      if (skill.cluster_id) {
        // If skill is in a cluster that Laksh has projects in, include it
        const hasProjectInCluster = lakshProjects.some(p => p?.cluster_id === skill.cluster_id);
        if (hasProjectInCluster) {
          lakshSkillIds.add(skill.id);
        }
      }
    }
    
    const lakshSkillLabels = Array.from(lakshSkillIds).map(id => 
      this.graph.getNode(id)?.label?.toLowerCase() || id
    );
    
    // Get existing product names
    const existingProductNames = [...allProducts, ...allProjects]
      .map(p => p.label?.toLowerCase() || '')
      .filter(Boolean);
    
    // Powerful combinations with market opportunity
    const powerCombos = [
      {
        skills: ['robotics', 'electronics', 'arduino'],
        product: 'RoboCards - Robotics Learning Card Game',
        insight: 'CircuitHeroes proved card games work for STEM. Robotics is the natural next domain.',
        description: 'Like CircuitHeroes but for robotics concepts - servos, sensors, actuators as cards',
        effort: 'medium' as const,
      },
      {
        skills: ['computer-vision', 'python'],
        product: 'CV Workshop Kit for Schools',
        insight: 'You built MotionX and Drishtikon Yantra with CV. Schools need hands-on CV curriculum.',
        description: 'Package your CV expertise into a teachable kit with projects',
        effort: 'medium' as const,
      },
      {
        skills: ['3d-printing', 'electronics', 'robotics'],
        product: 'DIY Robot Platform Kit',
        insight: 'Combine 3D printing + electronics skills into a customizable robot kit',
        description: '3D printed robot chassis with modular electronics - sell as kit',
        effort: 'high' as const,
      },
      {
        skills: ['drone', 'computer-vision'],
        product: 'Educational Drone with CV',
        insight: 'Drones are hot in education + you have CV skills = unique offering',
        description: 'Small drone with CV capabilities for object tracking/following',
        effort: 'high' as const,
      },
      {
        skills: ['electronics', 'entrepreneurship', 'public-speaking'],
        product: 'Young Maker Workshop Series',
        insight: 'You have teaching experience + product sales + public speaking',
        description: 'Packaged workshop series for schools - hardware + entrepreneurship',
        effort: 'low' as const,
      },
      {
        skills: ['arduino', 'electronics'],
        product: 'Arduino Project Book Vol 2',
        insight: 'DIY eBook sold 100+ copies. Arduino projects book is natural extension.',
        description: 'Follow-up book with more advanced Arduino projects',
        effort: 'medium' as const,
      },
      {
        skills: ['machine-learning', 'electronics'],
        product: 'TinyML Starter Kit',
        insight: 'Edge ML is growing. Combine ML + hardware skills for TinyML kit.',
        description: 'ESP32-based kit with pre-trained models for gesture/voice recognition',
        effort: 'high' as const,
      },
    ];
    
    for (const combo of powerCombos) {
      // Check how many skills match
      const matchedSkills = combo.skills.filter(s => 
        lakshSkillLabels.some(ls => ls.includes(s) || s.includes(ls))
      );
      
      // Check if product already exists
      const productExists = existingProductNames.some(p => 
        p.includes(combo.product.toLowerCase().split(' ')[0]) ||
        combo.product.toLowerCase().includes(p)
      );
      
      // Need at least 2 matching skills and product shouldn't exist
      if (matchedSkills.length >= 2 && !productExists) {
        const matchRatio = matchedSkills.length / combo.skills.length;
        patterns.push({
          type: 'combination',
          nodes: matchedSkills.map(s => allSkills.find(sk => sk.label?.toLowerCase().includes(s))?.id || s),
          edges: [],
          strength: matchRatio * 100,
          description: `${combo.product}|${combo.insight}|${combo.description}|${combo.effort}`,
        });
      }
    }
    
    return patterns.sort((a, b) => b.strength - a.strength);
  }
  
  /**
   * Find network leverage opportunities
   * "Person X endorsed you, Person X knows Y, Y runs program Z"
   */
  findNetworkOpportunities(fromNode: string): OpportunityPattern[] {
    const patterns: OpportunityPattern[] = [];
    const triangles = this.graph.findTriangles(fromNode);
    
    for (const triangle of triangles) {
      const [_, middleId, endId] = triangle.nodes;
      const middleNode = this.graph.getNode(middleId);
      const endNode = this.graph.getNode(endId);
      
      if (!middleNode || !endNode) continue;
      
      // Look for valuable end nodes
      const isValuable = 
        endNode.type === 'organization' ||
        endNode.type === 'event' ||
        (endNode.type === 'person' && (endNode.impact_score || 0) > 60);
      
      if (isValuable && middleNode.type === 'person') {
        patterns.push({
          type: 'network',
          nodes: triangle.nodes,
          edges: triangle.edges.map(e => e.id),
          strength: ((middleNode.impact_score || 50) + (endNode.impact_score || 50)) / 2,
          description: `${middleNode.label} can intro to ${endNode.label}`,
        });
      }
    }
    
    return patterns.sort((a, b) => b.strength - a.strength).slice(0, 10);
  }
  
  /**
   * Find content/narrative opportunities
   */
  findContentOpportunities(fromNode: string): OpportunityPattern[] {
    const patterns: OpportunityPattern[] = [];
    const neighbors = this.graph.getNeighbors(fromNode);
    
    // Count achievements
    const awards = neighbors.filter(n => this.graph.getNode(n.nodeId)?.type === 'award');
    const products = neighbors.filter(n => this.graph.getNode(n.nodeId)?.type === 'product');
    const events = neighbors.filter(n => this.graph.getNode(n.nodeId)?.type === 'event');
    const endorsements = neighbors.filter(n => this.graph.getNode(n.nodeId)?.type === 'endorsement');
    
    // Content angles based on achievements
    if (products.length >= 2) {
      patterns.push({
        type: 'content',
        nodes: products.map(p => p.nodeId),
        edges: products.map(p => p.edge.id),
        strength: products.length * 25,
        description: `${products.length} shipped products → "Young Maker's Journey" content series`,
      });
    }
    
    if (awards.length >= 1 && events.length >= 2) {
      patterns.push({
        type: 'content',
        nodes: [...awards, ...events].map(n => n.nodeId),
        edges: [],
        strength: 70,
        description: `Hackathon wins + events → "From Hackathon to Product" story pitch`,
      });
    }
    
    if (endorsements.length >= 2) {
      patterns.push({
        type: 'content',
        nodes: endorsements.map(e => e.nodeId),
        edges: [],
        strength: 60,
        description: `${endorsements.length} endorsements → Testimonial video compilation`,
      });
    }
    
    return patterns;
  }
  
  /**
   * Find gap-filling opportunities
   */
  findGapOpportunities(fromNode: string): OpportunityPattern[] {
    const patterns: OpportunityPattern[] = [];
    
    // Check cluster levels
    for (const cluster of this.clusters) {
      const level = cluster.computedLevel || cluster.level || 1;
      const clusterNodes = this.graph.getNodesByCluster(cluster.id);
      
      if (level <= 2 && clusterNodes.length > 0) {
        // Find what's missing to level up
        const hasProjects = clusterNodes.some(n => n.type === 'project');
        const hasProducts = clusterNodes.some(n => n.type === 'product');
        
        if (!hasProducts && hasProjects) {
          patterns.push({
            type: 'gap',
            nodes: clusterNodes.map(n => n.id),
            edges: [],
            strength: 80,
            description: `${cluster.label}: Has projects but no products → Ship one product to level up`,
          });
        }
      }
    }
    
    return patterns;
  }
}

// ============================================
// OPPORTUNITY GENERATOR (LLM-powered)
// ============================================

export class OpportunityGenerator {
  private graph: GraphTraversal;
  private patterns: PatternMatcher;
  
  constructor(graph: GraphTraversal, clusters: any[]) {
    this.graph = graph;
    this.patterns = new PatternMatcher(graph, clusters);
  }
  
  /**
   * Generate all opportunities for Laksh
   */
  generateOpportunities(): IntelligentOpportunity[] {
    const opportunities: IntelligentOpportunity[] = [];
    const fromNode = 'lakshveer';
    
    // 1. Path-based opportunities
    const pathPatterns = this.patterns.findPathOpportunities(fromNode);
    for (const pattern of pathPatterns.slice(0, 10)) {
      const opp = this.patternToOpportunity(pattern);
      if (opp) opportunities.push(opp);
    }
    
    // 2. Combination opportunities
    const comboPatterns = this.patterns.findCombinationOpportunities(fromNode);
    for (const pattern of comboPatterns) {
      const opp = this.patternToOpportunity(pattern);
      if (opp) opportunities.push(opp);
    }
    
    // 3. Network opportunities
    const networkPatterns = this.patterns.findNetworkOpportunities(fromNode);
    for (const pattern of networkPatterns.slice(0, 5)) {
      const opp = this.patternToOpportunity(pattern);
      if (opp) opportunities.push(opp);
    }
    
    // 4. Content opportunities
    const contentPatterns = this.patterns.findContentOpportunities(fromNode);
    for (const pattern of contentPatterns) {
      const opp = this.patternToOpportunity(pattern);
      if (opp) opportunities.push(opp);
    }
    
    // 5. Gap opportunities
    const gapPatterns = this.patterns.findGapOpportunities(fromNode);
    for (const pattern of gapPatterns) {
      const opp = this.patternToOpportunity(pattern);
      if (opp) opportunities.push(opp);
    }
    
    // Sort by confidence * novelty
    opportunities.sort((a, b) => (b.confidence * b.novelty) - (a.confidence * a.novelty));
    
    return opportunities;
  }
  
  /**
   * Convert pattern to full opportunity
   */
  private patternToOpportunity(pattern: OpportunityPattern): IntelligentOpportunity | null {
    const nodeLabels = pattern.nodes
      .map(id => this.graph.getNode(id)?.label || id)
      .filter(Boolean);
    
    // Generate opportunity based on type
    switch (pattern.type) {
      case 'path':
        return this.generatePathOpportunity(pattern, nodeLabels);
      case 'combination':
        return this.generateCombinationOpportunity(pattern, nodeLabels);
      case 'network':
        return this.generateNetworkOpportunity(pattern, nodeLabels);
      case 'content':
        return this.generateContentOpportunity(pattern, nodeLabels);
      case 'gap':
        return this.generateGapOpportunity(pattern, nodeLabels);
      default:
        return null;
    }
  }
  
  private generatePathOpportunity(pattern: OpportunityPattern, nodeLabels: string[]): IntelligentOpportunity {
    const endNode = this.graph.getNode(pattern.nodes[pattern.nodes.length - 1]);
    const pathDescription = nodeLabels.join(' → ');
    
    return {
      id: `opp-path-${pattern.nodes.join('-')}-${Date.now()}`,
      type: 'path',
      title: `Connect with ${endNode?.label || 'opportunity'}`,
      insight: `There's a path from you to ${endNode?.label} through your network`,
      reasoning: [
        `You're connected to ${nodeLabels[1]}`,
        nodeLabels.length > 2 ? `${nodeLabels[1]} connects to ${nodeLabels[2]}` : '',
        nodeLabels.length > 3 ? `Which leads to ${nodeLabels[3]}` : '',
        `This creates an opportunity for connection`,
      ].filter(Boolean),
      pathNodes: pattern.nodes,
      pathEdges: pattern.edges,
      nodeLabels,
      valueForLaksh: 'Expand network through warm introduction',
      valueForThem: 'Connect with young hardware builder with proven track record',
      mutualBenefit: `Warm intro path: ${pathDescription}`,
      nextStep: `Reach out to ${nodeLabels[1]} for introduction`,
      effort: pattern.nodes.length <= 2 ? 'low' : 'medium',
      timeframe: 'immediate',
      confidence: pattern.strength,
      novelty: Math.max(20, 100 - pattern.nodes.length * 25),
      targetNodeId: pattern.nodes[pattern.nodes.length - 1],
    };
  }
  
  private generateCombinationOpportunity(pattern: OpportunityPattern, nodeLabels: string[]): IntelligentOpportunity {
    const [title, description] = pattern.description.split(' → ').slice(-1)[0]?.split(': ') || ['New Product', ''];
    
    return {
      id: `opp-combo-${Date.now()}`,
      type: 'combination',
      title: title || 'Skill Combination Product',
      insight: pattern.description,
      reasoning: [
        `You have these skills: ${nodeLabels.join(', ')}`,
        'These skills combined can create something new',
        description || 'Market opportunity exists for this combination',
      ],
      pathNodes: pattern.nodes,
      pathEdges: [],
      nodeLabels,
      valueForLaksh: 'New product/project leveraging existing skills',
      valueForThem: 'Unique offering from young maker',
      mutualBenefit: 'Novel product that only someone with your skill combination could create',
      nextStep: 'Create prototype or design document',
      effort: 'medium',
      timeframe: '1-2 months',
      confidence: pattern.strength,
      novelty: 85,
    };
  }
  
  private generateNetworkOpportunity(pattern: OpportunityPattern, nodeLabels: string[]): IntelligentOpportunity {
    return {
      id: `opp-network-${pattern.nodes.join('-')}-${Date.now()}`,
      type: 'network',
      title: `Intro to ${nodeLabels[2]} via ${nodeLabels[1]}`,
      insight: pattern.description,
      reasoning: [
        `You know ${nodeLabels[1]}`,
        `${nodeLabels[1]} knows ${nodeLabels[2]}`,
        `You're not directly connected to ${nodeLabels[2]}`,
        'A warm intro could be valuable',
      ],
      pathNodes: pattern.nodes,
      pathEdges: pattern.edges,
      nodeLabels,
      valueForLaksh: `Access to ${nodeLabels[2]}'s network/resources`,
      valueForThem: 'Connection to promising young builder',
      mutualBenefit: `${nodeLabels[1]} facilitates mutually beneficial connection`,
      nextStep: `Ask ${nodeLabels[1]} for introduction to ${nodeLabels[2]}`,
      effort: 'low',
      timeframe: 'immediate',
      confidence: pattern.strength,
      novelty: 60,
      targetNodeId: pattern.nodes[2],
    };
  }
  
  private generateContentOpportunity(pattern: OpportunityPattern, nodeLabels: string[]): IntelligentOpportunity {
    const title = pattern.description.split(' → ')[1] || 'Content Opportunity';
    
    return {
      id: `opp-content-${Date.now()}`,
      type: 'content',
      title,
      insight: pattern.description,
      reasoning: [
        `You have: ${nodeLabels.join(', ')}`,
        'This creates a compelling narrative',
        'Content/media opportunity exists',
      ],
      pathNodes: pattern.nodes,
      pathEdges: [],
      nodeLabels,
      valueForLaksh: 'Visibility, credibility, audience building',
      valueForThem: 'Unique content from young maker perspective',
      mutualBenefit: 'Authentic story that resonates with maker community',
      nextStep: 'Outline content concept and identify platforms',
      effort: 'medium',
      timeframe: '2-4 weeks',
      confidence: pattern.strength,
      novelty: 70,
    };
  }
  
  private generateGapOpportunity(pattern: OpportunityPattern, nodeLabels: string[]): IntelligentOpportunity {
    return {
      id: `opp-gap-${Date.now()}`,
      type: 'gap',
      title: pattern.description.split(' → ')[0] || 'Level Up Opportunity',
      insight: pattern.description,
      reasoning: [
        'Gap identified in your capability map',
        'Filling this gap unlocks new opportunities',
        'You have prerequisites to fill it quickly',
      ],
      pathNodes: pattern.nodes,
      pathEdges: [],
      nodeLabels,
      valueForLaksh: 'Stronger capability profile, new opportunities',
      valueForThem: 'N/A - internal growth',
      mutualBenefit: 'Self-improvement that unlocks external opportunities',
      nextStep: pattern.description.split(' → ')[1] || 'Address the gap',
      effort: 'medium',
      timeframe: '2-4 weeks',
      confidence: pattern.strength,
      novelty: 50,
    };
  }
}

export type { GraphNode, GraphEdge, GraphPath, OpportunityPattern, IntelligentOpportunity };
