// ============================================
// WIKI GRAPH — /wiki/graph
// Force-directed visualization of Lakshveer's knowledge graph.
// Nodes = wiki entities. Edges = relationships with confidence.
// ============================================

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { SEO } from '../components/seo';

// ── Types ────────────────────────────────────

interface GraphNode {
  id: string;
  label: string;
  type: string;
  wikiPath?: string;
  degree?: number;
  community?: number;
  signalIds: string[];
  // sim state
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
}

interface GraphEdge {
  source: string;
  target: string;
  relation: string;
  confidence: 'EXTRACTED' | 'INFERRED' | 'AMBIGUOUS';
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  communities?: Array<{ id: number; nodeIds: string[]; size: number }>;
  meta: {
    compiledAt: string;
    totalSignals: number;
    godNodes: string[];
    communities: number;
  };
}

// ── Colors ───────────────────────────────────

const NODE_COLORS: Record<string, string> = {
  person:      '#ec4899',
  org:         '#f97316',
  project:     '#10b981',
  domain:      '#8b5cf6',
  concept:     '#64748b',
  achievement: '#fbbf24',
  media:       '#ef4444',
  default:     '#6366f1',
};

const EDGE_COLORS: Record<string, string> = {
  EXTRACTED:  'rgba(34,211,238,0.35)',
  INFERRED:   'rgba(139,92,246,0.25)',
  AMBIGUOUS:  'rgba(100,116,139,0.15)',
};

const CONFIDENCE_LABELS: Record<string, string> = {
  EXTRACTED:  'Stated in source',
  INFERRED:   'Deduced from co-occurrence',
  AMBIGUOUS:  'Uncertain',
};

function nodeColor(type: string): string {
  return NODE_COLORS[type] ?? NODE_COLORS.default;
}

function nodeRadius(node: GraphNode): number {
  const base = node.id === 'lakshveer' ? 18 : 8;
  const degBoost = Math.min((node.degree ?? 0) / 5, 6);
  return base + degBoost;
}

// ── Force simulation (pure JS, no d3) ────────

const REPULSION = 4500;
const LINK_DIST = 90;
const LINK_STRENGTH = 0.12;
const GRAVITY = 0.04;
const DAMPING = 0.85;
const ITERATIONS = 1;

function tickSimulation(nodes: GraphNode[], edges: GraphEdge[], width: number, height: number) {
  const nodeMap = new Map(nodes.map(n => [n.id, n]));

  for (let iter = 0; iter < ITERATIONS; iter++) {
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x || 0.01;
        const dy = b.y - a.y || 0.01;
        const dist2 = dx * dx + dy * dy;
        const dist = Math.sqrt(dist2);
        const force = REPULSION / dist2;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (!a.fx) a.vx -= fx; if (!a.fy) a.vy -= fy;
        if (!b.fx) b.vx += fx; if (!b.fy) b.vy += fy;
      }
    }

    // Link attraction
    for (const e of edges) {
      const a = nodeMap.get(e.source), b = nodeMap.get(e.target);
      if (!a || !b) continue;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const diff = (dist - LINK_DIST) * LINK_STRENGTH;
      const fx = (dx / dist) * diff;
      const fy = (dy / dist) * diff;
      if (!a.fx) { a.vx += fx; a.vy += fy; }
      if (!b.fx) { b.vx -= fx; b.vy -= fy; }
    }

    // Gravity to center
    for (const n of nodes) {
      if (n.fx != null) { n.x = n.fx; continue; }
      if (n.fy != null) { n.y = n.fy; continue; }
      n.vx += (width / 2 - n.x) * GRAVITY;
      n.vy += (height / 2 - n.y) * GRAVITY;
      n.vx *= DAMPING;
      n.vy *= DAMPING;
      n.x += n.vx;
      n.y += n.vy;
      // bounds
      n.x = Math.max(20, Math.min(width - 20, n.x));
      n.y = Math.max(20, Math.min(height - 20, n.y));
    }
  }
}

