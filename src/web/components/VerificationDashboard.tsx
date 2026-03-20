// Verification Dashboard - Review and approve/reject nodes and edges
// Phase 3: Verification Layer + Trust System

import { useState, useEffect, useCallback } from 'react';
import { isPrivateMode } from '@/hooks/useUniverseAPI';

interface PendingNode {
  id: string;
  label: string;
  type: string;
  description?: string;
  verification_status: string;
  confidence_score: number;
  cluster_label?: string;
  cluster_color?: string;
  evidence: string[];
  meta: Record<string, any>;
  created_at: string;
}

interface PendingEdge {
  id: string;
  source_id: string;
  target_id: string;
  source_label: string;
  target_label: string;
  source_type: string;
  target_type: string;
  type: string;
  label?: string;
  verification_status: string;
  confidence_score: number;
  calculatedConfidence: number;
  confidenceBreakdown: {
    sourceReliability: number;
    edgeTypeBase: number;
    evidenceBoost: number;
    coOccurrenceBoost: number;
    formula: string;
  };
  inference_reason?: string;
  evidence?: string;
  created_at: string;
}

interface VerificationStats {
  totalPendingNodes: number;
  totalPendingEdges: number;
  highConfidenceEdges: number;
  lowConfidenceEdges: number;
}

interface VerificationDashboardProps {
  onClose?: () => void;
}

const API_BASE = '/api/universe';

function getAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Universe-Auth': 'laksh-private-2026',
  };
}

