import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { SEO } from "@/components/seo";
import { useLocation } from "wouter";
import { 
  nodes as allNodes, 
  edges as allEdges, 
  UniverseNode, 
  UniverseEdge,
  NodeType,
  getUniverseStats
} from "@/data/universe-data";
import {
  capabilityClusters,
  growthArcs,
  crossPollinations,
  futurePaths,
  intelligenceEdges,
  timelineEvents,
  calculateMomentum,
  generateInsights,
  getNodesAtDate,
  getClusterForNode,
  getAllEdges,
  type CapabilityCluster,
  type GrowthArc,
  type CrossPollination,
  type FuturePath,
  type Insight,
  type MomentumMetrics,
  type EnhancedEdge,
} from "@/data/universe-intelligence";
import { useNodeDetail, useClusters, isPrivateMode, setPrivateMode, verifyPrivatePassword, isSessionValid, clearPrivateSession, type NodeDetailResponse, type EnrichedCluster } from "@/hooks/useUniverseAPI";
import { NodeWorldPanel } from "@/components/NodeWorldPanel";
import { ClusterScoreCard } from "@/components/ClusterScoreCard";
import { VerificationDashboard } from "@/components/VerificationDashboard";
import { GapsOpportunitiesPanel } from "@/components/GapsOpportunitiesPanel";
// v4 Intelligence OS
import { GuidedJourney } from "@/components/universe/GuidedJourney";
import { ParticipationGateway } from "@/components/universe/ParticipationGateway";
import { IntelligenceInsights } from "@/components/universe/IntelligenceInsights";
import { IntelligenceFeed } from "@/components/universe/IntelligenceFeed";
import { SignalTimeline } from "@/components/universe/SignalTimeline";
import { HealthMonitor } from "@/components/universe/HealthMonitor";
import { SurfaceDashboard } from "@/components/universe/SurfaceDashboard";
import { NodeAgentPanel } from "@/components/universe/NodeAgentPanel";
import { WikiPanel } from "@/components/universe/WikiPanel";
import { WeeklyOSPanel } from "@/components/WeeklyOSPanel";

// ============================================
// FEATURE FLAGS - PHASE 1 SURFACE CLEANUP
// ============================================
const FEATURE_FLAGS = {
  SHOW_BADGES_PUBLIC: false,           // Opportunity count badges (private only now)
  SHOW_GLOW_EFFECTS: false,            // Pulsing glow on high-opportunity nodes
  SHOW_CONFIDENCE_SCORES_PUBLIC: false, // Confidence scores visible in public
  SHOW_STATS_PANEL_PUBLIC: false       // Stats dashboards in public mode
};

// ============================================
// TYPES
// ============================================

interface SimNode extends UniverseNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
  visible?: boolean;
  verification_status?: 'verified' | 'pending' | 'inferred' | 'rejected';
}

interface SimEdge {
  source: SimNode;
  target: SimNode;
  relation: string;
  weight?: number;
  evolutionType?: string;
  verification_status?: 'verified' | 'pending' | 'inferred' | 'rejected';
  confidence_score?: number;
}

type ViewMode = 'explore' | 'clusters' | 'timeline' | 'momentum';
type RightPanelMode = 'node' | 'insights' | 'journey' | 'participate' | 'feed' | 'signal-timeline' | 'health' | 'surfaces' | 'wiki';

// ============================================
// COLORS & STYLES
// ============================================

const nodeColors: Record<NodeType, string> = {
  core: '#22d3ee',
  product: '#3b82f6',
  project: '#10b981',
  skill: '#8b5cf6',
  tool: '#f59e0b',
  person: '#ec4899',
  company: '#f97316',
  event: '#06b6d4',
  media: '#ef4444',
  achievement: '#fbbf24',
  possibility: 'rgba(255,255,255,0.4)',
  concept: '#64748b',
};

const edgeColors: Record<string, string> = {
  EVOLVED_INTO: '#22d3ee',
  CROSS_POLLINATED_WITH: '#a855f7',
  CAPABILITY_EXPANSION: '#10b981',
  FUTURE_PATH: '#fbbf24',
  UNLOCKED: '#3b82f6',
  COMPOUNDS_WITH: '#ec4899',
  LED_TO: '#f97316',
};

const nodeTypeLabels: Record<NodeType, string> = {
  core: 'Core',
  product: 'Products',
  project: 'Projects',
  skill: 'Skills',
  tool: 'Tools',
  person: 'People',
  company: 'Companies',
  event: 'Events',
  media: 'Media',
  achievement: 'Achievements',
  possibility: 'Future Possibilities',
  concept: 'Concepts',
};

const toRgba = (color: string, alpha: number): string => {
  if (color.startsWith('rgba')) {
    return color.replace(/[\d.]+\)$/, `${alpha})`);
  }
  if (color.startsWith('rgb(')) {
    return color.replace('rgb(', 'rgba(').replace(')', `,${alpha})`);
  }
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  return color;
};

// ============================================
// MAIN COMPONENT
// ============================================

