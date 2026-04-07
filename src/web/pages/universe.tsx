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
// SignalTimeline, HealthMonitor, SurfaceDashboard moved to left panel modals (private mode)
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
type RightPanelMode = 'journey' | 'insights' | 'participate' | 'feed' | 'wiki';

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
// QUOTES (outside component — stable ref)
// ============================================
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

// ============================================
// MAIN COMPONENT
// ============================================

function Universe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);
  const dimensionsRef = useRef({ width: 390, height: 600 });
  const isMobileRef = useRef(false);
  const [, setLocation] = useLocation();
  
  // Core state
  const [dimensions, setDimensions] = useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? Math.max(window.innerHeight - 120, 400) : 600,
  }));
  const [selectedNode, setSelectedNode] = useState<SimNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<SimNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<Set<NodeType>>(new Set());
  const [showPossibilities, setShowPossibilities] = useState(false); // hidden on mobile; desktop shows after isMobile resolves
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<SimNode | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0 });
  // Touch state for mobile
  const [lastTouchDist, setLastTouchDist] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 768;
      isMobileRef.current = mobile;
      setIsMobile(mobile);
      // Panel open by default on desktop only
      setRightPanelOpen(!mobile);
      // Possibilities visible on desktop, hidden on mobile
      setShowPossibilities(!mobile);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  
  // Intelligence state
  const [viewMode, setViewMode] = useState<ViewMode>('explore');
  const [activeCluster, setActiveCluster] = useState<string | null>(null);
  const [timelineDate, setTimelineDate] = useState('2026-02');
  const [showIntelligenceEdges, setShowIntelligenceEdges] = useState(true);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false); // set correctly after isMobile resolves
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
  const [rightPanelMode, setRightPanelMode] = useState<RightPanelMode>('journey'); // Story is first
  const [journeyHighlightedNodes, setJourneyHighlightedNodes] = useState<string[]>([]);

  // v5: Ask anything
  const [askQuery, setAskQuery] = useState('');
  const [askAnswer, setAskAnswer] = useState<string | null>(null);
  const [askLoading, setAskLoading] = useState(false);
  const [askHighlightedNodes, setAskHighlightedNodes] = useState<Set<string>>(new Set());
  const [askFocused, setAskFocused] = useState(false);
  const askInputRef = useRef<HTMLInputElement>(null);

  // Mobile UX state
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hintVisible, setHintVisible] = useState(true);
  const [mobileTapCard, setMobileTapCard] = useState<SimNode | null>(null);

  // Show onboarding once per device
  useEffect(() => {
    if (!isMobile) return;
    const seen = localStorage.getItem('lk_universe_seen');
    if (!seen) setShowOnboarding(true);
  }, [isMobile]);

  // Hide hint after 6s or first canvas tap
  useEffect(() => {
    if (!isMobile) return;
    const t = setTimeout(() => setHintVisible(false), 4000);
    return () => clearTimeout(t);
  }, [isMobile]);

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
  
  // Initialize nodes with positions — spread evenly around center, sim will refine
  const [simNodes, setSimNodes] = useState<SimNode[]>(() => {
    const cx = 500;
    const cy = 400;
    return allNodes.map((node, i) => {
      // Spread across multiple rings so sim has a good starting layout
      const ring = node.type === 'core' ? 0 : Math.floor(i / 12) + 1;
      const angleStep = (Math.PI * 2) / Math.min(12, allNodes.length);
      const angle = (i % 12) * angleStep + ring * 0.3;
      const radius = node.type === 'core' ? 0 : ring * 80 + 40;
      return {
        ...node,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
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
      
      // On mobile hide 'concept' nodes by default — too abstract for first-timers
      if (isMobile && node.type === 'concept' && !searchQuery && activeFilters.size === 0) return false;
      
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
        const d = { width: rect.width, height: rect.height };
        dimensionsRef.current = d;
        setDimensions(d);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Helper: compute fit-to-screen zoom+pan from node positions
  const fitToScreen = useCallback((nodes: SimNode[]) => {
    const { width: w, height: h } = dimensionsRef.current;
    if (!w || !h || nodes.length === 0) return;
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    // generous padding so nothing clips at edges
    const pad = isMobileRef.current ? 100 : 60;
    const graphW = maxX - minX + pad * 2;
    const graphH = maxY - minY + pad * 2;
    const scaleX = w / graphW;
    const scaleY = h / graphH;
    // cap zoom at 0.75 on mobile so it's never too zoomed in
    const maxZ = isMobileRef.current ? 0.75 : 0.9;
    const newZoom = Math.min(scaleX, scaleY, maxZ);
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    // Canvas transform: screenX = (worldX - w/2)*zoom + pan.x + w/2
    // To put centerX at screen center: pan.x = -(centerX - w/2)*zoom
    setZoom(newZoom);
    setPan({
      x: -(centerX - w / 2) * newZoom,
      y: -(centerY - h / 2) * newZoom,
    });
  }, []);

  // Force simulation
  useEffect(() => {
    let running = true;
    // On mobile, stop simulation after 3s then immediately fit
    const stopTimer = isMobile ? setTimeout(() => {
      running = false;
      // Fit using latest node positions via setSimNodes read trick
      setSimNodes(current => {
        fitToScreen(current);
        return current;
      });
    }, 3000) : null;
    
    const simulate = () => {
      if (!running) return;
      
      setSimNodes(prevNodes => {
        const nodes = [...prevNodes];
        // Use ref so we always have current dimensions (no stale closure)
        const { width: dimW, height: dimH } = dimensionsRef.current;
        const centerX = dimW / 2;
        const centerY = dimH / 2;
        
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
          
          // Center gravity — stronger on mobile to keep cluster tight
          const isMob = isMobileRef.current;
          const gravityStrength = node.type === 'core' ? 0.05 : (isMob ? 0.006 : 0.002);
          node.vx += (centerX - node.x) * gravityStrength;
          node.vy += (centerY - node.y) * gravityStrength;
          
          // Repulsion — wider radius on mobile so nodes don't pile up
          const repulsionRadius = isMob ? 4 : 3;
          const repulsionStrength = isMob ? 0.8 : 0.5;
          nodes.forEach((other, j) => {
            if (i === j) return;
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const minDist = 50;
            if (dist < minDist * repulsionRadius) {
              const force = (minDist * minDist) / (dist * dist) * repulsionStrength;
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
        
        // Apply velocity — use ref dimensions
        nodes.forEach(node => {
          if (node.fx != null || node.fy != null) return;
          node.vx *= 0.9;
          node.vy *= 0.9;
          node.x += node.vx;
          node.y += node.vy;
          
          if (isMobileRef.current) {
            // Hard radial clamp on mobile — nodes cannot leave this radius
            const dx = node.x - centerX;
            const dy = node.y - centerY;
            const distFromCenter = Math.sqrt(dx * dx + dy * dy) || 1;
            const maxRadius = Math.min(dimW, dimH) * 0.42;
            if (distFromCenter > maxRadius) {
              // Hard clamp: snap to boundary and kill outward velocity
              node.x = centerX + (dx / distFromCenter) * maxRadius;
              node.y = centerY + (dy / distFromCenter) * maxRadius;
              // Kill velocity component pointing outward
              const vDotD = node.vx * (dx/distFromCenter) + node.vy * (dy/distFromCenter);
              if (vDotD > 0) {
                node.vx -= vDotD * (dx/distFromCenter);
                node.vy -= vDotD * (dy/distFromCenter);
              }
            }
          } else {
            const padding = 50;
            node.x = Math.max(padding, Math.min(dimW - padding, node.x));
            node.y = Math.max(padding, Math.min(dimH - padding, node.y));
          }
        });
        
        return nodes;
      });
      
      animationRef.current = requestAnimationFrame(simulate);
    };
    
    simulate();
    return () => {
      running = false;
      if (stopTimer) clearTimeout(stopTimer);
      cancelAnimationFrame(animationRef.current);
    };
  }, [dimensions, isMobile, fitToScreen]);

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
      
      // Label — on mobile only show for core/selected/hovered or when zoomed in enough
      const showLabel = isHighlighted && (
        isSelected || isHovered || node.type === 'core'
          ? true
          : zoom > (isMobile ? 1.0 : 0.6)
      );
      if (showLabel) {
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
    
  }, [simNodes, filteredNodes, filteredEdges, dimensions, zoom, pan, selectedNode, hoveredNode, viewMode, activeCluster, showIntelligenceEdges, privateMode, nodeOpportunities, journeyHighlightedNodes, askHighlightedNodes, isMobile]);
  
  // Mouse handlers
  const getNodeAtPosition = useCallback((clientX: number, clientY: number): SimNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left - pan.x - dimensions.width / 2) / zoom + dimensions.width / 2);
    const y = ((clientY - rect.top - pan.y - dimensions.height / 2) / zoom + dimensions.height / 2);
    
    let closest: SimNode | null = null;
    const hitRadius = ('ontouchstart' in window) ? 44 / zoom : 25 / zoom;
    let closestDist = hitRadius;
    
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

  // Touch handlers for mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const t = e.touches[0];
      const node = getNodeAtPosition(t.clientX, t.clientY);
      if (node) {
        setDraggedNode(node);
        setIsDragging(true);
        node.fx = node.x;
        node.fy = node.y;
      } else {
        setIsPanning(true);
      }
      setLastMouse({ x: t.clientX, y: t.clientY });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setLastTouchDist(Math.sqrt(dx * dx + dy * dy));
    }
  }, [getNodeAtPosition]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const t = e.touches[0];
      if (isDragging && draggedNode) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        draggedNode.fx = ((t.clientX - rect.left - pan.x - dimensions.width / 2) / zoom + dimensions.width / 2);
        draggedNode.fy = ((t.clientY - rect.top - pan.y - dimensions.height / 2) / zoom + dimensions.height / 2);
      } else if (isPanning) {
        const dx = t.clientX - lastMouse.x;
        const dy = t.clientY - lastMouse.y;
        setPan(p => ({ x: p.x + dx, y: p.y + dy }));
        setLastMouse({ x: t.clientX, y: t.clientY });
      }
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastTouchDist > 0) {
        const scale = dist / lastTouchDist;
        setZoom(z => Math.max(0.2, Math.min(3, z * scale)));
      }
      setLastTouchDist(dist);
    }
  }, [isDragging, draggedNode, isPanning, lastMouse, lastTouchDist, pan, zoom, dimensions]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isDragging && draggedNode) {
      const moveDistance = e.changedTouches.length > 0
        ? Math.sqrt(
            Math.pow(e.changedTouches[0].clientX - lastMouse.x, 2) +
            Math.pow(e.changedTouches[0].clientY - lastMouse.y, 2)
          )
        : 99;
      if (moveDistance < 10) {
        setSelectedNode(draggedNode);
        setHintVisible(false);
        // On mobile: show mini tap-card first, not full panel
        if (isMobileRef.current) {
          setMobileTapCard(draggedNode);
        } else {
          setRightPanelOpen(true);
        }
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
    setLastTouchDist(0);
  }, [isDragging, draggedNode, lastMouse]);
  
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
    setRightPanelMode('insights'); // switch to insights when ask fires
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

  // ── Panel tabs definition (derived, stable) ──
  const publicTabs = [
    { id: 'journey' as RightPanelMode,    label: 'Story',    dot: '#22d3ee' },
    { id: 'insights' as RightPanelMode,   label: askAnswer ? 'Answer' : 'Insights', dot: '#a855f7' },
    { id: 'participate' as RightPanelMode, label: 'Connect',  dot: '#10b981' },
  ];
  const privateTabs = [
    { id: 'feed' as RightPanelMode, label: 'Feed',  dot: '#f59e0b' },
    { id: 'wiki' as RightPanelMode, label: 'Wiki',  dot: '#8b5cf6' },
  ];

  // ── Shared right panel content ──
  const panelContent = (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Tab bar — only when no node selected */}
      {!selectedNode && (
        <div className="flex-shrink-0 flex items-center gap-0.5 px-3 pt-3 pb-2 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
          {[...publicTabs, ...(privateMode ? privateTabs : [])].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRightPanelMode(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-1 justify-center ${
                rightPanelMode === tab.id
                  ? 'bg-white/8 text-white'
                  : 'text-zinc-600 hover:text-zinc-300 hover:bg-white/4'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background: rightPanelMode === tab.id ? tab.dot : 'rgba(255,255,255,0.15)'}} />
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Body */}
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
                onNodeSelect={nodeId => { const sn = simNodes.find(n => n.id === nodeId); if (sn) setSelectedNode(sn); }}
                onClose={() => { setSelectedNode(null); window.history.pushState({}, '', '/universe'); }}
              />
            )}
            {!nodeLoading && (!nodeData?.success || !nodeData) && (
              <div className="h-full">
                <NodeAgentPanel
                  nodeId={selectedNode.id}
                  nodeLabel={selectedNode.label}
                  nodeType={selectedNode.type}
                  nodeDescription={selectedNode.description}
                  nodeTimestamp={selectedNode.year ? String(selectedNode.year) : undefined}
                  privateMode={privateMode}
                  onNodeSelect={nodeId => { const sn = simNodes.find(n => n.id === nodeId); if (sn) setSelectedNode(sn); }}
                  onClose={() => { setSelectedNode(null); window.history.pushState({}, '', '/universe'); }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="h-full">
            {/* Story — default landing experience */}
            {rightPanelMode === 'journey' && (
              <GuidedJourney
                onNodeHighlight={nodeIds => {
                  setJourneyHighlightedNodes(nodeIds);
                  const first = simNodes.find(n => nodeIds.includes(n.id));
                  if (first) setPan({ x: dimensions.width / 2 - first.x * zoom, y: dimensions.height / 2 - first.y * zoom });
                }}
              />
            )}
            {/* Insights / Ask answer */}
            {rightPanelMode === 'insights' && (
              askAnswer ? (
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
                  <pre className="whitespace-pre-wrap text-[12px] text-zinc-300 font-sans leading-relaxed">{askAnswer}</pre>
                </div>
              ) : (
                <IntelligenceInsights />
              )
            )}
            {/* Connect */}
            {rightPanelMode === 'participate' && <ParticipationGateway />}
            {/* Private: Feed */}
            {rightPanelMode === 'feed' && privateMode && <IntelligenceFeed />}
            {/* Private: Wiki */}
            {rightPanelMode === 'wiki' && privateMode && (
              <div>
                <div className="px-4 pt-3 pb-1">
                  <a href="/wiki/graph" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-colors text-xs font-medium">
                    <span className="text-purple-400">↗</span><span>Open Graph Visualizer</span>
                  </a>
                </div>
                <WikiPanel />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050508] text-white flex flex-col">
      <SEO
        title={selectedNode ? `${selectedNode.label} — Lakshveer's Universe` : "Lakshveer's Universe — 8 · Builder · 170+ projects"}
        description="An 8-year-old's knowledge graph. Hardware. AI. 170+ builds. 126 signals. Explore the mind of India's youngest hardware founder."
        ogImage="https://lakshveer.com/universe-og.png"
      />

      {/* ── HEADER ────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-4 sm:px-5 border-b bg-[#050508]/95 backdrop-blur-sm z-50"
        style={{borderColor:'rgba(255,255,255,0.07)', paddingTop: isMobile ? '10px' : '8px', paddingBottom: isMobile ? '10px' : '8px'}}
      >
        {/* Left: back + identity */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Back arrow — both mobile + desktop */}
          <a href="/" className="text-zinc-500 hover:text-white transition-colors flex-shrink-0 p-1 -ml-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          <div className={`rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex-shrink-0 flex items-center justify-center font-bold text-white ${isMobile ? 'w-9 h-9 text-sm' : 'w-7 h-7 text-xs'}`}>L</div>
          <div className="min-w-0">
            <div className={`font-bold text-white leading-tight ${isMobile ? 'text-base' : 'text-sm'}`}>Lakshveer</div>
            <div className={`text-zinc-500 leading-tight ${isMobile ? 'text-xs' : 'text-[10px]'}`}>
              {isMobile ? "8 yo · Builder · 170+ projects" : "8 · Hardware + AI"}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search — desktop only */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder="Search nodes…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-32 md:w-40 px-2.5 py-1 bg-white/5 border rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
              style={{borderColor: searchQuery ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.06)'}}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs">✕</button>
            )}
          </div>
          {/* Filter hamburger — mobile only */}
          {isMobile && (
            <button
              onClick={() => setLeftPanelOpen(p => !p)}
              className="p-2 rounded-lg text-zinc-500 hover:text-white transition-colors"
              aria-label="Filters"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          {/* Private mode dot */}
          <button
            onClick={togglePrivateMode}
            title={privateMode ? 'Exit private mode' : 'Enter private mode'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              privateMode
                ? 'bg-purple-500/10 border-purple-500/25 text-purple-300'
                : 'bg-transparent border-transparent text-zinc-600 hover:text-zinc-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${privateMode ? 'bg-purple-400' : 'bg-zinc-700 hover:bg-zinc-500'}`} />
            <span className="hidden sm:inline">{privateMode ? 'Private' : 'Public'}</span>
          </button>
        </div>
      </div>

      {/* ── MAIN LAYOUT ──────────────────────────── */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ── LEFT PANEL backdrop (mobile) ── */}
        {isMobile && leftPanelOpen && (
          <div className="fixed inset-0 bg-black/60 z-40" onClick={() => setLeftPanelOpen(false)} />
        )}

        {/* ── LEFT PANEL — graph controls ── */}
        <div
          className={`${
            isMobile
              ? `fixed inset-y-0 left-0 z-50 transition-transform duration-300 ${leftPanelOpen ? 'translate-x-0' : '-translate-x-full'} w-64`
              : `flex-shrink-0 transition-all duration-300 ${leftPanelOpen ? 'w-56' : 'w-0'}`
          } overflow-hidden border-r bg-[#050508]`}
          style={{borderColor:'rgba(255,255,255,0.06)', minWidth: 0}}
        >
          {/* Only render inner content when visible — prevents bleed-through */}
          {(isMobile || leftPanelOpen) && (
          <div className={`${isMobile ? 'w-64' : 'w-56'} h-full overflow-y-auto`}>
            {/* Panel header */}
            <div className="flex items-center justify-between px-3 pt-3 pb-2 border-b" style={{borderColor:'rgba(255,255,255,0.06)'}}>
              <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest">Explore</span>
              {isMobile && (
                <button onClick={() => setLeftPanelOpen(false)} className="p-1 rounded text-zinc-600 hover:text-white transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="p-3 space-y-5">
              {/* View mode */}
              <div>
                <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-1.5">View</p>
                <div className="space-y-0.5">
                  {([
                    { id: 'explore',  label: 'All nodes' },
                    { id: 'clusters', label: 'By cluster' },
                    { id: 'timeline', label: 'Timeline' },
                  ] as {id: ViewMode, label: string}[]).map(m => (
                    <button
                      key={m.id}
                      onClick={() => { setViewMode(m.id); if (m.id !== 'clusters') setActiveCluster(null); }}
                      className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-all ${
                        viewMode === m.id ? 'bg-white/8 text-white' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/4'
                      }`}
                    >
                      {viewMode === m.id && <span className="inline-block w-1 h-1 rounded-full bg-cyan-400 mr-2 mb-0.5" />}
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clusters */}
              <div>
                <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-1.5">Clusters</p>
                <div className="space-y-0.5">
                  {capabilityClusters.map(cluster => (
                    <button
                      key={cluster.id}
                      onClick={() => { setActiveCluster(activeCluster === cluster.id ? null : cluster.id); setViewMode('clusters'); }}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all ${
                        activeCluster === cluster.id ? 'bg-white/8' : 'hover:bg-white/4'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background: cluster.color}} />
                      <span className={`text-xs truncate ${activeCluster === cluster.id ? 'text-white' : 'text-zinc-400'}`}>{cluster.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Show types — 4 meaningful toggles */}
              <div>
                <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-1.5">Show</p>
                <div className="space-y-0.5">
                  {([
                    { types: ['project','product'] as NodeType[], label: 'Projects & Products', color: '#3b82f6' },
                    { types: ['skill','tool']       as NodeType[], label: 'Skills & Tools',      color: '#8b5cf6' },
                    { types: ['person','company']   as NodeType[], label: 'People & Orgs',       color: '#ec4899' },
                    { types: ['possibility']        as NodeType[], label: 'Future possibilities', color: 'rgba(167,139,250,0.8)' },
                  ]).map(group => {
                    const active = group.types.every(t => !activeFilters.has(t) || activeFilters.size === 0)
                      ? group.types.some(t => activeFilters.has(t)) ? 'partial' : 'all'
                      : 'none';
                    const isOff = group.types.every(t => activeFilters.has(t)) && activeFilters.size > 0 && !group.types.some(t => !activeFilters.has(t));
                    return (
                      <button
                        key={group.label}
                        onClick={() => {
                          setActiveFilters(prev => {
                            const next = new Set(prev);
                            // If all group types are in filters (excluded), remove them (include again)
                            // Otherwise add them all to filters (exclude)
                            const allExcluded = group.types.every(t => next.has(t));
                            if (allExcluded) {
                              group.types.forEach(t => next.delete(t));
                            } else {
                              // If possibility group, handle showPossibilities toggle
                              if (group.types.includes('possibility')) {
                                setShowPossibilities(p => !p);
                                return prev;
                              }
                              group.types.forEach(t => next.add(t));
                            }
                            return next;
                          });
                          if (group.types.includes('possibility')) {/* handled above */}
                        }}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all hover:bg-white/4"
                      >
                        <span
                          className="w-3 h-3 rounded-sm flex-shrink-0 border transition-colors"
                          style={
                            group.types.includes('possibility')
                              ? showPossibilities
                                ? { background: group.color, borderColor: group.color }
                                : { background: 'transparent', borderColor: 'rgba(255,255,255,0.2)' }
                              : !group.types.every(t => activeFilters.has(t))
                                ? { background: group.color, borderColor: group.color }
                                : { background: 'transparent', borderColor: 'rgba(255,255,255,0.2)' }
                          }
                        />
                        <span className="text-xs text-zinc-400">{group.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Private tools */}
              {privateMode && (
                <div className="border-t pt-4" style={{borderColor:'rgba(255,255,255,0.06)'}}>
                  <p className="text-[10px] font-medium text-zinc-600 uppercase tracking-widest mb-1.5">Intelligence</p>
                  <div className="space-y-0.5">
                    {[
                      { label: 'Verification Queue', onClick: () => setShowVerificationDashboard(true), color: 'text-amber-400 hover:bg-amber-500/8' },
                      { label: 'Gaps & Opportunities', onClick: () => setShowGapsPanel(true), color: 'text-emerald-400 hover:bg-emerald-500/8' },
                      { label: 'Weekly OS', onClick: () => setShowWeeklyOS(true), color: 'text-purple-400 hover:bg-purple-500/8' },
                      { label: 'Surfaces', onClick: () => { setRightPanelMode('feed'); setRightPanelOpen(true); }, color: 'text-zinc-400 hover:bg-white/5' },
                      { label: 'Health Monitor', onClick: () => setShowWeeklyOS(true), color: 'text-zinc-400 hover:bg-white/5' },
                    ].map(item => (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-all ${item.color}`}
                      >{item.label}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          )} {/* end conditional render guard */}
        </div>

        {/* ── LEFT PANEL TOGGLE (desktop) — sits at left edge of canvas ── */}
        {!isMobile && (
          <button
            onClick={() => setLeftPanelOpen(p => !p)}
            className="absolute top-1/2 -translate-y-1/2 z-40 w-5 h-10 flex items-center justify-center bg-[#0d0d18] border rounded-r-lg text-zinc-500 hover:text-white hover:bg-[#14142a] transition-all"
            style={{ left: leftPanelOpen ? '224px' : '0', borderColor:'rgba(255,255,255,0.09)', borderLeft: 'none' }}
          >
            <svg className={`w-3 h-3 transition-transform ${leftPanelOpen ? '' : 'rotate-180'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* ── CANVAS ── */}
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
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
            className="block"
          />

          {/* ── MOBILE: Hint strip ── */}
          {isMobile && hintVisible && (
            <div
              className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full text-[11px] text-zinc-400 pointer-events-none"
              style={{background: 'rgba(8,8,18,0.90)', border: '1px solid rgba(255,255,255,0.09)', whiteSpace: 'nowrap'}}
            >
              Tap any node to explore · pinch to zoom
            </div>
          )}

          {/* ── MOBILE: Node legend bottom-left ── */}
          {isMobile && !mobileTapCard && (
            <div
              className="absolute bottom-3 left-3 z-10 flex flex-col gap-1 px-2.5 py-2 rounded-xl"
              style={{background: 'rgba(5,5,10,0.80)', border: '1px solid rgba(255,255,255,0.06)'}}
            >
              {[
                { color: '#3b82f6', label: 'Projects' },
                { color: '#8b5cf6', label: 'Skills' },
                { color: '#f59e0b', label: 'Tools' },
                { color: '#ec4899', label: 'People' },
              ].map(({color, label}) => (
                <div key={label} className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background: color}} />
                  <span className="text-[10px] text-zinc-500">{label}</span>
                </div>
              ))}
            </div>
          )}

          {/* ── MOBILE: Onboarding overlay (first visit only) ── */}
          {isMobile && showOnboarding && (
            <div
              className="absolute inset-0 z-30 flex flex-col"
              style={{background: 'rgba(3,3,8,0.93)', backdropFilter: 'blur(2px)'}}
              onClick={() => { setShowOnboarding(false); localStorage.setItem('lk_universe_seen', '1'); }}
            >
              {/* Subtle graph still visible underneath */}
              <div className="flex-1 flex flex-col items-center justify-center px-7 text-center gap-0">
                {/* Identity */}
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-2xl font-bold text-white mb-5 shadow-lg shadow-cyan-500/20">L</div>
                <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Lakshveer's Universe</h1>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  8 years old. 170+ builds. 4 years of creating hardware, AI tools, and products from scratch.
                </p>

                {/* 3 facts */}
                <div className="flex gap-4 mb-8">
                  {[
                    { num: '170+', label: 'Projects' },
                    { num: '4 yrs', label: 'Building' },
                    { num: '126', label: 'Signals' },
                  ].map(f => (
                    <div key={f.label} className="flex flex-col items-center">
                      <span className="text-xl font-bold text-white">{f.num}</span>
                      <span className="text-[11px] text-zinc-500 mt-0.5">{f.label}</span>
                    </div>
                  ))}
                </div>

                {/* How to use */}
                <div className="w-full rounded-xl border p-4 mb-7 text-left" style={{background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)'}}>
                  <p className="text-[11px] text-zinc-600 uppercase tracking-widest font-medium mb-3">How to navigate</p>
                  {[
                    { icon: '👆', text: 'Tap a node to see what it is' },
                    { icon: '🤏', text: 'Pinch to zoom · drag to pan' },
                    { icon: '✦', text: 'Ask anything about Lakshveer below' },
                    { icon: '📖', text: 'Tap "His Story" to read the journey' },
                  ].map(h => (
                    <div key={h.icon} className="flex items-center gap-2.5 mb-2 last:mb-0">
                      <span className="text-sm">{h.icon}</span>
                      <span className="text-xs text-zinc-400">{h.text}</span>
                    </div>
                  ))}
                </div>

                {/* CTAs */}
                <button
                  onClick={e => { e.stopPropagation(); setShowOnboarding(false); localStorage.setItem('lk_universe_seen', '1'); }}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold text-[#050508] transition-all active:scale-95 mb-3"
                  style={{background: 'linear-gradient(135deg, #22d3ee, #a855f7)'}}
                >
                  Explore the Universe
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setShowOnboarding(false); localStorage.setItem('lk_universe_seen', '1'); setRightPanelMode('journey'); setRightPanelOpen(true); }}
                  className="w-full py-3 rounded-xl text-sm font-medium text-cyan-400 border transition-all"
                  style={{borderColor: 'rgba(34,211,238,0.25)', background: 'rgba(34,211,238,0.06)'}}
                >
                  Read his story first →
                </button>
              </div>
            </div>
          )}

          {/* ── DESKTOP ONLY: view mode pill bottom-left ── */}
          {!isMobile && (
            <div
              className="absolute left-3 z-20 flex items-center gap-0.5 bg-zinc-900/90 border rounded-lg p-0.5 backdrop-blur-sm"
              style={{ bottom: '80px', borderColor:'rgba(255,255,255,0.06)' }}
            >
              {([
                { id: 'explore',  label: 'All' },
                { id: 'clusters', label: 'Clusters' },
                { id: 'timeline', label: 'Timeline' },
              ] as {id: ViewMode, label: string}[]).map(m => (
                <button
                  key={m.id}
                  onClick={() => { setViewMode(m.id); if (m.id !== 'clusters') setActiveCluster(null); }}
                  className={`px-2 py-1 text-[10px] font-medium rounded-md transition-all ${
                    viewMode === m.id ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >{m.label}</button>
              ))}
            </div>
          )}

          {/* Timeline slider — desktop */}
          {viewMode === 'timeline' && !isMobile && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-80 bg-zinc-900/90 border rounded-xl px-4 py-3 backdrop-blur-sm" style={{borderColor:'rgba(255,255,255,0.06)'}}>
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-zinc-500 w-10">Jul 22</span>
                <input
                  type="range" min={0} max={timelineDates.length - 1}
                  value={timelineDates.indexOf(timelineDate)}
                  onChange={e => setTimelineDate(timelineDates[parseInt(e.target.value)])}
                  className="flex-1 accent-cyan-500"
                />
                <span className="text-[10px] text-zinc-500 w-10 text-right">Feb 26</span>
                <span className="text-xs font-mono text-cyan-400 w-14 text-right">{timelineDate}</span>
              </div>
            </div>
          )}

          {/* Stats badge — desktop top-left */}
          <div className="absolute top-3 left-3 hidden md:flex items-center gap-1.5 px-2 py-1 bg-zinc-900/70 border rounded-lg text-[10px] text-zinc-600" style={{borderColor:'rgba(255,255,255,0.05)'}}>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/60" />
            <span>{filteredNodes.length} nodes · {filteredEdges.length} edges</span>
          </div>

          {/* Share button — desktop top-right */}
          <button
            onClick={copyShareLink}
            className="absolute top-3 right-3 px-2 py-1 bg-zinc-900/70 border rounded-lg text-[10px] text-zinc-500 hover:text-white transition-colors hidden md:block"
            style={{borderColor:'rgba(255,255,255,0.05)'}}
          >
            {linkCopied ? '✓ copied' : 'share ↗'}
          </button>

          {/* Hover card — desktop only */}
          {hoveredNode && !selectedNode && !isMobile && (() => {
            const card = getNodeCard(hoveredNode);
            const screenX = hoveredNode.x * zoom + pan.x + (dimensions.width / 2) * (1 - zoom);
            const screenY = hoveredNode.y * zoom + pan.y + (dimensions.height / 2) * (1 - zoom);
            return (
              <div
                className="absolute pointer-events-none z-20 w-52"
                style={{
                  left: Math.min(screenX + 14, dimensions.width - 220),
                  top: Math.max(Math.min(screenY - 10, dimensions.height - 150), 10),
                }}
              >
                <div className="bg-zinc-900/96 border rounded-xl p-3 shadow-2xl backdrop-blur-sm" style={{borderColor: card.color + '35'}}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{background: card.color}} />
                    <span className="text-sm font-semibold text-white truncate leading-none">{card.label}</span>
                  </div>
                  {card.desc && <p className="text-[11px] text-zinc-400 leading-snug mb-1">{card.desc}</p>}
                  {card.stat && <p className="text-[10px] text-cyan-400 leading-snug font-medium">{card.stat}</p>}
                  <p className="text-[9px] text-zinc-700 mt-1.5 capitalize">{card.type} · tap to explore</p>
                </div>
              </div>
            );
          })()}

          {/* ── DESKTOP: Ask box floating bottom-center ── */}
          {!isMobile && (
            <div className="absolute left-1/2 -translate-x-1/2 z-30 w-full max-w-md px-4" style={{ bottom: '24px' }}>
              <div className={`flex items-center gap-2 bg-zinc-900/96 border rounded-2xl px-3.5 py-2.5 shadow-2xl backdrop-blur-sm transition-all ${
                askFocused ? 'border-cyan-500/40' : 'border-white/8'
              }`}>
                <span className="text-zinc-600 text-sm flex-shrink-0 select-none">✦</span>
                <input
                  ref={askInputRef}
                  type="text"
                  value={askQuery}
                  onChange={e => setAskQuery(e.target.value)}
                  onFocus={() => setAskFocused(true)}
                  onBlur={() => setAskFocused(false)}
                  onKeyDown={e => { if (e.key === 'Enter' && askQuery.trim()) { handleAsk(askQuery); setRightPanelOpen(true); } }}
                  placeholder="Ask anything about Lakshveer…"
                  className="flex-1 bg-transparent text-sm text-white placeholder-zinc-700 focus:outline-none min-w-0"
                />
                {askLoading
                  ? <div className="w-4 h-4 border border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin flex-shrink-0" />
                  : <button onClick={() => { if (askQuery.trim()) { handleAsk(askQuery); setRightPanelOpen(true); } }} className="text-xs text-zinc-600 hover:text-cyan-400 transition-colors flex-shrink-0 font-medium">ask →</button>
                }
              </div>
              {askHighlightedNodes.size > 0 && (
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="text-[10px] text-cyan-500">{askHighlightedNodes.size} nodes highlighted</span>
                  <button onClick={() => { setAskHighlightedNodes(new Set()); setAskAnswer(null); setAskQuery(''); }} className="text-[10px] text-zinc-700 hover:text-white ml-1">clear</button>
                </div>
              )}
            </div>
          )}

          {/* ── DESKTOP: Zoom controls bottom-right ── */}
          {!isMobile && (
            <div className="absolute bottom-6 right-3 flex flex-col gap-1">
              <button onClick={() => setZoom(z => Math.min(3, z * 1.2))} className="w-7 h-7 rounded-lg bg-zinc-900/90 border text-white text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center" style={{borderColor:'rgba(255,255,255,0.06)'}}>+</button>
              <button onClick={() => setZoom(z => Math.max(0.2, z * 0.8))} className="w-7 h-7 rounded-lg bg-zinc-900/90 border text-white text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center" style={{borderColor:'rgba(255,255,255,0.06)'}}>−</button>
              <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="w-7 h-7 rounded-lg bg-zinc-900/90 border text-zinc-500 text-xs hover:bg-zinc-800 hover:text-white transition-colors flex items-center justify-center" style={{borderColor:'rgba(255,255,255,0.06)'}}>⌂</button>
            </div>
          )}

        </div>

        {/* ── RIGHT PANEL TOGGLE (desktop) ── */}
        {!isMobile && (
          <button
            onClick={() => setRightPanelOpen(p => !p)}
            className="absolute top-1/2 -translate-y-1/2 z-40 w-4 h-9 hidden md:flex items-center justify-center bg-[#0a0a10] border rounded-l-md text-zinc-600 hover:text-white transition-all"
            style={{ right: rightPanelOpen ? '380px' : '0', borderColor:'rgba(255,255,255,0.06)' }}
          >
            <svg className={`w-2.5 h-2.5 transition-transform ${rightPanelOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* ── RIGHT PANEL — desktop side panel ── */}
        {!isMobile && (
          <div
            className="flex-shrink-0 transition-all duration-300 overflow-hidden border-l bg-[#050508]"
            style={{ width: rightPanelOpen ? '380px' : '0', borderColor:'rgba(255,255,255,0.06)' }}
          >
            <div className="w-[380px] h-full">
              {panelContent}
            </div>
          </div>
        )}

        {/* ── RIGHT PANEL — mobile bottom sheet ── */}
        {isMobile && (
          <>
            {rightPanelOpen && (
              <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setRightPanelOpen(false)} />
            )}
            <div
              className={`fixed bottom-0 left-0 right-0 z-50 bg-[#0a0a10] border-t rounded-t-2xl flex flex-col transition-transform duration-300 ${
                rightPanelOpen ? 'translate-y-0' : 'translate-y-full'
              }`}
              style={{ height: '78vh', borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <div className="flex justify-center pt-2.5 pb-1.5 flex-shrink-0">
                <div className="w-8 h-1 rounded-full bg-zinc-700" />
              </div>
              <button
                onClick={() => setRightPanelOpen(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-zinc-600 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex-1 overflow-hidden">
                {panelContent}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── MOBILE BOTTOM TOOLBAR ── */}
      {isMobile && (
        <div className="flex-shrink-0 flex flex-col bg-[#070710] border-t" style={{borderColor:'rgba(255,255,255,0.08)', paddingBottom:'env(safe-area-inset-bottom,0px)'}}>

          {/* Mobile tap-card — shows when a node is tapped */}
          {mobileTapCard && (() => {
            const card = getNodeCard(mobileTapCard);
            return (
              <div className="mx-3 mt-2.5 mb-1 rounded-xl border bg-zinc-900/98 p-3.5 flex items-start gap-3" style={{borderColor: card.color + '40'}}>
                <span className="w-3 h-3 rounded-full flex-shrink-0 mt-0.5" style={{background: card.color}} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm leading-tight">{card.label}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wide" style={{background: card.color + '22', color: card.color}}>{card.type}</span>
                  </div>
                  {card.desc && <p className="text-zinc-400 text-xs mt-0.5 leading-snug line-clamp-2">{card.desc}</p>}
                  {card.stat && <p className="text-xs mt-1 font-medium" style={{color: card.color}}>{card.stat}</p>}
                </div>
                <div className="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    onClick={() => { setRightPanelOpen(true); setMobileTapCard(null); }}
                    className="text-[10px] font-medium px-2.5 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    style={{background: card.color + '20', color: card.color}}
                  >More →</button>
                  <button onClick={() => { setMobileTapCard(null); setSelectedNode(null); }} className="text-[10px] text-zinc-600 hover:text-white text-center">dismiss</button>
                </div>
              </div>
            );
          })()}

          {/* Ask row */}
          <div className="px-3 pt-2 pb-1.5">
            <div className={`flex items-center gap-2 bg-zinc-900/90 border rounded-xl px-3 py-2.5 transition-all ${askFocused ? 'border-cyan-500/40' : 'border-white/8'}`}>
              <span className="text-zinc-600 text-xs flex-shrink-0">✦</span>
              <input
                ref={askInputRef}
                type="text"
                value={askQuery}
                onChange={e => setAskQuery(e.target.value)}
                onFocus={() => setAskFocused(true)}
                onBlur={() => setAskFocused(false)}
                onKeyDown={e => { if (e.key === 'Enter' && askQuery.trim()) { handleAsk(askQuery); setRightPanelOpen(true); } }}
                placeholder="Ask anything about Lakshveer…"
                className="flex-1 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none min-w-0"
              />
              {askLoading
                ? <div className="w-3.5 h-3.5 border border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin flex-shrink-0" />
                : <button onClick={() => { if (askQuery.trim()) { handleAsk(askQuery); setRightPanelOpen(true); } }} className="text-xs font-medium text-cyan-500 hover:text-cyan-300 transition-colors flex-shrink-0">Ask →</button>
              }
            </div>
            {askHighlightedNodes.size > 0 && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-[10px] text-cyan-500">{askHighlightedNodes.size} nodes highlighted</span>
                <button onClick={() => { setAskHighlightedNodes(new Set()); setAskAnswer(null); setAskQuery(''); }} className="text-[10px] text-zinc-700 hover:text-white ml-1">clear</button>
              </div>
            )}
          </div>

          {/* Action row */}
          <div className="flex items-center gap-2 px-3 pb-3">
            {/* View modes */}
            <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 flex-shrink-0">
              {([
                { id: 'explore' as ViewMode,  label: 'All' },
                { id: 'clusters' as ViewMode, label: 'Clusters' },
                { id: 'timeline' as ViewMode, label: 'Timeline' },
              ]).map(m => (
                <button
                  key={m.id}
                  onClick={() => { setViewMode(m.id); if (m.id !== 'clusters') setActiveCluster(null); }}
                  className={`px-2.5 py-1.5 text-[10px] font-medium rounded-md transition-all ${viewMode === m.id ? 'bg-white/12 text-white' : 'text-zinc-500'}`}
                >{m.label}</button>
              ))}
            </div>
            {/* Fit */}
            <button
              onClick={() => { setSimNodes(cur => { fitToScreen(cur); return cur; }); }}
              className="w-8 h-8 rounded-lg bg-white/5 text-zinc-500 text-xs flex items-center justify-center active:bg-white/10 flex-shrink-0"
              title="Fit to screen"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            {/* Story button — primary CTA */}
            <button
              onClick={() => { setRightPanelMode('journey'); setRightPanelOpen(true); setMobileTapCard(null); }}
              className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all"
              style={{background: 'linear-gradient(135deg, rgba(34,211,238,0.18), rgba(168,85,247,0.14))', border: '1px solid rgba(34,211,238,0.25)', color: '#67e8f9'}}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
              His Story
            </button>
          </div>

          {/* Timeline slider when active */}
          {viewMode === 'timeline' && (
            <div className="flex items-center gap-2 px-3 pb-3">
              <span className="text-[10px] text-zinc-600 w-8 flex-shrink-0">Jul 22</span>
              <input type="range" min={0} max={timelineDates.length - 1} value={timelineDates.indexOf(timelineDate)} onChange={e => setTimelineDate(timelineDates[parseInt(e.target.value)])} className="flex-1 accent-cyan-500" />
              <span className="text-[10px] font-mono text-cyan-400 w-14 text-right flex-shrink-0">{timelineDate}</span>
            </div>
          )}
        </div>
      )}

      {/* ── QUOTE STRIP — desktop only ── */}
      <div className="hidden md:block flex-shrink-0 border-t px-4 py-1.5 bg-[#050508]/98 overflow-hidden" style={{borderColor:'rgba(255,255,255,0.04)'}}>
        <p className="text-[10px] text-zinc-600 italic truncate text-center">
          "{QUOTES[quoteIndex].text}" <span className="text-zinc-700 not-italic">— {QUOTES[quoteIndex].author}</span>
        </p>
      </div>

      {/* ── MODALS ── */}
      {showVerificationDashboard && privateMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowVerificationDashboard(false)} />
          <div className="relative w-full max-w-4xl h-[80vh] bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden">
            <VerificationDashboard onClose={() => setShowVerificationDashboard(false)} />
          </div>
        </div>
      )}
      {showGapsPanel && privateMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGapsPanel(false)} />
          <div className="relative w-full max-w-2xl h-[80vh] bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden">
            <GapsOpportunitiesPanel onClose={() => setShowGapsPanel(false)} />
          </div>
        </div>
      )}
      {showWeeklyOS && privateMode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowWeeklyOS(false)} />
          <div className="relative w-full max-w-2xl h-[80vh] bg-[#0a0a0f] border border-white/10 rounded-xl overflow-hidden">
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