export function VerificationDashboard({ onClose }: VerificationDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'nodes' | 'edges'>('edges');
  const [pendingNodes, setPendingNodes] = useState<PendingNode[]>([]);
  const [pendingEdges, setPendingEdges] = useState<PendingEdge[]>([]);
  const [stats, setStats] = useState<VerificationStats | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'high' | 'low'>('all');

  // Fetch verification queue
  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/verification-queue`, {
        headers: getAuthHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setPendingNodes(data.pendingNodes || []);
        setPendingEdges(data.pendingEdges || []);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch verification queue:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  // Verify single item
  const verifyItem = async (
    entityType: 'node' | 'edge',
    entityId: string,
    action: 'approve' | 'reject' | 'defer',
    reason?: string
  ) => {
    setProcessing(entityId);
    try {
      const res = await fetch(`${API_BASE}/verify`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ entityType, entityId, action, reason }),
      });
      const data = await res.json();
      if (data.success) {
        // Remove from list
        if (action !== 'defer') {
          if (entityType === 'node') {
            setPendingNodes(prev => prev.filter(n => n.id !== entityId));
          } else {
            setPendingEdges(prev => prev.filter(e => e.id !== entityId));
          }
        }
        // Update stats
        if (stats) {
          setStats({
            ...stats,
            totalPendingNodes: entityType === 'node' && action !== 'defer' 
              ? stats.totalPendingNodes - 1 
              : stats.totalPendingNodes,
            totalPendingEdges: entityType === 'edge' && action !== 'defer'
              ? stats.totalPendingEdges - 1
              : stats.totalPendingEdges,
          });
        }
      }
    } catch (error) {
      console.error('Verification failed:', error);
    } finally {
      setProcessing(null);
    }
  };

  // Batch verify
  const batchVerify = async (action: 'approve' | 'reject') => {
    if (selectedItems.size === 0) return;
    
    setProcessing('batch');
    try {
      const items = Array.from(selectedItems).map(id => {
        const isNode = pendingNodes.some(n => n.id === id);
        return { entityType: isNode ? 'node' : 'edge', entityId: id };
      });
      
      const res = await fetch(`${API_BASE}/verify-batch`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ items, action }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh the queue
        await fetchQueue();
        setSelectedItems(new Set());
      }
    } catch (error) {
      console.error('Batch verification failed:', error);
    } finally {
      setProcessing(null);
    }
  };

  // Filter edges
  const filteredEdges = pendingEdges.filter(edge => {
    if (filter === 'high') return edge.calculatedConfidence >= 70;
    if (filter === 'low') return edge.calculatedConfidence < 50;
    return true;
  });

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Select all visible
  const selectAll = () => {
    if (activeTab === 'nodes') {
      setSelectedItems(new Set(pendingNodes.map(n => n.id)));
    } else {
      setSelectedItems(new Set(filteredEdges.map(e => e.id)));
    }
  };

  if (!isPrivateMode()) {
    return (
      <div className="p-6 text-center text-white/50">
        Verification dashboard is only available in private mode.
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div>
          <h2 className="text-lg font-semibold text-white">Verification Dashboard</h2>
          <p className="text-xs text-white/50">Review and approve pending nodes & edges</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded transition-colors">
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-3 px-6 py-4 border-b border-white/10">
          <div className="text-center">
            <div className="text-xl font-bold text-amber-400">{stats.totalPendingNodes}</div>
            <div className="text-xs text-white/40">Pending Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-amber-400">{stats.totalPendingEdges}</div>
            <div className="text-xs text-white/40">Pending Edges</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-green-400">{stats.highConfidenceEdges}</div>
            <div className="text-xs text-white/40">High Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-400">{stats.lowConfidenceEdges}</div>
            <div className="text-xs text-white/40">Low Confidence</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('edges')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'edges'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          Edges ({pendingEdges.length})
        </button>
        <button
          onClick={() => setActiveTab('nodes')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'nodes'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          Nodes ({pendingNodes.length})
        </button>
      </div>

      {/* Batch Actions + Filter */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <button
            onClick={selectAll}
            className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
          >
            Select All
          </button>
          <button
            onClick={() => setSelectedItems(new Set())}
            className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded transition-colors"
          >
            Clear
          </button>
          {selectedItems.size > 0 && (
            <>
              <span className="text-xs text-white/40 mx-2">{selectedItems.size} selected</span>
              <button
                onClick={() => batchVerify('approve')}
                disabled={processing === 'batch'}
                className="px-3 py-1.5 text-xs bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded transition-colors disabled:opacity-50"
              >
                Approve All
              </button>
              <button
                onClick={() => batchVerify('reject')}
                disabled={processing === 'batch'}
                className="px-3 py-1.5 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors disabled:opacity-50"
              >
                Reject All
              </button>
            </>
          )}
        </div>
        
        {activeTab === 'edges' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40">Filter:</span>
            {(['all', 'high', 'low'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  filter === f
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'bg-white/10 text-white/50 hover:text-white/70'
                }`}
              >
                {f === 'all' ? 'All' : f === 'high' ? '≥70%' : '<50%'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-white/50 py-8">Loading...</div>
        ) : activeTab === 'edges' ? (
          filteredEdges.length === 0 ? (
            <div className="text-center text-white/50 py-8">No pending edges to review</div>
          ) : (
            filteredEdges.map((edge) => (
              <EdgeCard
                key={edge.id}
                edge={edge}
                selected={selectedItems.has(edge.id)}
                onToggle={() => toggleSelection(edge.id)}
                onVerify={(action, reason) => verifyItem('edge', edge.id, action, reason)}
                processing={processing === edge.id}
              />
            ))
          )
        ) : (
          pendingNodes.length === 0 ? (
            <div className="text-center text-white/50 py-8">No pending nodes to review</div>
          ) : (
            pendingNodes.map((node) => (
              <NodeCard
                key={node.id}
                node={node}
                selected={selectedItems.has(node.id)}
                onToggle={() => toggleSelection(node.id)}
                onVerify={(action, reason) => verifyItem('node', node.id, action, reason)}
                processing={processing === node.id}
              />
            ))
          )
        )}
      </div>
    </div>
  );
}