function Universe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const [, setLocation] = useLocation();
  
  // Core state
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<NodeType>>(new Set());
  const [showPossibilities, setShowPossibilities] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<SimNode | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  
  // Intelligence state
  const [viewMode, setViewMode] = useState<ViewMode>('explore');
  const [activeCluster, setActiveCluster] = useState<string | null>(null);
  const [timelineDate, setTimelineDate] = useState('2026-02');
  const [showIntelligenceEdges, setShowIntelligenceEdges] = useState(true);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Phase 2: API State
  const [privateMode, setPrivateModeState] = useState(isPrivateMode());
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);
  const { loading: nodeLoading, nodeData, loadNode, clearNode } = useNodeDetail();
  const { loading: clustersLoading, clusters: apiClusters, loadClusters } = useClusters();
  
  // Phase 3: Verification Dashboard
  const [showVerificationDashboard, setShowVerificationDashboard] = useState(false);
  
  // Phase 4: Gaps & Opportunities Panel
  const [showGapsPanel, setShowGapsPanel] = useState(false);
  
  // Phase 5: Weekly OS Panel (Week 2 - Mentor Intelligence)
  const [showWeeklyOS, setShowWeeklyOS] = useState(false);
  
  // v4: Right panel mode
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('insights');
  const [journeyHighlightedNodes, setJourneyHighlightedNodes] = useState<string[]>([]);

  // v5: Ask anything
  const [askQuery, setAskQuery] = useState('');
  const [askAnswer, setAskAnswer] = useState<string | null>(null);
  const [askLoading, setAskLoading] = useState(false);
  const [askHighlightedNodes, setAskHighlightedNodes] = useState<Set<string>>(new Set());
  const [askFocused, setAskFocused] = useState(false);
  const askInputRef = useRef<HTMLInputElement>(null);

  // v5: Quote ticker
  const [quoteIndex, setQuoteIndex] = useState(0);
  
  // Phase A: Node opportunity counts for visual indicators
  const [nodeOpportunities, setNodeOpportunities] = useState<Record<string, { count: number; types: string[] }>>({});
  
  // Password gate for private mode
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  
  // Toggle private mode with password gate
  const togglePrivateMode = useCallback(() => {
    if (privateMode) {
      // Turning off - just disable
      clearPrivateSession();
      setPrivateModeState(false);
      loadClusters();
    } else {
      // Turning on - check if session valid or show password modal
      if (isSessionValid()) {
        setPrivateModeState(true);
        setPrivateMode(true);
        loadClusters();
      } else {
        setShowPasswordModal(true);
        setPasswordInput('');
        setPasswordError(false);
      }
    }
  }, [privateMode, loadClusters]);
  
  // Handle password submission
  const handlePasswordSubmit = useCallback(() => {
    if (verifyPrivatePassword(passwordInput)) {
      setPrivateModeState(true);
      setShowPasswordModal(false);
      setPasswordInput('');
      setPasswordError(false);
      loadClusters();
    } else {
      setPasswordError(true);
    }
  }, [passwordInput, loadClusters]);
  
  // Load API data on mount
  useEffect(() => {
    loadClusters();
  }, []);
  
  // Load opportunity counts for node indicators (private mode only)
  useEffect(() => {
    if (privateMode) {
      fetch('/api/universe/opportunities/intelligent', {
        headers: { 'X-Universe-Auth': 'laksh-private-2026' }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.nodeOpportunities) {
            setNodeOpportunities(data.nodeOpportunities);
          }
        })
        .catch(err => console.error('Failed to load opportunity counts:', err));
    } else {
      setNodeOpportunities({});
    }
  }, [privateMode]);
  
  // Load node detail when selected
  useEffect(() => {
    if (selectedNode) {
      loadNode(selectedNode.id);
    } else {
      clearNode();
    }
  }, [selectedNode?.id]);
  
  // Computed data
  const momentum = useMemo(() => calculateMomentum(), []);
  const insights = useMemo(() => generateInsights(), []);
  const allEnhancedEdges = useMemo(() => getAllEdges(), []);
  
  // Parse URL for deep link
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nodeId = params.get('node');
    if (nodeId) {
      const node = allNodes.find(n => n.id === nodeId);
      if (node) {
        setTimeout(() => {
          const simNode = simNodes.find(n => n.id === nodeId);
          if (simNode) {
            setSelectedNode(simNode);
            // Center on node
            setPan({
              x: dimensions.width / 2 - simNode.x * zoom,
              y: dimensions.height / 2 - simNode.y * zoom,
            });
          }
        }, 500);
      }
    }
  }, []);
  
  // Initialize nodes with positions
  const [simNodes, setSimNodes] = useState<SimNode[]>(() => {
    return allNodes.map((node, i) => {
      const angle = (i / allNodes.length) * Math.PI * 2 * 3;
      const radius = node.type === 'core' ? 0 : 100 + i * 2;
      return {
        ...node,
        x: 400 + Math.cos(angle) * radius,
        y: 300 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        visible: true,
      };
    });
  });
  
  // Build edges with node references
  const simEdges = useMemo<SimEdge[]>(() => {
    const edgeSource = showIntelligenceEdges ? allEnhancedEdges : allEdges;
    return edgeSource.map(edge => ({
      source: simNodes.find(n => n.id === edge.source)!,
      target: simNodes.find(n => n.id === edge.target)!,
      relation: edge.relation,
      weight: edge.weight,
      evolutionType: (edge as EnhancedEdge).evolutionType,
    })).filter(e => e.source && e.target);
  }, [simNodes, showIntelligenceEdges, allEnhancedEdges]);
  
  // Get visible nodes based on timeline
  const visibleNodeIds = useMemo(() => {
    if (viewMode !== 'timeline') return new Set(allNodes.map(n => n.id));
    return new Set(getNodesAtDate(timelineDate));
  }, [viewMode, timelineDate]);
  
  // Filter nodes based on all criteria
  const filteredNodes = useMemo(() => {
    return simNodes.filter(node => {
      // Timeline filter
      if (viewMode === 'timeline' && !visibleNodeIds.has(node.id)) {
        // Always show core
        if (node.type !== 'core') return false;
      }
      
      // Cluster filter
      if (activeCluster) {
        const cluster = capabilityClusters.find(c => c.id === activeCluster);
        if (cluster && !cluster.nodeIds.includes(node.id)) {
          if (node.type !== 'core') return false;
        }
      }
      
      // Type filter
      if (activeFilters.size > 0 && !activeFilters.has(node.type)) {
        if (node.type !== 'core') return false;
      }
      
      // Possibility filter
      if (!showPossibilities && node.type === 'possibility') return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return node.label.toLowerCase().includes(query) || 
               node.description?.toLowerCase().includes(query);
      }
      return true;
    });
  }, [simNodes, activeFilters, showPossibilities, searchQuery, activeCluster, viewMode, visibleNodeIds]);
  
  // Filter edges based on visible nodes
  const filteredEdges = useMemo(() => {
    const visibleIds = new Set(filteredNodes.map(n => n.id));
    return simEdges.filter(e => 
      visibleIds.has(e.source.id) && visibleIds.has(e.target.id)
    );
  }, [simEdges, filteredNodes]);
  
  const stats = useMemo(() => getUniverseStats(), []);
  
  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Force simulation
  useEffect(() => {
    let running = true;
    
    const simulate = () => {
      if (!running) return;
      
      setSimNodes(prevNodes => {
        const nodes = [...prevNodes];
        const centerX = dimensions.width / 2;
        const centerY = dimensions.height / 2;
        
        nodes.forEach((node, i) => {
          if (node.fx != null) {
            node.x = node.fx;
            node.vx = 0;
          }
          if (node.fy != null) {
            node.y = node.fy;
            node.vy = 0;
          }
          
          if (node.fx != null || node.fy != null) return;
          
          // Center gravity
          const gravityStrength = node.type === 'core' ? 0.05 : 0.002;
          node.vx += (centerX - node.x) * gravityStrength;
          node.vy += (centerY - node.y) * gravityStrength;
          
          // Repulsion
          nodes.forEach((other, j) => {
            if (i === j) return;
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const minDist = 50;
            if (dist < minDist * 3) {
              const force = (minDist * minDist) / (dist * dist) * 0.5;
              node.vx += (dx / dist) * force;
              node.vy += (dy / dist) * force;
            }
          });
        });
        
        // Edge attraction
        allEdges.forEach(edge => {
          const source = nodes.find(n => n.id === edge.source);
          const target = nodes.find(n => n.id === edge.target);
          if (!source || !target) return;
          
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const idealDist = 100 + (100 - (edge.weight || 50)) * 1.5;
          const force = (dist - idealDist) * 0.003;
          
          if (source.fx == null) {
            source.vx += (dx / dist) * force;
            source.vy += (dy / dist) * force;
          }
          if (target.fx == null) {
            target.vx -= (dx / dist) * force;
            target.vy -= (dy / dist) * force;
          }
        });
        
        // Apply velocity
        nodes.forEach(node => {
          if (node.fx != null || node.fy != null) return;
          node.vx *= 0.9;
          node.vy *= 0.9;
          node.x += node.vx;
          node.y += node.vy;
          
          const padding = 50;
          node.x = Math.max(padding, Math.min(dimensions.width - padding, node.x));
          node.y = Math.max(padding, Math.min(dimensions.height - padding, node.y));
        });
        
        return nodes;
      });
      
      animationRef.current = requestAnimationFrame(simulate);
    };
    
    simulate();
    return () => {
      running = false;
      cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions]);
  
  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);
    
    // Apply transform
    ctx.save();
    ctx.translate(pan.x + dimensions.width / 2, pan.y + dimensions.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-dimensions.width / 2, -dimensions.height / 2);
    
    // Stars background
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 150; i++) {
      const x = (Math.sin(i * 123.456) * 0.5 + 0.5) * dimensions.width;
      const y = (Math.cos(i * 789.012) * 0.5 + 0.5) * dimensions.height;
      ctx.beginPath();
      ctx.arc(x, y, 0.5 + Math.random() * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Highlighted nodes
    const highlightedIds = new Set<string>();
    // Ask query highlights take precedence
    if (askHighlightedNodes.size > 0) {
      askHighlightedNodes.forEach(id => highlightedIds.add(id));
    } else if (hoveredNode || selectedNode) {
      const focusNode = hoveredNode || selectedNode;
      if (focusNode) {
        highlightedIds.add(focusNode.id);
        filteredEdges.forEach(edge => {
          if (edge.source.id === focusNode.id) highlightedIds.add(edge.target.id);
          if (edge.target.id === focusNode.id) highlightedIds.add(edge.source.id);
        });
      }
    }
    
    // Draw edges
    filteredEdges.forEach(edge => {
      const isHighlighted = highlightedIds.size === 0 || 
        (highlightedIds.has(edge.source.id) && highlightedIds.has(edge.target.id));
      
      const isIntelligenceEdge = Object.keys(edgeColors).includes(edge.relation);
      
      // Phase 3: Check verification status
      const isVerified = !edge.verification_status || edge.verification_status === 'verified';
      const isPending = edge.verification_status === 'pending';
      const isInferred = edge.verification_status === 'inferred';
      
      ctx.beginPath();
      ctx.moveTo(edge.source.x, edge.source.y);
      
      // Curved lines for intelligence edges
      if (isIntelligenceEdge && showIntelligenceEdges) {
        const midX = (edge.source.x + edge.target.x) / 2;
        const midY = (edge.source.y + edge.target.y) / 2;
        const dx = edge.target.x - edge.source.x;
        const dy = edge.target.y - edge.source.y;
        const controlX = midX - dy * 0.2;
        const controlY = midY + dx * 0.2;
        ctx.quadraticCurveTo(controlX, controlY, edge.target.x, edge.target.y);
        
        const color = edgeColors[edge.relation] || '#ffffff';
        const alpha = isHighlighted ? 0.6 : 0.15;
        ctx.strokeStyle = toRgba(color, alpha);
        ctx.lineWidth = isHighlighted ? 2 : 1;
        
        // Visual distinction for verification status
        if (edge.relation === 'FUTURE_PATH' || isInferred) {
          ctx.setLineDash([5, 5]); // Dotted for future paths or inferred
        } else if (isPending) {
          ctx.setLineDash([3, 3]); // Short dots for pending
        } else {
          ctx.setLineDash([]); // Solid for verified
        }
      } else {
        ctx.lineTo(edge.target.x, edge.target.y);
        const alpha = isHighlighted ? 0.4 : 0.08;
        
        // Different colors for verification status (only in private mode)
        if (privateMode && !isVerified) {
          if (isInferred) {
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`; // Purple for inferred
          } else if (isPending) {
            ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`; // Amber for pending
          } else {
            ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          }
          ctx.setLineDash([3, 3]); // Dotted for unverified
        } else {
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
          ctx.setLineDash([]);
        }
        ctx.lineWidth = isHighlighted ? 1.5 : 0.5;
      }
      
      ctx.stroke();
    });
    
    ctx.setLineDash([]);
    
    // Draw cluster backgrounds if in cluster view
    if (viewMode === 'clusters' && activeCluster) {
      const cluster = capabilityClusters.find(c => c.id === activeCluster);
      if (cluster) {
        const clusterNodes = filteredNodes.filter(n => cluster.nodeIds.includes(n.id));
        if (clusterNodes.length > 2) {
          ctx.beginPath();
          const centerX = clusterNodes.reduce((sum, n) => sum + n.x, 0) / clusterNodes.length;
          const centerY = clusterNodes.reduce((sum, n) => sum + n.y, 0) / clusterNodes.length;
          const radius = Math.max(...clusterNodes.map(n => 
            Math.sqrt(Math.pow(n.x - centerX, 2) + Math.pow(n.y - centerY, 2))
          )) + 50;
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fillStyle = toRgba(cluster.color, 0.05);
          ctx.fill();
          ctx.strokeStyle = toRgba(cluster.color, 0.2);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    
    // Draw nodes
    filteredNodes.forEach(node => {
      const isHighlighted = highlightedIds.size === 0 || highlightedIds.has(node.id);
      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      
      const baseSize = (node.weight || 30) / 10;
      const size = node.type === 'core' ? 20 : Math.max(4, Math.min(15, baseSize));
      const alpha = isHighlighted ? 1 : 0.2;
      
      // Glow
      if (isSelected || isHovered || node.type === 'core') {
        const glowSize = isSelected ? 30 : isHovered ? 25 : 18;
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, size + glowSize
        );
        const color = nodeColors[node.type];
        gradient.addColorStop(0, toRgba(color, 0.8));
        gradient.addColorStop(0.4, toRgba(color, 0.3));
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + glowSize, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
      
      if (node.type === 'possibility') {
        const t = Date.now() / 1000;
        const pulse = 0.4 + Math.sin(t * 1.5 + node.x * 0.01) * 0.2;
        ctx.strokeStyle = `rgba(167,139,250,${alpha * pulse})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(139,92,246,${alpha * 0.12})`;
        ctx.fill();
        if (isHighlighted) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 5 + Math.sin(t * 2) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(167,139,250,${pulse * 0.3})`;
          ctx.lineWidth = 1;
          ctx.setLineDash([2, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      } else {
        const color = nodeColors[node.type];
        ctx.fillStyle = toRgba(color, alpha);
        ctx.fill();
      }
      
      // Label
      if (isHighlighted && (zoom > 0.6 || isSelected || isHovered || node.type === 'core')) {
        ctx.fillStyle = node.type === 'possibility'
          ? `rgba(167,139,250,${alpha * 0.8})`
          : `rgba(255,255,255,${alpha})`;
        ctx.font = `${isSelected || isHovered || node.type === 'core' ? 'bold ' : ''}${Math.max(9, 11 / zoom)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        const label = node.type === 'possibility' ? '→ ' + node.label : node.label;
        ctx.fillText(label, node.x, node.y + size + 4);
      }
      
      /* ============================================
       * PHASE 1 CLEANUP: Badge & Glow Effects Disabled
       * These visual indicators removed from public mode
       * Can be re-enabled via FEATURE_FLAGS if needed
       * ============================================ */
      
      // Phase A: Opportunity indicator (NOW DISABLED - was private mode only)
      // Keeping code for potential admin dashboard use
      /*
      const oppCount = nodeOpportunities[node.id]?.count || 0;
      if (privateMode && oppCount > 0 && isHighlighted) {
        const oppBadgeX = node.x - size * 0.7;
        const oppBadgeY = node.y - size * 0.7;
        const oppBadgeSize = 5;
        
        // Pulsing glow for high-opportunity nodes
        if (oppCount >= 3) {
          const pulseTime = Date.now() / 1000;
          const pulseAlpha = 0.3 + Math.sin(pulseTime * 2) * 0.2;
          const pulseGradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, size + 15
          );
          pulseGradient.addColorStop(0, `rgba(255, 193, 7, ${pulseAlpha})`);
          pulseGradient.addColorStop(1, 'transparent');
          ctx.fillStyle = pulseGradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, size + 15, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Opportunity badge
        ctx.beginPath();
        ctx.arc(oppBadgeX, oppBadgeY, oppBadgeSize, 0, Math.PI * 2);
        ctx.fillStyle = oppCount >= 5 ? '#fbbf24' : oppCount >= 3 ? '#f59e0b' : '#fb923c'; // Gold, amber, orange
        ctx.fill();
        
        // Count number
        ctx.fillStyle = '#000000';
        ctx.font = `bold ${oppBadgeSize * 1.4}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(oppCount > 9 ? '9+' : oppCount.toString(), oppBadgeX, oppBadgeY);
      }
      */
      
      // Phase 3: Verification badge (NOW DISABLED - was private mode only)
      /*
      if (privateMode && node.verification_status === 'verified' && isHighlighted) {
        // Draw verified checkmark badge
        const badgeX = node.x + size * 0.7;
        const badgeY = node.y - size * 0.7;
        const badgeSize = 4;
        
        // Badge background
        ctx.beginPath();
        ctx.arc(badgeX, badgeY, badgeSize, 0, Math.PI * 2);
        ctx.fillStyle = '#22c55e'; // Green
        ctx.fill();
        
        // Checkmark
        ctx.beginPath();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.moveTo(badgeX - 1.5, badgeY);
        ctx.lineTo(badgeX - 0.5, badgeY + 1.2);
        ctx.lineTo(badgeX + 2, badgeY - 1.2);
        ctx.stroke();
      }
      */
      
      // Phase 3: Pending/inferred indicator (NOW DISABLED - was private mode only)
      /*
      if (privateMode && (node.verification_status === 'pending' || node.verification_status === 'inferred') && isHighlighted) {
        const indicatorX = node.x + size * 0.7;
        const indicatorY = node.y - size * 0.7;
        const indicatorSize = 4;
        
        ctx.beginPath();
        ctx.arc(indicatorX, indicatorY, indicatorSize, 0, Math.PI * 2);
        ctx.fillStyle = node.verification_status === 'pending' ? '#f59e0b' : '#a855f7'; // Amber for pending, purple for inferred
        ctx.fill();
        
        // Question mark or dot
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${indicatorSize * 1.5}px system-ui`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.verification_status === 'pending' ? '?' : '*', indicatorX, indicatorY);
      }
      */
    });
    
    // Journey highlight pass — cyan glow rings for active chapter nodes
    if (journeyHighlightedNodes.length > 0) {
      const journeySet = new Set(journeyHighlightedNodes);
      const t = Date.now() / 1000;
      filteredNodes.forEach(node => {
        if (!journeySet.has(node.id)) return;
        const baseSize = (node.weight || 30) / 10;
        const size = node.type === 'core' ? 20 : Math.max(4, Math.min(15, baseSize));
        // Pulsing ring
        const pulse = 0.5 + Math.sin(t * 3) * 0.3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 10 + Math.sin(t * 2) * 4, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 211, 238, ${pulse * 0.8})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.stroke();
        // Outer soft glow
        const grd = ctx.createRadialGradient(node.x, node.y, size, node.x, node.y, size + 28);
        grd.addColorStop(0, `rgba(34, 211, 238, ${pulse * 0.35})`);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 28, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
    
  }, [simNodes, filteredNodes, filteredEdges, dimensions, zoom, pan, selectedNode, hoveredNode, viewMode, activeCluster, showIntelligenceEdges, privateMode, nodeOpportunities, journeyHighlightedNodes, askHighlightedNodes]);
  
  // Mouse handlers
  const getNodeAtPosition = useCallback((clientX: number, clientY: number): SimNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left - pan.x - dimensions.width / 2) / zoom + dimensions.width / 2);
    const y = ((clientY - rect.top - pan.y - dimensions.height / 2) / zoom + dimensions.height / 2);
    
    let closest: SimNode | null = null;
    let closestDist = 25 / zoom;
    
    filteredNodes.forEach(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist) {
        closestDist = dist;
        closest = node;
      }
    });
    
    return closest;
  }, [filteredNodes, zoom, pan, dimensions]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const node = getNodeAtPosition(e.clientX, e.clientY);
    if (node) {
      setDraggedNode(node);
      setIsDragging(true);
      node.fx = node.x;
      node.fy = node.y;
    } else {
      setIsPanning(true);
    }
    setLastMouse({ x: e.clientX, y: e.clientY });
  }, [getNodeAtPosition]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && draggedNode) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      draggedNode.fx = ((e.clientX - rect.left - pan.x - dimensions.width / 2) / zoom + dimensions.width / 2);
      draggedNode.fy = ((e.clientY - rect.top - pan.y - dimensions.height / 2) / zoom + dimensions.height / 2);
    } else if (isPanning) {
      const dx = e.clientX - lastMouse.x;
      const dy = e.clientY - lastMouse.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      setLastMouse({ x: e.clientX, y: e.clientY });
    } else {
      const node = getNodeAtPosition(e.clientX, e.clientY);
      setHoveredNode(node);
    }
  }, [isDragging, draggedNode, isPanning, lastMouse, getNodeAtPosition, zoom, pan, dimensions]);
  
  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isDragging && draggedNode && !isPanning) {
      const moveDistance = Math.sqrt(
        Math.pow(e.clientX - lastMouse.x, 2) + Math.pow(e.clientY - lastMouse.y, 2)
      );
      if (moveDistance < 5) {
        setSelectedNode(draggedNode);
        // Update URL for deep link
        const url = new URL(window.location.href);
        url.searchParams.set('node', draggedNode.id);
        window.history.pushState({}, '', url.toString());
      }
      draggedNode.fx = null;
      draggedNode.fy = null;
    }
    setIsDragging(false);
    setDraggedNode(null);
    setIsPanning(false);
  }, [isDragging, draggedNode, isPanning, lastMouse]);
  
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(z => Math.max(0.2, Math.min(3, z * delta)));
  }, []);
  
  // Timeline dates for slider
  const timelineDates = useMemo(() => {
    const dates: string[] = [];
    for (let year = 2022; year <= 2026; year++) {
      for (let month = 1; month <= 12; month++) {
        if (year === 2022 && month < 7) continue;
        if (year === 2026 && month > 2) continue;
        dates.push(`${year}-${String(month).padStart(2, '0')}`);
      }
    }
    return dates;
  }, []);
  
  // Get node details
  const nodeCluster = selectedNode ? getClusterForNode(selectedNode.id) : null;
  // Node connections now handled by NodeAgentPanel (v4)
  
  // Share URL
  const shareUrl = selectedNode 
    ? `${window.location.origin}/universe?node=${selectedNode.id}`
    : `${window.location.origin}/universe`;
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  // v5: Quote ticker auto-advance
  const QUOTES = [
    { text: "An 8-year-old showed up and built. That alone changed what we thought was possible.", author: "Runable HQ" },
    { text: "Laksh knows more about hardware than I did during my entire engineering.", author: "Shubham Kukreti" },
    { text: "4 founders I'm really bullish on... Laksh of CircuitHeroes.", author: "Roohi Kirit" },
    { text: "If there were more kids like Lakshveer...", author: "Dr. Aniruddha Malpani" },
    { text: "An 8-year-old just schooled us all at Hardware Hackathon.", author: "Lion Circuits" },
    { text: "Youngest founder ever in our Delta cohort.", author: "The Residency" },
    { text: "Curiosity doesn't have any age. Whenever I hesitate, I remember how fearless Laksh is.", author: "Besta Prem Sai" },
    { text: "Laksh shows the mentee interest that makes mentorship work.", author: "Karthik Rangarajan" },
  ];
  useEffect(() => {
    const t = setInterval(() => setQuoteIndex(i => (i + 1) % QUOTES.length), 5000);
    return () => clearInterval(t);
  }, []);

  // v5: Ask anything handler
  const handleAsk = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setAskLoading(true);
    setAskAnswer(null);
    setAskHighlightedNodes(new Set());
    setRightPanelMode('insights');
    setRightPanelOpen(true);
    try {
      const res = await fetch('/api/wiki/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setAskAnswer(data.answer ?? null);
      // Highlight nodes mentioned in answer or files read
      const mentioned = new Set<string>();
      const filesRead: string[] = data.filesRead ?? [];
      for (const fp of filesRead) {
        const parts = fp.replace('.md', '').split('/');
        const id = parts[parts.length - 1];
        if (id) mentioned.add(id);
      }
      // Also fuzzy match answer words against node labels
      const answerLower = (data.answer ?? '').toLowerCase();
      for (const node of simNodes) {
        if (answerLower.includes(node.label.toLowerCase())) mentioned.add(node.id);
      }
      setAskHighlightedNodes(mentioned);
    } catch {
      setAskAnswer('Sorry, could not reach the wiki right now.');
    } finally {
      setAskLoading(false);
    }
  }, [simNodes]);

  // ── Node hover card content ──────────────────
  const getNodeCard = (node: SimNode) => {
    const nodeData_static = allNodes.find(n => n.id === node.id);
    const cluster = getClusterForNode(node.id);
    const desc = nodeData_static?.description ?? '';

    // Rich one-liner by type
    const stat: Record<string, string> = {
      'circuitheroes':     '300+ decks sold · ₹1,00,000 grant · Trademark registered',
      'motionx':           'Full-body motion control · RunTogether Special Mention',
      'drishtikon-yantra': 'Assistive vision device · Youngest Innovator Award',
      'kyabol':            'Cerebral Valley × Google DeepMind hackathon demo',
      'grant-agent':       'AI agent for autonomous grant discovery',
      'hardvare':          'Hardware + AI agent platform',
      'malpani-grant':     '₹1,00,000 — CircuitHeroes innovation grant',
      'residency-youngest':'Youngest founder ever in Delta-2 cohort',
      'isro-demo':         'Demonstrated to ISRO Chairman S. Somanath',
      'shark-tank-s5-2025':'Shark Tank India Season 5 — Level 2 shortlist',
    };

    return {
      label: node.label,
      type: node.type,
      desc: desc.length > 80 ? desc.slice(0, 80) + '…' : desc,
      stat: stat[node.id] ?? '',
      cluster: cluster?.name ?? '',
      color: nodeColors[node.type as NodeType] ?? '#6366f1',
    };
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050508] text-white flex flex-col">
      <SEO
        title={selectedNode ? `${selectedNode.label} — Lakshveer's Universe` : "Lakshveer's Universe — 8 · Builder · 170+ projects"}
        description="An 8-year-old's knowledge graph. Hardware. AI. 170+ builds. 126 signals. Explore the mind of India's youngest hardware founder."
        ogImage="https://lakshveer.com/universe-og.png"
      />

      {/* ── HERO STRIP ───────────────────────────── */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-2.5 border-b border-white/8 bg-[#050508]/95 backdrop-blur-sm z-50" style={{borderColor:'rgba(255,255,255,0.06)'}}>

        {/* Left: back + identity */}
        <div className="flex items-center gap-4 min-w-0">
          <a href="/" className="text-zinc-500 hover:text-white transition-colors flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">L</div>
            <div className="min-w-0">
              <span className="text-sm font-semibold text-white">Lakshveer</span>
              <span className="text-zinc-500 text-xs ml-2 hidden sm:inline">8 · Hyderabad · Hardware + AI</span>
            </div>
          </div>
          {/* Live stats pills */}
          <div className="hidden md:flex items-center gap-1.5 ml-2">
            {[
              { v: '170+', l: 'builds' },
              { v: '126', l: 'signals' },
              { v: '39', l: 'endorsers' },
              { v: '₹1.4L', l: 'grants' },
              { v: '13', l: 'press' },
            ].map(s => (
              <span key={s.l} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-zinc-400" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                <span className="text-white font-medium">{s.v}</span> {s.l}
              </span>
            ))}
          </div>
        </div>

        {/* Center: scrolling quote */}
        <div className="hidden lg:flex flex-1 mx-6 overflow-hidden">
          <div className="w-full text-center transition-all duration-700">
            <span className="text-xs text-zinc-400 italic">
              "{QUOTES[quoteIndex].text}"
            </span>
            <span className="text-[10px] text-zinc-600 ml-2">— {QUOTES[quoteIndex].author}</span>
          </div>
        </div>

        {/* Right: controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-32 px-3 py-1.5 bg-white/5 border border-white/8 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50"
              style={{borderColor: searchQuery ? undefined : 'rgba(255,255,255,0.06)'}}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs">✕</button>
            )}
          </div>

          {/* View mode */}
          <div className="hidden md:flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5">
            {(['explore','clusters','timeline'] as ViewMode[]).map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                  viewMode === m ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-white'
                }`}
              >{m}</button>
            ))}
          </div>

          {/* Private mode */}
          <button
            onClick={togglePrivateMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              privateMode
                ? 'bg-purple-500/15 border-purple-500/30 text-purple-300'
                : 'bg-white/5 border-white/8 text-zinc-500 hover:text-white'
            }`}
            style={!privateMode ? {borderColor:'rgba(255,255,255,0.06)'} : {}}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${privateMode ? 'bg-purple-400' : 'bg-zinc-600'}`} />
            {privateMode ? 'Private' : 'Private'}
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ──────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── LEFT PANEL (collapsed by default) ── */}
        <div
          className={`${leftPanelOpen ? 'w-64' : 'w-0'} flex-shrink-0 transition-all duration-300 overflow-hidden border-r z-30 bg-[#050508]/90`}
          style={{borderColor:'rgba(255,255,255,0.06)'}}
        >
          <div className="w-64 h-full overflow-y-auto p-3 space-y-4">

            {/* Capability clusters */}
            <div>
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2">Clusters</p>
              <div className="space-y-1.5">
                {capabilityClusters.map(cluster => (
                  <button
                    key={cluster.id}
                    onClick={() => {
                      setActiveCluster(activeCluster === cluster.id ? null : cluster.id);
                      setViewMode('clusters');
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all ${
                      activeCluster === cluster.id ? 'bg-white/8' : 'hover:bg-white/5'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cluster.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-300 truncate">{cluster.name}</p>
                      <p className="text-[10px] text-zinc-600">Lv.{cluster.level} · {cluster.growthRate}x growth</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by type */}
            <div>
              <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2">Filter</p>
              <div className="flex flex-wrap gap-1">
                {(['project','product','skill','tool','person','company','event','media','achievement','possibility'] as NodeType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setActiveFilters(prev => {
                        const next = new Set(prev);
                        next.has(type) ? next.delete(type) : next.add(type);
                        return next;
                      });
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-full border transition-all capitalize"
                    style={activeFilters.has(type) ? {
                      color: nodeColors[type], background: nodeColors[type] + '20', borderColor: nodeColors[type] + '40'
                    } : { color: '#52525b', borderColor: 'rgba(63,63,70,0.3)' }}
                  >{type}</button>
                ))}
              </div>
            </div>

            {/* Possibilities toggle */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Show possibilities</span>
              <button
                onClick={() => setShowPossibilities(p => !p)}
                className={`w-8 h-4 rounded-full transition-colors ${showPossibilities ? 'bg-cyan-500/50' : 'bg-zinc-700'}`}
              >
                <div className={`w-3 h-3 rounded-full bg-white transition-transform mx-0.5 ${showPossibilities ? 'translate-x-4' : ''}`} />
              </button>
            </div>

            {/* Private mode tools */}
            {privateMode && (
              <div className="space-y-1.5 border-t pt-3" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2">Intelligence</p>
                {[
                  { label: 'Verification Queue', onClick: () => setShowVerificationDashboard(true), color: 'amber' },
                  { label: 'Gaps & Opportunities', onClick: () => setShowGapsPanel(true), color: 'green' },
                  { label: 'Weekly OS', onClick: () => setShowWeeklyOS(true), color: 'purple' },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-xs transition-all ${
                      item.color === 'amber' ? 'text-amber-400 hover:bg-amber-500/10' :
                      item.color === 'green' ? 'text-green-400 hover:bg-green-500/10' :
                      'text-purple-400 hover:bg-purple-500/10'
                    }`}
                  >{item.label}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── LEFT PANEL TOGGLE ── */}
        <button
          onClick={() => setLeftPanelOpen(p => !p)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-40 w-5 h-10 flex items-center justify-center bg-zinc-900 border border-white/8 rounded-r-lg text-zinc-500 hover:text-white transition-all"
          style={{ left: leftPanelOpen ? '256px' : '0', borderColor:'rgba(255,255,255,0.06)' }}
        >
          <svg className={`w-3 h-3 transition-transform ${leftPanelOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* ── CANVAS (the hero) ── */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden"
          style={{ cursor: isDragging ? 'grabbing' : hoveredNode ? 'pointer' : isPanning ? 'grabbing' : 'grab' }}
        >
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => { setHoveredNode(null); setIsPanning(false); }}
            onWheel={handleWheel}
            className="block"
          />

          {/* Timeline slider */}
          {viewMode === 'timeline' && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 bg-zinc-900/90 border border-white/8 rounded-xl px-4 py-3" style={{borderColor:'rgba(255,255,255,0.06)'}}>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-500 w-12">Jul 22</span>
                <input
                  type="range" min={0} max={timelineDates.length - 1}
                  value={timelineDates.indexOf(timelineDate)}
                  onChange={e => setTimelineDate(timelineDates[parseInt(e.target.value)])}
                  className="flex-1 accent-cyan-500"
                />
                <span className="text-[10px] text-zinc-500 w-12 text-right">Feb 26</span>
                <span className="text-sm font-mono text-cyan-400 w-16 text-right">{timelineDate}</span>
              </div>
            </div>
          )}

          {/* ── STATS BADGE (top-right of canvas) ── */}
          <div className="absolute top-3 right-3 flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900/80 border border-white/8 rounded-lg text-[10px] text-zinc-500" style={{borderColor:'rgba(255,255,255,0.06)'}}>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>{filteredNodes.length} nodes</span>
              <span className="text-zinc-700">·</span>
              <span>{filteredEdges.length} edges</span>
              <span className="text-zinc-700">·</span>
              <span className="text-cyan-500">centralized</span>
            </div>
            <button
              onClick={copyShareLink}
              className="px-2 py-1 bg-zinc-900/80 border border-white/8 rounded-lg text-[10px] text-zinc-500 hover:text-white transition-colors"
              style={{borderColor:'rgba(255,255,255,0.06)'}}
            >
              {linkCopied ? '✓ copied' : 'share ↗'}
            </button>
          </div>

          {/* ── HOVER CARD ── */}
          {hoveredNode && !selectedNode && (() => {
            const card = getNodeCard(hoveredNode);
            return (
              <div
                className="absolute pointer-events-none z-20 max-w-[220px]"
                style={{
                  left: Math.min(hoveredNode.x * zoom + pan.x + dimensions.width / 2 * (1 - zoom) + 14, dimensions.width - 240),
                  top: Math.max(hoveredNode.y * zoom + pan.y + dimensions.height / 2 * (1 - zoom) - 10, 10),
                }}
              >
                <div className="bg-zinc-900/95 border rounded-xl p-3 shadow-xl backdrop-blur-sm" style={{borderColor: card.color + '40'}}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{background: card.color}} />
                    <span className="text-sm font-semibold text-white truncate">{card.label}</span>
                  </div>
                  {card.desc && <p className="text-[11px] text-zinc-400 leading-snug mb-1">{card.desc}</p>}
                  {card.stat && <p className="text-[10px] text-cyan-400 leading-snug">{card.stat}</p>}
                  {card.cluster && <p className="text-[10px] text-zinc-600 mt-1">Cluster: {card.cluster}</p>}
                  <p className="text-[9px] text-zinc-700 mt-1 capitalize">{card.type} · click to explore</p>
                </div>
              </div>
            );
          })()}

          {/* ── ASK ANYTHING (floating, bottom center) ── */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4">
            <div
              className={`flex items-center gap-2 bg-zinc-900/95 border rounded-2xl px-4 py-2.5 shadow-2xl backdrop-blur-sm transition-all ${
                askFocused ? 'border-cyan-500/50 shadow-cyan-500/10' : 'border-white/10'
              }`}
            >
              <span className="text-zinc-500 text-sm flex-shrink-0">✦</span>
              <input
                ref={askInputRef}
                type="text"
                value={askQuery}
                onChange={e => setAskQuery(e.target.value)}
                onFocus={() => setAskFocused(true)}
                onBlur={() => setAskFocused(false)}
                onKeyDown={e => { if (e.key === 'Enter' && askQuery.trim()) { handleAsk(askQuery); setRightPanelOpen(true); } }}
                placeholder="Ask anything about Lakshveer…"
                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
              />
              {askLoading ? (
                <div className="w-4 h-4 border border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin flex-shrink-0" />
              ) : (
                <button
                  onClick={() => { if (askQuery.trim()) { handleAsk(askQuery); setRightPanelOpen(true); } }}
                  className="text-xs text-zinc-500 hover:text-cyan-400 transition-colors flex-shrink-0 font-medium"
                >
                  ask →
                </button>
              )}
            </div>
            {askHighlightedNodes.size > 0 && (
              <div className="flex items-center justify-center gap-1 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] text-cyan-500">{askHighlightedNodes.size} node{askHighlightedNodes.size !== 1 ? 's' : ''} highlighted</span>
                <button onClick={() => { setAskHighlightedNodes(new Set()); setAskAnswer(null); setAskQuery(''); }} className="text-[10px] text-zinc-600 hover:text-white ml-2">clear</button>
              </div>
            )}
          </div>

          {/* ── ZOOM CONTROLS ── */}
          <div className="absolute bottom-6 right-3 flex flex-col gap-1">
            <button onClick={() => setZoom(z => Math.min(3, z * 1.2))} className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/8 text-white text-sm hover:bg-zinc-800 transition-colors" style={{borderColor:'rgba(255,255,255,0.06)'}}>+</button>
            <button onClick={() => setZoom(z => Math.max(0.2, z * 0.8))} className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/8 text-white text-sm hover:bg-zinc-800 transition-colors" style={{borderColor:'rgba(255,255,255,0.06)'}}>−</button>
            <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="w-7 h-7 rounded-lg bg-zinc-900 border border-white/8 text-zinc-400 text-xs hover:bg-zinc-800 transition-colors" style={{borderColor:'rgba(255,255,255,0.06)'}}>⌂</button>
          </div>
        </div>

        {/* ── RIGHT PANEL TOGGLE ── */}
        <button
          onClick={() => setRightPanelOpen(p => !p)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-40 w-5 h-10 flex items-center justify-center bg-zinc-900 border border-white/8 rounded-l-lg text-zinc-500 hover:text-white transition-all"
          style={{ right: rightPanelOpen ? '352px' : '0', borderColor:'rgba(255,255,255,0.06)' }}
        >
          <svg className={`w-3 h-3 transition-transform ${rightPanelOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* ── RIGHT PANEL ── */}
        <div
          className={`flex-shrink-0 transition-all duration-300 overflow-hidden border-l z-30 bg-[#050508]/90`}
          style={{ width: rightPanelOpen ? '352px' : '0', borderColor:'rgba(255,255,255,0.06)' }}
        >
          <div className="w-[352px] h-full flex flex-col overflow-hidden">

            {/* Panel header tabs */}
            {!selectedNode && (
              <div className="flex-shrink-0 flex flex-col gap-1 px-3 pt-3 pb-2 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                {/* Row 1 — public */}
                <div className="flex gap-1">
                  {([
                    { id: 'insights', label: askAnswer ? '✦ Answer' : '⚡ Insights' },
                    { id: 'journey', label: '📖 Story' },
                    { id: 'signal-timeline', label: '🕐 Timeline' },
                    { id: 'participate', label: '🤝 Connect' },
                  ] as {id: RightPanelMode, label: string}[]).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setRightPanelMode(tab.id)}
                      className={`flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all ${
                        rightPanelMode === tab.id ? 'bg-cyan-500/20 text-cyan-400' : 'text-zinc-500 hover:text-white hover:bg-white/5'
                      }`}
                    >{tab.label}</button>
                  ))}
                </div>
                {/* Row 2 — private */}
                {privateMode && (
                  <div className="flex gap-1">
                    {([
                      { id: 'feed', label: '📡 Feed' },
                      { id: 'surfaces', label: '🌐 Surfaces' },
                      { id: 'health', label: '🩺 Health' },
                      { id: 'wiki', label: '🧠 Wiki' },
                    ] as {id: RightPanelMode, label: string}[]).map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setRightPanelMode(tab.id)}
                        className={`flex-1 py-1.5 text-[10px] font-medium rounded-lg transition-all ${
                          rightPanelMode === tab.id ? 'bg-purple-500/20 text-purple-400' : 'text-zinc-600 hover:text-white hover:bg-white/5'
                        }`}
                      >{tab.label}</button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Panel body */}
            <div className="flex-1 overflow-y-auto">
              {selectedNode ? (
                <>
                  {nodeLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-sm text-cyan-400">Loading…</div>
                    </div>
                  )}
                  {!nodeLoading && nodeData?.success && (
                    <NodeWorldPanel
                      nodeData={nodeData}
                      onNodeSelect={nodeId => {
                        const sn = simNodes.find(n => n.id === nodeId);
                        if (sn) setSelectedNode(sn);
                      }}
                      onClose={() => { setSelectedNode(null); window.history.pushState({}, '', '/universe'); }}
                    />
                  )}
                  {!nodeLoading && (!nodeData?.success || !nodeData) && (
                    <div className="-m-0 h-full">
                      <NodeAgentPanel
                        nodeId={selectedNode.id}
                        nodeLabel={selectedNode.label}
                        nodeType={selectedNode.type}
                        nodeDescription={selectedNode.description}
                        nodeTimestamp={selectedNode.year ? String(selectedNode.year) : undefined}
                        privateMode={privateMode}
                        onNodeSelect={nodeId => {
                          const sn = simNodes.find(n => n.id === nodeId);
                          if (sn) setSelectedNode(sn);
                        }}
                        onClose={() => { setSelectedNode(null); window.history.pushState({}, '', '/universe'); }}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full">
                  {/* Ask answer replaces insights when active */}
                  {rightPanelMode === 'insights' && askAnswer && (
                    <div className="p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <p className="text-xs font-medium text-cyan-400">Answer</p>
                        <button
                          onClick={() => { setAskAnswer(null); setAskHighlightedNodes(new Set()); setAskQuery(''); }}
                          className="ml-auto text-[10px] text-zinc-600 hover:text-white"
                        >clear</button>
                      </div>
                      <p className="text-xs text-zinc-500 mb-3 italic">"{askQuery}"</p>
                      <div className="prose prose-invert prose-xs max-w-none">
                        <pre className="whitespace-pre-wrap text-[12px] text-zinc-300 font-sans leading-relaxed">{askAnswer}</pre>
                      </div>
                    </div>
                  )}
                  {rightPanelMode === 'insights' && !askAnswer && (
                    <IntelligenceInsights />
                  )}
                  {rightPanelMode === 'journey' && (
                    <GuidedJourney
                      onNodeHighlight={nodeIds => {
                        setJourneyHighlightedNodes(nodeIds);
                        const first = simNodes.find(n => nodeIds.includes(n.id));
                        if (first) setPan({ x: dimensions.width / 2 - first.x * zoom, y: dimensions.height / 2 - first.y * zoom });
                      }}
                    />
                  )}
                  {rightPanelMode === 'participate' && <ParticipationGateway />}
                  {rightPanelMode === 'signal-timeline' && (
                    <div className="p-4"><SignalTimeline privateMode={privateMode} /></div>
                  )}
                  {rightPanelMode === 'feed' && privateMode && <IntelligenceFeed />}
                  {rightPanelMode === 'surfaces' && privateMode && <SurfaceDashboard />}
                  {rightPanelMode === 'health' && privateMode && <HealthMonitor />}
                  {rightPanelMode === 'wiki' && privateMode && (
                    <div>
                      <div className="px-4 pt-3 pb-1">
                        <a href="/wiki/graph" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-colors text-xs font-medium">
                          <span>🕸</span><span>Open Graph Visualizer</span><span className="ml-auto text-purple-500">↗</span>
                        </a>
                      </div>
                      <WikiPanel />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── QUOTE TICKER (bottom strip, mobile) ── */}
      <div className="lg:hidden flex-shrink-0 border-t px-4 py-2 bg-[#050508]/95 overflow-hidden" style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <p className="text-xs text-zinc-500 italic truncate">
          "{QUOTES[quoteIndex].text}" <span className="text-zinc-700">— {QUOTES[quoteIndex].author}</span>
        </p>
      </div>

      {/* ── MODALS (private mode) ── */}
      {showVerificationDashboard && privateMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowVerificationDashboard(false)} />
          <div className="relative w-full max-w-4xl h-[80vh] bg-[#0a0a0f] border border-white/10 rounded-lg overflow-hidden">
            <VerificationDashboard onClose={() => setShowVerificationDashboard(false)} />
          </div>
        </div>
      )}
      {showGapsPanel && privateMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGapsPanel(false)} />
          <div className="relative w-full max-w-2xl h-[80vh] bg-[#0a0a0f] border border-white/10 rounded-lg overflow-hidden">
            <GapsOpportunitiesPanel onClose={() => setShowGapsPanel(false)} />
          </div>
        </div>
      )}
      {showWeeklyOS && privateMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWeeklyOS(false)} />
          <div className="relative w-full max-w-2xl h-[80vh] bg-[#0a0a0f] border border-white/10 rounded-lg overflow-hidden">
            <WeeklyOSPanel onClose={() => setShowWeeklyOS(false)} />
          </div>
        </div>
      )}

      {/* ── PASSWORD MODAL ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
          <div className="relative w-80 bg-zinc-900 border border-white/10 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-sm font-semibold text-white mb-1">Private Mode</h3>
            <p className="text-xs text-zinc-500 mb-4">Enter your access code to unlock intelligence layers.</p>
            <input
              type="password"
              value={passwordInput}
              onChange={e => setPasswordInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handlePasswordSubmit()}
              placeholder="Access code"
              className={`w-full px-3 py-2 bg-zinc-800 border rounded-lg text-sm text-white placeholder-zinc-600 focus:outline-none mb-2 ${passwordError ? 'border-red-500/50' : 'border-white/10 focus:border-cyan-500/50'}`}
              autoFocus
            />
            {passwordError && <p className="text-xs text-red-400 mb-3">Incorrect code.</p>}
            <div className="flex gap-2">
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 text-sm hover:bg-white/10 transition-colors">Cancel</button>
              <button onClick={handlePasswordSubmit} className="flex-1 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors">Enter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Universe;