// ── Component ────────────────────────────────

export default function WikiGraphPage() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [confidenceFilter, setConfidenceFilter] = useState<string | null>(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [wikiContent, setWikiContent] = useState<string | null>(null);
  const [wikiLoading, setWikiLoading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const nodesRef = useRef<GraphNode[]>([]);
  const edgesRef = useRef<GraphEdge[]>([]);
  const transformRef = useRef(transform);
  const containerRef = useRef<HTMLDivElement>(null);

  transformRef.current = transform;

  // ── Fetch graph ──
  useEffect(() => {
    fetch('/api/wiki/graph')
      .then(r => r.json())
      .then((data: GraphData) => {
        const w = containerRef.current?.clientWidth ?? 900;
        const h = containerRef.current?.clientHeight ?? 600;
        const initialized: GraphNode[] = data.nodes.map(n => ({
          ...n,
          x: w / 2 + (Math.random() - 0.5) * 400,
          y: h / 2 + (Math.random() - 0.5) * 400,
          vx: 0, vy: 0,
        }));
        // Pin lakshveer to center
        const laksh = initialized.find(n => n.id === 'lakshveer');
        if (laksh) { laksh.fx = w / 2; laksh.fy = h / 2; }

        setGraphData(data);
        setNodes(initialized);
        nodesRef.current = initialized;
        edgesRef.current = data.edges;
        setLoading(false);
      })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  // ── Simulation loop ──
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    let running = true;
    let tickCount = 0;

    function draw() {
      if (!running) return;
      const W = canvas.width;
      const H = canvas.height;
      const t = transformRef.current;
      const currentNodes = nodesRef.current;
      const currentEdges = edgesRef.current;

      // Simulate (cool down after 300 ticks)
      if (tickCount < 300) {
        tickSimulation(currentNodes, currentEdges, W / t.scale, H / t.scale);
        tickCount++;
      }

      // Clear
      ctx.clearRect(0, 0, W, H);

      // Transform
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);

      const nodeMap = new Map(currentNodes.map(n => [n.id, n]));

      // Draw edges
      for (const edge of currentEdges) {
        const a = nodeMap.get(edge.source);
        const b = nodeMap.get(edge.target);
        if (!a || !b) continue;

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = EDGE_COLORS[edge.confidence] ?? EDGE_COLORS.AMBIGUOUS;
        ctx.lineWidth = edge.confidence === 'EXTRACTED' ? 1.2 : 0.7;
        ctx.stroke();
      }

      // Draw nodes
      for (const node of currentNodes) {
        const r = nodeRadius(node);
        const color = nodeColor(node.type);
        const isSelected = selectedNode?.id === node.id;
        const isHovered = hoveredNode === node.id;
        const isHighlighted = !searchQuery || node.label.toLowerCase().includes(searchQuery.toLowerCase());

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);

        if (isSelected) {
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 16;
        } else if (isHovered) {
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 8;
        } else {
          ctx.fillStyle = isHighlighted ? color : color + '40';
          ctx.shadowBlur = 0;
        }

        ctx.fill();

        // Ring for selected
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        ctx.shadowBlur = 0;

        // Label for large nodes or hovered/selected
        if (r > 10 || isHovered || isSelected || node.id === 'lakshveer') {
          ctx.fillStyle = isHighlighted ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)';
          ctx.font = `${node.id === 'lakshveer' ? 'bold ' : ''}${Math.max(9, r * 0.8)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText(node.label, node.x, node.y + r + 12);
        }
      }

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);
    return () => {
      running = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [nodes.length, selectedNode, hoveredNode, searchQuery]);

  // ── Resize canvas ──
  useEffect(() => {
    function resize() {
      if (!canvasRef.current || !containerRef.current) return;
      canvasRef.current.width = containerRef.current.clientWidth;
      canvasRef.current.height = containerRef.current.clientHeight;
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // ── Hit test ──
  const getNodeAt = useCallback((clientX: number, clientY: number): GraphNode | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const t = transformRef.current;
    const mx = (clientX - rect.left - t.x) / t.scale;
    const my = (clientY - rect.top - t.y) / t.scale;
    for (const n of nodesRef.current) {
      const r = nodeRadius(n) + 4;
      if ((n.x - mx) ** 2 + (n.y - my) ** 2 < r * r) return n;
    }
    return null;
  }, []);

  // ── Mouse events ──
  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragNode) {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const t = transformRef.current;
      const mx = (e.clientX - rect.left - t.x) / t.scale;
      const my = (e.clientY - rect.top - t.y) / t.scale;
      const node = nodesRef.current.find(n => n.id === dragNode);
      if (node) { node.fx = mx; node.fy = my; node.x = mx; node.y = my; }
      return;
    }
    if (isPanning) {
      setTransform(prev => ({
        ...prev,
        x: prev.x + e.clientX - panStart.x,
        y: prev.y + e.clientY - panStart.y,
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
      return;
    }
    const hit = getNodeAt(e.clientX, e.clientY);
    setHoveredNode(hit?.id ?? null);
  }, [dragNode, isPanning, panStart, getNodeAt]);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    const hit = getNodeAt(e.clientX, e.clientY);
    if (hit) {
      setDragNode(hit.id);
      e.preventDefault();
    } else {
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [getNodeAt]);

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    if (dragNode) {
      // Release — un-pin node so it flows freely
      const node = nodesRef.current.find(n => n.id === dragNode);
      if (node && node.id !== 'lakshveer') { node.fx = null; node.fy = null; }
      setDragNode(null);
    }
    setIsPanning(false);
  }, [dragNode]);

  const onClick = useCallback(async (e: React.MouseEvent) => {
    if (isPanning) return;
    const hit = getNodeAt(e.clientX, e.clientY);
    if (!hit) { setSelectedNode(null); setWikiContent(null); return; }
    setSelectedNode(hit);
    if (hit.wikiPath) {
      setWikiLoading(true);
      setWikiContent(null);
      try {
        const res = await fetch(`/api/wiki/node/${hit.id}`);
        const data = await res.json();
        setWikiContent(data.article ?? null);
      } catch {
        setWikiContent(null);
      } finally {
        setWikiLoading(false);
      }
    }
  }, [getNodeAt, isPanning]);

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    setTransform(prev => {
      const newScale = Math.max(0.2, Math.min(4, prev.scale * factor));
      return { ...prev, scale: newScale };
    });
  }, []);

  // ── Filtered nodes for sidebar ──
  const uniqueTypes = useMemo(() =>
    [...new Set((graphData?.nodes ?? []).map(n => n.type))].sort(),
    [graphData]
  );

  const filteredNodeList = useMemo(() => {
    if (!graphData) return [];
    return graphData.nodes
      .filter(n => {
        if (typeFilter && n.type !== typeFilter) return false;
        if (searchQuery && !n.label.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
      })
      .sort((a, b) => (b.degree ?? 0) - (a.degree ?? 0))
      .slice(0, 50);
  }, [graphData, typeFilter, searchQuery]);

  // ── Neighbors of selected ──
  const selectedNeighbors = useMemo(() => {
    if (!selectedNode || !graphData) return [];
    return graphData.edges
      .filter(e => e.source === selectedNode.id || e.target === selectedNode.id)
      .map(e => ({
        id: e.source === selectedNode.id ? e.target : e.source,
        relation: e.relation,
        confidence: e.confidence,
      }))
      .map(n => ({
        ...n,
        label: graphData.nodes.find(gn => gn.id === n.id)?.label ?? n.id,
        type: graphData.nodes.find(gn => gn.id === n.id)?.type ?? 'unknown',
      }));
  }, [selectedNode, graphData]);

  // ── Focus node ──
  const focusNode = useCallback((nodeId: string) => {
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (!node) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const t = transformRef.current;
    const newX = canvas.width / 2 - node.x * t.scale;
    const newY = canvas.height / 2 - node.y * t.scale;
    setTransform(prev => ({ ...prev, x: newX, y: newY }));
  }, []);

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col">
      <SEO
        title="Knowledge Graph — Lakshveer Rao"
        description="Interactive visualization of Lakshveer's knowledge network — projects, people, organizations, and concepts."
      />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#050508]/90 backdrop-blur z-10">
        <div className="flex items-center gap-4">
          <a href="/universe" className="text-zinc-500 hover:text-white text-sm transition-colors">← Universe</a>
          <div>
            <h1 className="text-sm font-semibold text-white">Knowledge Graph</h1>
            {graphData && (
              <p className="text-[10px] text-zinc-500">
                {graphData.nodes.length} nodes · {graphData.edges.length} edges · compiled {new Date(graphData.meta.compiledAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="hidden md:flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] text-zinc-500">
            <span>Edges:</span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-px bg-cyan-400/60 inline-block" /> EXTRACTED
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-px bg-purple-400/50 inline-block" /> INFERRED
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-px bg-zinc-500/40 inline-block" /> AMBIGUOUS
            </span>
          </div>
          <div className="flex items-center gap-1 flex-wrap max-w-xs">
            {Object.entries(NODE_COLORS).filter(([k]) => k !== 'default').map(([type, color]) => (
              <span key={type} className="flex items-center gap-0.5 text-[10px] text-zinc-400">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: color }} />
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100vh - 53px)' }}>

        {/* Left sidebar */}
        <div className="w-60 flex-shrink-0 border-r border-white/10 bg-[#050508]/80 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-white/5">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search nodes..."
              className="w-full px-2.5 py-1.5 bg-zinc-900/80 border border-zinc-700/50 rounded-lg text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
            />
          </div>

          {/* Type filter */}
          <div className="p-2 border-b border-white/5 flex flex-wrap gap-1">
            <button
              onClick={() => setTypeFilter(null)}
              className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                !typeFilter ? 'text-white bg-white/10 border-white/20' : 'text-zinc-600 border-zinc-700/30 hover:border-zinc-600'
              }`}
            >
              all
            </button>
            {uniqueTypes.map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(typeFilter === type ? null : type)}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-all`}
                style={typeFilter === type ? {
                  color: nodeColor(type),
                  background: nodeColor(type) + '20',
                  borderColor: nodeColor(type) + '40',
                } : { color: '#52525b', borderColor: 'rgba(63,63,70,0.3)' }}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Node list */}
          <div className="flex-1 overflow-y-auto py-1">
            {filteredNodeList.map(node => (
              <button
                key={node.id}
                onClick={() => {
                  setSelectedNode(node as GraphNode);
                  focusNode(node.id);
                }}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-white/5 transition-colors ${
                  selectedNode?.id === node.id ? 'bg-white/5' : ''
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: nodeColor(node.type) }}
                />
                <span className="text-xs text-zinc-300 truncate flex-1">{node.label}</span>
                <span className="text-[10px] text-zinc-600">{node.degree}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Canvas */}
        <div
          ref={containerRef}
          className="flex-1 relative overflow-hidden bg-[#020204]"
          style={{ cursor: dragNode ? 'grabbing' : hoveredNode ? 'pointer' : isPanning ? 'grabbing' : 'grab' }}
        >
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                <p className="text-sm text-zinc-500">Loading graph...</p>
              </div>
            </div>
          )}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-red-400">Failed to load graph: {error}</p>
            </div>
          )}
          <canvas
            ref={canvasRef}
            onMouseMove={onMouseMove}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onClick={onClick}
            onWheel={onWheel}
            className="block w-full h-full"
          />

          {/* Zoom controls */}
          <div className="absolute bottom-4 right-4 flex flex-col gap-1">
            <button
              onClick={() => setTransform(p => ({ ...p, scale: Math.min(4, p.scale * 1.2) }))}
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm hover:bg-zinc-800 transition-colors"
            >+</button>
            <button
              onClick={() => setTransform(p => ({ ...p, scale: Math.max(0.2, p.scale * 0.8) }))}
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-sm hover:bg-zinc-800 transition-colors"
            >−</button>
            <button
              onClick={() => setTransform({ x: 0, y: 0, scale: 1 })}
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 text-xs hover:bg-zinc-800 transition-colors"
            >⌂</button>
          </div>

          {/* Stats overlay */}
          {graphData && (
            <div className="absolute top-3 left-3 flex gap-2">
              {graphData.meta.godNodes.slice(0, 4).map(id => {
                const n = graphData.nodes.find(n => n.id === id);
                return n ? (
                  <button
                    key={id}
                    onClick={() => { setSelectedNode(nodes.find(nn => nn.id === id) ?? null); focusNode(id); }}
                    className="text-[10px] px-2 py-1 rounded-full bg-zinc-900/80 border border-zinc-700/50 text-zinc-400 hover:text-white hover:border-zinc-500 transition-all"
                  >
                    ⬡ {n.label}
                  </button>
                ) : null;
              })}
            </div>
          )}
        </div>

        {/* Right panel — node detail */}
        {selectedNode && (
          <div className="w-72 flex-shrink-0 border-l border-white/10 bg-[#050508]/90 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ background: nodeColor(selectedNode.type) }}
                    />
                    <h2 className="text-sm font-semibold text-white">{selectedNode.label}</h2>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-1 capitalize">{selectedNode.type} · {selectedNode.degree ?? 0} connections</p>
                </div>
                <button
                  onClick={() => { setSelectedNode(null); setWikiContent(null); }}
                  className="text-zinc-600 hover:text-white text-sm"
                >✕</button>
              </div>

              {selectedNode.signalIds?.length > 0 && (
                <p className="text-[10px] text-zinc-600 mt-2">
                  {selectedNode.signalIds.length} signal{selectedNode.signalIds.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>

            {/* Neighbors */}
            {selectedNeighbors.length > 0 && (
              <div className="p-3 border-b border-white/5">
                <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mb-2">Connections</p>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  {selectedNeighbors.map((n, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const node = nodes.find(nn => nn.id === n.id);
                        if (node) { setSelectedNode(node); focusNode(node.id); }
                      }}
                      className="flex items-center gap-2 text-left hover:bg-white/5 px-1 py-0.5 rounded transition-colors"
                    >
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: nodeColor(n.type) }}
                      />
                      <span className="text-xs text-zinc-400 flex-1 truncate">{n.label}</span>
                      <span className={`text-[9px] px-1 rounded ${
                        n.confidence === 'EXTRACTED' ? 'text-cyan-500' :
                        n.confidence === 'INFERRED' ? 'text-purple-400' : 'text-zinc-600'
                      }`}>{n.confidence === 'EXTRACTED' ? 'E' : n.confidence === 'INFERRED' ? 'I' : 'A'}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wiki article */}
            <div className="flex-1 overflow-y-auto p-3">
              {wikiLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                </div>
              )}
              {wikiContent && !wikiLoading && (
                <div className="prose prose-invert prose-xs max-w-none text-zinc-300">
                  <pre className="whitespace-pre-wrap text-[11px] text-zinc-400 font-sans leading-relaxed">
                    {wikiContent.slice(0, 2000)}{wikiContent.length > 2000 ? '...' : ''}
                  </pre>
                </div>
              )}
              {!wikiContent && !wikiLoading && selectedNode.wikiPath && (
                <p className="text-xs text-zinc-600 text-center py-4">No article loaded</p>
              )}
              {!selectedNode.wikiPath && !wikiLoading && (
                <p className="text-xs text-zinc-600 text-center py-4">No wiki article for this node</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