// Edge Card Component
function EdgeCard({
  edge,
  selected,
  onToggle,
  onVerify,
  processing,
}: {
  edge: PendingEdge;
  selected: boolean;
  onToggle: () => void;
  onVerify: (action: 'approve' | 'reject' | 'defer', reason?: string) => void;
  processing: boolean;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const confidence = edge.calculatedConfidence;
  
  const confidenceColor = confidence >= 70 ? 'text-green-400' : confidence >= 50 ? 'text-amber-400' : 'text-red-400';
  const confidenceBg = confidence >= 70 ? 'bg-green-500/10' : confidence >= 50 ? 'bg-amber-500/10' : 'bg-red-500/10';

  return (
    <div className={`p-4 rounded-lg border transition-colors ${
      selected ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/10 bg-white/5'
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-1 accent-cyan-500"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-white/80">{edge.source_label}</span>
            <span className="text-xs text-cyan-400 px-1.5 py-0.5 bg-cyan-500/10 rounded">{edge.type}</span>
            <span className="text-sm text-white/80">{edge.target_label}</span>
          </div>
          {edge.inference_reason && (
            <p className="text-xs text-white/50 mb-2">{edge.inference_reason}</p>
          )}
          
          {/* Confidence */}
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded text-xs font-medium ${confidenceBg} ${confidenceColor}`}>
              {confidence}% confidence
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-white/40 hover:text-white/60"
            >
              {showDetails ? 'Hide' : 'Show'} breakdown
            </button>
          </div>
          
          {/* Confidence Breakdown */}
          {showDetails && edge.confidenceBreakdown && (
            <div className="mt-3 p-2 bg-white/5 rounded text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-white/40">Source Reliability</span>
                <span className="text-white/60">{edge.confidenceBreakdown.sourceReliability}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Edge Type Base</span>
                <span className="text-white/60">{edge.confidenceBreakdown.edgeTypeBase}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Evidence Boost</span>
                <span className="text-white/60">+{edge.confidenceBreakdown.evidenceBoost}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Co-occurrence Boost</span>
                <span className="text-white/60">+{edge.confidenceBreakdown.coOccurrenceBoost}</span>
              </div>
              <div className="pt-1 border-t border-white/10 text-white/30">
                {edge.confidenceBreakdown.formula}
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onVerify('approve')}
            disabled={processing}
            className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded transition-colors disabled:opacity-50"
            title="Approve"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={() => onVerify('reject')}
            disabled={processing}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors disabled:opacity-50"
            title="Reject"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={() => onVerify('defer')}
            disabled={processing}
            className="p-2 bg-white/10 hover:bg-white/20 text-white/50 rounded transition-colors disabled:opacity-50"
            title="Defer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// Node Card Component
function NodeCard({
  node,
  selected,
  onToggle,
  onVerify,
  processing,
}: {
  node: PendingNode;
  selected: boolean;
  onToggle: () => void;
  onVerify: (action: 'approve' | 'reject' | 'defer', reason?: string) => void;
  processing: boolean;
}) {
  return (
    <div className={`p-4 rounded-lg border transition-colors ${
      selected ? 'border-cyan-500/50 bg-cyan-500/5' : 'border-white/10 bg-white/5'
    }`}>
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          className="mt-1 accent-cyan-500"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white">{node.label}</span>
            <span className="text-xs text-white/40 px-1.5 py-0.5 bg-white/10 rounded">{node.type}</span>
            {node.cluster_label && (
              <span 
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ 
                  backgroundColor: `${node.cluster_color}20`,
                  color: node.cluster_color,
                }}
              >
                {node.cluster_label}
              </span>
            )}
          </div>
          {node.description && (
            <p className="text-xs text-white/50 line-clamp-2">{node.description}</p>
          )}
          {node.evidence && node.evidence.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-xs text-white/40">{node.evidence.length} evidence links</span>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onVerify('approve')}
            disabled={processing}
            className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={() => onVerify('reject')}
            disabled={processing}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            onClick={() => onVerify('defer')}
            disabled={processing}
            className="p-2 bg-white/10 hover:bg-white/20 text-white/50 rounded transition-colors disabled:opacity-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerificationDashboard;
