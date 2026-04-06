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
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
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
    if (hoveredNode || selectedNode) {
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
        ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(255,255,255,${alpha * 0.1})`;
        ctx.fill();
      } else {
        const color = nodeColors[node.type];
        ctx.fillStyle = toRgba(color, alpha);
        ctx.fill();
      }
      
      // Label
      if (isHighlighted && (zoom > 0.6 || isSelected || isHovered || node.type === 'core')) {
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.font = `${isSelected || isHovered || node.type === 'core' ? 'bold ' : ''}${Math.max(9, 11 / zoom)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(node.label, node.x, node.y + size + 4);
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
    
  }, [simNodes, filteredNodes, filteredEdges, dimensions, zoom, pan, selectedNode, hoveredNode, viewMode, activeCluster, showIntelligenceEdges, privateMode, nodeOpportunities, journeyHighlightedNodes]);
  
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

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <SEO 
        title={selectedNode ? `${selectedNode.label} — Lakshveer's Learning Universe` : "Lakshveer's Learning Universe — Build to Learn"} 
        description="Explore Lakshveer's interconnected universe of projects, skills, and possibilities. An intelligence engine showing capability compounding and future paths."
        ogImage="https://lakshveer.com/universe-og.png"
      />
      
      {/* Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#050508]/90 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Back + Title */}
          <div className="flex items-center gap-4">
            <a href="/" className="text-white/60 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">Lakshveer's Learning Universe</h1>
              <p className="text-xs text-white/50">Build to Learn</p>
            </div>
          </div>
          
          {/* Center: View Mode Tabs */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 rounded-lg p-1">
            {(['explore', 'clusters', 'timeline', 'momentum'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  viewMode === mode 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Right: Search + Share */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-40 md:w-56 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-cyan-500/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              onClick={copyShareLink}
              className={`p-2 rounded-lg transition-colors ${linkCopied ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 hover:bg-white/10'}`}
              title={linkCopied ? "Link copied!" : "Copy share link"}
            >
              {linkCopied ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* Timeline Slider (when in timeline mode) */}
        {viewMode === 'timeline' && (
          <div className="px-4 pb-3">
            <div className="flex items-center gap-4">
              <span className="text-xs text-white/50 w-16">Jul 2022</span>
              <input
                type="range"
                min={0}
                max={timelineDates.length - 1}
                value={timelineDates.indexOf(timelineDate)}
                onChange={(e) => setTimelineDate(timelineDates[parseInt(e.target.value)])}
                className="flex-1 accent-cyan-500"
              />
              <span className="text-xs text-white/50 w-16 text-right">Feb 2026</span>
              <span className="text-sm font-mono text-cyan-400 w-20 text-right">{timelineDate}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Main Layout */}
      <div className="fixed inset-0 pt-[60px] flex">
        {/* Left Panel - Clusters & Momentum */}
        <div className={`${leftPanelOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden border-r border-white/10 bg-[#050508]/80 backdrop-blur-sm`}>
          <div className="h-full overflow-y-auto p-4 space-y-6">
            {/* Private Mode Toggle */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <span className="text-sm text-white/70">Private Mode</span>
                <p className="text-xs text-white/40">Show scores & formulas</p>
              </div>
              <button
                onClick={togglePrivateMode}
                className={`w-10 h-5 rounded-full transition-colors ${
                  privateMode ? 'bg-cyan-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  privateMode ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
            
            {/* Phase 3: Verification Dashboard Button (Private Mode Only) */}
            {privateMode && (
              <button
                onClick={() => setShowVerificationDashboard(true)}
                className="w-full p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-left hover:bg-amber-500/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-amber-400">Verification Queue</span>
                    <p className="text-xs text-white/40">Review pending nodes and edges</p>
                  </div>
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </button>
            )}
            
            {/* Phase 4: Gaps & Opportunities Button (Private Mode Only) */}
            {privateMode && (
              <button
                onClick={() => setShowGapsPanel(true)}
                className="w-full p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-left hover:bg-green-500/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-green-400">Gaps & Opportunities</span>
                    <p className="text-xs text-white/40">Auto-detected learning gaps and opportunities</p>
                  </div>
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </button>
            )}
            
            {/* Phase 5: Weekly OS Button (Week 2 - Mentor Intelligence) */}
            {privateMode && (
              <button
                onClick={() => setShowWeeklyOS(true)}
                className="w-full p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-left hover:bg-purple-500/20 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-purple-400">Weekly OS</span>
                    <p className="text-xs text-white/40">2-4 next moves with mentor reasoning</p>
                  </div>
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
              </button>
            )}
            
            {/* Capability Clusters - API Powered with Computed Scores */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider">Capability Clusters</h3>
                {clustersLoading && (
                  <span className="text-xs text-cyan-400">Loading...</span>
                )}
              </div>
              <div className="space-y-2">
                {(apiClusters.length > 0 ? apiClusters : capabilityClusters.map(c => ({
                  id: c.id,
                  label: c.name,
                  description: c.description,
                  color: c.color,
                  level: c.level,
                  computedLevel: c.level,
                  computedScore: 0,
                  growthVelocity: c.growthRate,
                  nodeCount: c.nodeIds.length,
                  growth_rate: c.growthRate,
                  momentum: 0,
                  project_count: 0,
                  skill_count: 0,
                  core_skills: c.coreSkills || [],
                } as EnrichedCluster))).map(cluster => (
                  <ClusterScoreCard
                    key={cluster.id}
                    cluster={cluster}
                    expanded={expandedCluster === cluster.id && privateMode}
                    onClick={() => {
                      // Toggle cluster filter
                      setActiveCluster(activeCluster === cluster.id ? null : cluster.id);
                      // Expand/collapse score details in private mode
                      if (privateMode) {
                        setExpandedCluster(expandedCluster === cluster.id ? null : cluster.id);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
            
            {/* Momentum Metrics */}
            <div>
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Momentum Metrics</h3>
              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/70">Overall Momentum</span>
                    <span className="text-lg font-bold text-cyan-400">{momentum.overallMomentum}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 rounded-full" 
                      style={{ width: `${momentum.overallMomentum}%` }}
                    />
                  </div>
                </div>
                
                {[
                  { label: 'Build Frequency', value: momentum.buildFrequency, color: '#10b981' },
                  { label: 'Brand Impact', value: momentum.brandImpact, color: '#3b82f6' },
                  { label: 'Skill Density', value: momentum.skillDensity, color: '#8b5cf6' },
                  { label: 'Network Growth', value: momentum.networkExpansion, color: '#ec4899' },
                  { label: 'Recognition', value: momentum.recognitionGrowth, color: '#f59e0b' },
                ].map(metric => (
                  <div key={metric.label} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/50">{metric.label}</span>
                        <span className="text-xs font-mono" style={{ color: metric.color }}>{metric.value}</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ width: `${Math.min(100, metric.value)}%`, backgroundColor: metric.color }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Quick Stats */}
            <div>
              <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Universe Stats</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-white/5 rounded-lg text-center">
                  <div className="text-lg font-bold text-white">{stats.totalNodes}</div>
                  <div className="text-xs text-white/50">Nodes</div>
                </div>
                <div className="p-2 bg-white/5 rounded-lg text-center">
                  <div className="text-lg font-bold text-white">{stats.totalEdges}</div>
                  <div className="text-xs text-white/50">Connections</div>
                </div>
                <div className="p-2 bg-white/5 rounded-lg text-center">
                  <div className="text-lg font-bold text-cyan-400">{crossPollinations.length}</div>
                  <div className="text-xs text-white/50">Cross-pollinations</div>
                </div>
                <div className="p-2 bg-white/5 rounded-lg text-center">
                  <div className="text-lg font-bold text-amber-400">{futurePaths.length}</div>
                  <div className="text-xs text-white/50">Future Paths</div>
                </div>
              </div>
            </div>
            
            {/* Toggle Intelligence Edges */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <span className="text-sm text-white/70">Show Intelligence Edges</span>
              <button
                onClick={() => setShowIntelligenceEdges(!showIntelligenceEdges)}
                className={`w-10 h-5 rounded-full transition-colors ${
                  showIntelligenceEdges ? 'bg-cyan-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  showIntelligenceEdges ? 'translate-x-5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Toggle Left Panel */}
        <button
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/10 hover:bg-white/20 rounded-r-lg transition-all"
          style={{ left: leftPanelOpen ? '288px' : '0' }}
        >
          <svg className={`w-4 h-4 transition-transform ${leftPanelOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        {/* Canvas Container */}
        <div 
          ref={containerRef} 
          className="flex-1 relative cursor-grab active:cursor-grabbing"
          style={{ minHeight: 0 }}
        >
          <canvas
            ref={canvasRef}
            width={dimensions.width}
            height={dimensions.height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />
          
          {/* Zoom controls */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2">
            <button
              onClick={() => setZoom(z => Math.min(3, z * 1.2))}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => setZoom(z => Math.max(0.2, z / 1.2))}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-xs font-mono"
            >
              1:1
            </button>
          </div>
          
          {/* Legend */}
          <div className="absolute bottom-4 left-20 flex flex-wrap gap-3">
            {Object.entries(nodeTypeLabels).slice(0, 6).map(([type, label]) => (
              <button
                key={type}
                onClick={() => {
                  const newFilters = new Set(activeFilters);
                  if (newFilters.has(type as NodeType)) {
                    newFilters.delete(type as NodeType);
                  } else {
                    newFilters.add(type as NodeType);
                  }
                  setActiveFilters(newFilters);
                }}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs transition-all ${
                  activeFilters.has(type as NodeType) 
                    ? 'bg-white/20' 
                    : activeFilters.size > 0 ? 'opacity-40' : 'opacity-70 hover:opacity-100'
                }`}
              >
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: nodeColors[type as NodeType] }}
                />
                <span>{label}</span>
              </button>
            ))}
            
            {/* Phase 3: Verification Legend (Private Mode Only) */}
            {privateMode && (
              <>
                <div className="w-px h-4 bg-white/20 self-center mx-1" />
                <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs opacity-70">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Verified</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs opacity-70">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded text-xs opacity-70">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span>Inferred</span>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Toggle Right Panel */}
        <button
          onClick={() => setRightPanelOpen(!rightPanelOpen)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 bg-white/10 hover:bg-white/20 rounded-l-lg transition-all"
          style={{ right: rightPanelOpen ? '352px' : '0' }}
        >
          <svg className={`w-4 h-4 transition-transform ${rightPanelOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        {/* Right Panel - Details & Insights */}
        <div className={`${rightPanelOpen ? 'w-88' : 'w-0'} transition-all duration-300 overflow-hidden border-l border-white/10 bg-[#050508]/80 backdrop-blur-sm`} style={{ width: rightPanelOpen ? '352px' : '0' }}>
          
          {/* Panel mode switcher (when no node selected) */}
          {!selectedNode && (
            <div className="flex flex-col gap-1 px-3 pt-3 pb-1">
              {/* Row 1 — always visible */}
              <div className="flex items-center gap-1">
                {([
                  { id: 'insights' as RightPanelMode, label: '⚡ Insights' },
                  { id: 'journey' as RightPanelMode, label: '📖 Journey' },
                  { id: 'participate' as RightPanelMode, label: '🤝 Join' },
                  { id: 'signal-timeline' as RightPanelMode, label: '🕐 Timeline' },
                ]).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setRightPanelMode(tab.id)}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      rightPanelMode === tab.id
                        ? 'bg-cyan-500/20 text-cyan-400'
                        : 'text-white/40 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* Row 2 — private mode tabs */}
              {privateMode && (
                <div className="flex items-center gap-1">
                  {([
                    { id: 'feed' as RightPanelMode, label: '📡 Feed' },
                    { id: 'surfaces' as RightPanelMode, label: '🌐 Surfaces' },
                    { id: 'health' as RightPanelMode, label: '🩺 Health' },
                    { id: 'wiki' as RightPanelMode, label: '🧠 Wiki' },
                  ]).map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setRightPanelMode(tab.id)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
                        rightPanelMode === tab.id
                          ? 'bg-purple-500/20 text-purple-400'
                          : 'text-white/30 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="h-full overflow-y-auto p-4 space-y-6">
            {selectedNode ? (
              <>
                {/* Loading State */}
                {nodeLoading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-sm text-cyan-400">Loading node data...</div>
                  </div>
                )}
                
                {/* NODE=WORLD Panel (API Data Available) */}
                {!nodeLoading && nodeData?.success && (
                  <NodeWorldPanel
                    nodeData={nodeData}
                    onNodeSelect={(nodeId) => {
                      const simNode = simNodes.find(n => n.id === nodeId);
                      if (simNode) setSelectedNode(simNode);
                    }}
                    onClose={() => {
                      setSelectedNode(null);
                      window.history.pushState({}, '', '/universe');
                    }}
                  />
                )}
                
                {/* v4 Fallback: NodeAgentPanel (API Failed or Unavailable) */}
                {!nodeLoading && (!nodeData?.success || !nodeData) && (
                  <div className="-m-4 h-full">
                    <NodeAgentPanel
                      nodeId={selectedNode.id}
                      nodeLabel={selectedNode.label}
                      nodeType={selectedNode.type}
                      nodeDescription={selectedNode.description}
                      nodeTimestamp={selectedNode.year ? String(selectedNode.year) : undefined}
                      privateMode={privateMode}
                      onNodeSelect={(nodeId) => {
                        const simNode = simNodes.find(n => n.id === nodeId);
                        if (simNode) setSelectedNode(simNode);
                      }}
                      onClose={() => {
                        setSelectedNode(null);
                        window.history.pushState({}, '', '/universe');
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              /* v4: Intelligence OS default panel — no node selected */
              <div className="-m-4 h-full">
                {rightPanelMode === 'insights' && (
                  <IntelligenceInsights />
                )}
                {rightPanelMode === 'journey' && (
                  <GuidedJourney
                    onNodeHighlight={(nodeIds) => {
                      setJourneyHighlightedNodes(nodeIds);
                      // Pan to first highlighted node in graph
                      const first = simNodes.find(n => nodeIds.includes(n.id));
                      if (first) {
                        setPan({
                          x: dimensions.width / 2 - first.x * zoom,
                          y: dimensions.height / 2 - first.y * zoom,
                        });
                      }
                    }}
                  />
                )}
                {rightPanelMode === 'participate' && (
                  <ParticipationGateway />
                )}
                {rightPanelMode === 'feed' && privateMode && (
                  <IntelligenceFeed />
                )}
                {rightPanelMode === 'signal-timeline' && (
                  <div className="p-4">
                    <SignalTimeline privateMode={privateMode} />
                  </div>
                )}
                {rightPanelMode === 'surfaces' && privateMode && (
                  <SurfaceDashboard />
                )}
                {rightPanelMode === 'health' && privateMode && (
                  <HealthMonitor />
                )}
                {rightPanelMode === 'wiki' && privateMode && (
                  <WikiPanel />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* v6: Embedded Participation Gateway — below the graph, public only */}
      {!privateMode && (
        <ParticipationGateway embedded />
      )}
      
      {/* Phase 3: Verification Dashboard Modal */}
      {showVerificationDashboard && privateMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowVerificationDashboard(false)}
          />
          <div className="relative w-full max-w-4xl h-[80vh] max-h-[800px] bg-[#0a0a0f] border border-white/10 rounded-lg overflow-hidden">
            <VerificationDashboard onClose={() => setShowVerificationDashboard(false)} />
          </div>
        </div>
      )}
      
      {/* Phase 4: Gaps & Opportunities Modal */}
      {showGapsPanel && privateMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowGapsPanel(false)}
          />
          <div className="relative w-full max-w-4xl h-[80vh] max-h-[800px] bg-[#0a0a0f] border border-white/10 rounded-lg overflow-hidden">
            <GapsOpportunitiesPanel 
              onClose={() => setShowGapsPanel(false)}
              onNodeSelect={(nodeId) => {
                const simNode = simNodes.find(n => n.id === nodeId);
                if (simNode) {
                  setSelectedNode(simNode);
                  setShowGapsPanel(false);
                }
              }}
            />
          </div>
        </div>
      )}
      
      {/* Phase 5: Weekly OS Modal (Week 2 - Mentor Intelligence) */}
      {showWeeklyOS && privateMode && (
        <WeeklyOSPanel onClose={() => setShowWeeklyOS(false)} />
      )}
      
      {/* Password Modal for Private Mode */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowPasswordModal(false)}
          />
          <div className="relative w-full max-w-sm bg-[#0a0a0f] border border-white/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Enter Password</h3>
            <p className="text-xs text-white/50 mb-4">Private mode requires authentication.</p>
            
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => {
                setPasswordInput(e.target.value);
                setPasswordError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handlePasswordSubmit();
                }
              }}
              placeholder="Password"
              className={`w-full px-4 py-2 bg-white/5 border rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500 ${
                passwordError ? 'border-red-500' : 'border-white/10'
              }`}
              autoFocus
            />
            
            {passwordError && (
              <p className="text-xs text-red-400 mt-2">Incorrect password</p>
            )}
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                className="flex-1 px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 rounded-lg text-cyan-400 hover:bg-cyan-500/30 transition-colors"
              >
                Enter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Universe;
