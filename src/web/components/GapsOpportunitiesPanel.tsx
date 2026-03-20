// Learning Gaps & Opportunities Panel - Phase A with Alignment Engine
// Auto-detected gaps and alignment-based opportunities

import { useState, useEffect, useCallback } from 'react';
import { isPrivateMode } from '@/hooks/useUniverseAPI';

interface LearningGap {
  id: string;
  type: string;
  label: string;
  description: string;
  priority_score: number;
  effort_score: number;
  roi_score: number;
  cluster_id?: string;
  cluster_label?: string;
  cluster_color?: string;
  related_nodes: string[];
  missing_sections?: string[];
  suggested_action?: string;
  is_auto_detected: boolean;
  status: string;
}

// Phase A: Enhanced Opportunity interface with alignment data
interface AlignmentBreakdown {
  clusterOverlap: number;
  buildRelevance: number;
  stageCompatibility: number;
  recency: number;
  domainSimilarity: number;
}

interface ValueFrameItem {
  dimension: string;
  description: string;
  strength: 'high' | 'medium' | 'low';
}

interface ValueFrame {
  forLaksh: ValueFrameItem[];
  forThem: ValueFrameItem[];
  mutualBenefit: string;
}

interface AlignmentData {
  score: number;
  breakdown: AlignmentBreakdown;
  matchedClusters: string[];
  supportingBuilds: string[];
}

interface Opportunity {
  id: string;
  label: string;
  description: string;
  reasoning: string;
  confidence_score: number;
  related_nodes: string[];
  related_clusters: string[];
  suggested_action?: string;
  timeframe?: string;
  is_auto_detected: boolean;
  status: string;
  source?: string;
  // Phase A: Alignment engine fields
  alignment?: AlignmentData;
  valueFrame?: ValueFrame;
  category?: string;
  targetNodeId?: string;
  // Phase A v3: Intelligent opportunity fields
  type?: string;
  valueForLaksh?: string;
  valueForThem?: string;
  mutualBenefit?: string;
  novelty?: number;
  effort?: string;
  actionSteps?: string[];
}

interface GapStats {
  total: number;
  manual: number;
  autoDetected: number;
  byType: Record<string, number>;
}

interface OppStats {
  total: number;
  manual: number;
  autoDetected: number;
  byCategory?: Record<string, number>;
  alignmentThreshold?: number;
}

const API_BASE = '/api/universe';

function getAuthHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'X-Universe-Auth': 'laksh-private-2026',
  };
}

const gapTypeColors: Record<string, string> = {
  incomplete_node: '#f59e0b',  // Amber
  weak_cluster: '#ef4444',     // Red
  missing_connection: '#8b5cf6', // Purple
  stale_project: '#6b7280',    // Gray
  missing_skill: '#3b82f6',    // Blue
};

const gapTypeIcons: Record<string, string> = {
  incomplete_node: '📝',
  weak_cluster: '📉',
  missing_connection: '🔗',
  stale_project: '⏸️',
  missing_skill: '🎯',
};

interface GapsOpportunitiesPanelProps {
  onClose?: () => void;
  onNodeSelect?: (nodeId: string) => void;
}

export function GapsOpportunitiesPanel({ onClose, onNodeSelect }: GapsOpportunitiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'gaps' | 'opportunities'>('gaps');
  const [loading, setLoading] = useState(true);
  
  // Gaps state
  const [gaps, setGaps] = useState<LearningGap[]>([]);
  const [gapStats, setGapStats] = useState<GapStats | null>(null);
  
  // Opportunities state
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [oppStats, setOppStats] = useState<OppStats | null>(null);
  
  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gapsRes, oppsRes] = await Promise.all([
        fetch(`${API_BASE}/learning-gaps`, { headers: getAuthHeaders() }),
        fetch(`${API_BASE}/opportunities/intelligent`, { headers: getAuthHeaders() }), // Use intelligent endpoint
      ]);
      
      const gapsData = await gapsRes.json();
      const oppsData = await oppsRes.json();
      
      if (gapsData.success) {
        setGaps(gapsData.gaps || []);
        setGapStats(gapsData.stats);
      }
      
      if (oppsData.success) {
        // Transform intelligent opportunities to match UI expectations
        const transformedOpps = (oppsData.opportunities || []).map((opp: any) => ({
          id: opp.id,
          label: opp.title,
          description: opp.insight,
          reasoning: opp.reasoning.join('. '),
          confidence_score: opp.confidence,
          related_nodes: opp.pathNodes || [],
          related_clusters: [],
          suggested_action: opp.nextStep,
          timeframe: opp.timeframe,
          is_auto_detected: true,
          status: 'suggested',
          source: opp.source || 'graph',
          // New intelligent fields
          type: opp.type,
          valueForLaksh: opp.valueForLaksh,
          valueForThem: opp.valueForThem,
          mutualBenefit: opp.mutualBenefit,
          novelty: opp.novelty,
          effort: opp.effort,
          actionSteps: opp.actionSteps,
        }));
        setOpportunities(transformedOpps);
        setOppStats(oppsData.stats);
      }
    } catch (error) {
      console.error('Failed to fetch gaps/opportunities:', error);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  // Close a gap
  const closeGap = async (gapId: string) => {
    try {
      await fetch(`${API_BASE}/learning-gaps/${gapId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: 'closed' }),
      });
      setGaps(prev => prev.filter(g => g.id !== gapId));
    } catch (error) {
      console.error('Failed to close gap:', error);
    }
  };
  
  // Approve/reject opportunity
  const updateOpportunity = async (oppId: string, status: 'approved' | 'rejected') => {
    try {
      await fetch(`${API_BASE}/opportunities/${oppId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      });
      if (status === 'rejected') {
        setOpportunities(prev => prev.filter(o => o.id !== oppId));
      } else {
        setOpportunities(prev => prev.map(o => 
          o.id === oppId ? { ...o, status: 'approved' } : o
        ));
      }
    } catch (error) {
      console.error('Failed to update opportunity:', error);
    }
  };
  
  if (!isPrivateMode()) {
    return (
      <div className="p-6 text-center text-white/50">
        This panel is only available in private mode.
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div>
          <h2 className="text-lg font-semibold text-white">Gaps & Opportunities</h2>
          <p className="text-xs text-white/50">Auto-detected from your universe data</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded transition-colors">
            <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('gaps')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'gaps'
              ? 'text-amber-400 border-b-2 border-amber-400'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          Learning Gaps ({gaps.length})
        </button>
        <button
          onClick={() => setActiveTab('opportunities')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'opportunities'
              ? 'text-green-400 border-b-2 border-green-400'
              : 'text-white/50 hover:text-white/70'
          }`}
        >
          Opportunities ({opportunities.length})
        </button>
      </div>
      
      {/* Stats */}
      {activeTab === 'gaps' && gapStats && (
        <div className="grid grid-cols-4 gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="text-center">
            <div className="text-lg font-bold text-amber-400">{gapStats.total}</div>
            <div className="text-xs text-white/40">Total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white/70">{gapStats.byType.incomplete_node || 0}</div>
            <div className="text-xs text-white/40">Incomplete</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white/70">{gapStats.byType.missing_connection || 0}</div>
            <div className="text-xs text-white/40">Connections</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white/70">{gapStats.byType.stale_project || 0}</div>
            <div className="text-xs text-white/40">Stale</div>
          </div>
        </div>
      )}
      
      {activeTab === 'opportunities' && oppStats && (
        <div className="px-4 py-3 border-b border-white/10 bg-white/5">
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="text-center">
              <div className="text-lg font-bold text-green-400">{oppStats.total}</div>
              <div className="text-xs text-white/40">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-cyan-400">{oppStats.autoDetected}</div>
              <div className="text-xs text-white/40">Aligned</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white/70">{oppStats.manual}</div>
              <div className="text-xs text-white/40">Manual</div>
            </div>
          </div>
          {/* Category breakdown */}
          {oppStats.byCategory && Object.keys(oppStats.byCategory).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(oppStats.byCategory).map(([cat, count]) => (
                <span key={cat} className="text-xs px-2 py-0.5 bg-white/5 rounded text-white/50">
                  {cat}: {count}
                </span>
              ))}
            </div>
          )}
          {oppStats.alignmentThreshold && (
            <div className="text-xs text-white/30 mt-2">
              Threshold: {oppStats.alignmentThreshold}+ alignment score
            </div>
          )}
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-white/50 py-8">Loading...</div>
        ) : activeTab === 'gaps' ? (
          gaps.length === 0 ? (
            <div className="text-center text-white/50 py-8">
              No learning gaps detected. Your universe is well-documented.
            </div>
          ) : (
            gaps.map(gap => (
              <GapCard 
                key={gap.id} 
                gap={gap} 
                onClose={() => closeGap(gap.id)}
                onNodeSelect={onNodeSelect}
              />
            ))
          )
        ) : (
          opportunities.length === 0 ? (
            <div className="text-center text-white/50 py-8">
              No opportunities detected yet. Keep building.
            </div>
          ) : (
            opportunities.map(opp => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                onApprove={() => updateOpportunity(opp.id, 'approved')}
                onReject={() => updateOpportunity(opp.id, 'rejected')}
              />
            ))
          )
        )}
      </div>
    </div>
  );
}

// Gap Card Component
function GapCard({ 
  gap, 
  onClose, 
  onNodeSelect 
}: { 
  gap: LearningGap; 
  onClose: () => void;
  onNodeSelect?: (nodeId: string) => void;
}) {
  const color = gapTypeColors[gap.type] || '#6b7280';
  const icon = gapTypeIcons[gap.type] || '📋';
  
  return (
    <div className="p-4 rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-start gap-3">
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
          style={{ backgroundColor: `${color}20` }}
        >
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-white">{gap.label}</span>
            {gap.is_auto_detected && (
              <span className="text-xs px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">Auto</span>
            )}
          </div>
          
          <p className="text-xs text-white/50 mb-2">{gap.description}</p>
          
          {/* Scores */}
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-1">
              <span className="text-xs text-white/40">Priority:</span>
              <span className="text-xs font-mono" style={{ color }}>{Math.round(gap.priority_score)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-white/40">Effort:</span>
              <span className="text-xs font-mono text-white/60">{gap.effort_score}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-white/40">ROI:</span>
              <span className="text-xs font-mono text-green-400">{Math.round(gap.roi_score)}%</span>
            </div>
          </div>
          
          {/* Cluster */}
          {gap.cluster_label && (
            <div 
              className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded mb-2"
              style={{ backgroundColor: `${gap.cluster_color}20`, color: gap.cluster_color }}
            >
              {gap.cluster_label}
            </div>
          )}
          
          {/* Related nodes */}
          {gap.related_nodes && gap.related_nodes.length > 0 && onNodeSelect && (
            <div className="flex flex-wrap gap-1">
              {gap.related_nodes.map(nodeId => (
                <button
                  key={nodeId}
                  onClick={() => onNodeSelect(nodeId)}
                  className="text-xs px-1.5 py-0.5 bg-white/5 hover:bg-white/10 rounded text-cyan-400 transition-colors"
                >
                  {nodeId}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded text-white/40 hover:text-white/60 transition-colors"
          title="Mark as addressed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Category/Type icons for opportunities - Phase A v3
const opportunityTypeIcons: Record<string, string> = {
  grant: '💰',
  invite: '📩',
  sponsorship: '🤝',
  partnership: '🔗',
  collab: '👥',
  learning: '📚',
  pitch: '🎤',
  scholarship: '🎓',
  // Intelligent types
  product: '📦',
  path: '🔀',
  combination: '⚡',
  network: '🌐',
  content: '✍️',
  gap: '🎯',
  timing: '⏱️',
};

const opportunityTypeColors: Record<string, string> = {
  product: '#8b5cf6',    // Purple
  path: '#3b82f6',       // Blue
  combination: '#f59e0b', // Amber
  network: '#06b6d4',    // Cyan
  content: '#ec4899',    // Pink
  gap: '#ef4444',        // Red
  timing: '#10b981',     // Green
  partnership: '#6366f1', // Indigo
};

// Opportunity Card Component - Phase A v3 with Intelligent Opportunities
function OpportunityCard({
  opportunity,
  onApprove,
  onReject,
}: {
  opportunity: Opportunity;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  const isApproved = opportunity.status === 'approved';
  
  // Determine icon and color
  const oppType = opportunity.type || opportunity.category || 'collab';
  const icon = opportunityTypeIcons[oppType] || '🎯';
  const color = opportunityTypeColors[oppType] || '#6b7280';
  const hasAlignment = opportunity.alignment && opportunity.source === 'alignment_engine';
  const isIntelligent = opportunity.source === 'graph' || opportunity.source === 'llm';
  
  return (
    <div className={`rounded-lg border transition-all ${
      isApproved ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-white/5'
    } hover:border-white/20`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div 
            className="w-9 h-9 rounded-lg flex items-center justify-center text-xl shrink-0"
            style={{ backgroundColor: `${color}15` }}
          >
            {icon}
          </div>
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-semibold text-white">{opportunity.label}</span>
              {oppType && (
                <span 
                  className="text-xs px-1.5 py-0.5 rounded capitalize font-medium"
                  style={{ backgroundColor: `${color}20`, color }}
                >
                  {oppType}
                </span>
              )}
              {isIntelligent && opportunity.novelty && opportunity.novelty >= 75 && (
                <span className="text-xs px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">
                  ⭐ Novel
                </span>
              )}
              {isApproved && (
                <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">✓ Approved</span>
              )}
            </div>
            
            {/* Insight */}
            <p className="text-sm text-white/70 mb-2 leading-relaxed">{opportunity.description}</p>
            
            {/* Reasoning chain (if intelligent opportunity) */}
            {isIntelligent && Array.isArray(opportunity.reasoning) ? (
              <div className="mb-3 space-y-1">
                {typeof opportunity.reasoning === 'string' 
                  ? opportunity.reasoning.split('. ').filter(Boolean).map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-white/50">
                        <span className="text-cyan-400 font-mono mt-0.5">→</span>
                        <span>{step}</span>
                      </div>
                    ))
                  : null
                }
              </div>
            ) : opportunity.reasoning && (
              <div className="text-xs text-white/40 mb-2 p-2 bg-white/5 rounded">
                {opportunity.reasoning}
              </div>
            )}
            
            {/* Scores row */}
            <div className="flex items-center gap-3 mb-3 flex-wrap text-xs">
              <div className="flex items-center gap-1">
                <span className="text-white/40">Confidence:</span>
                <span className={`font-mono font-medium ${
                  opportunity.confidence_score >= 80 ? 'text-green-400' :
                  opportunity.confidence_score >= 60 ? 'text-amber-400' : 'text-white/60'
                }`}>{opportunity.confidence_score}%</span>
              </div>
              {opportunity.novelty && (
                <div className="flex items-center gap-1">
                  <span className="text-white/40">Novelty:</span>
                  <span className={`font-mono font-medium ${
                    opportunity.novelty >= 75 ? 'text-amber-400' : 'text-white/60'
                  }`}>{opportunity.novelty}%</span>
                </div>
              )}
              {opportunity.effort && (
                <div className="flex items-center gap-1">
                  <span className="text-white/40">Effort:</span>
                  <span className={`font-medium ${
                    opportunity.effort === 'low' ? 'text-green-400' :
                    opportunity.effort === 'medium' ? 'text-amber-400' : 'text-red-400'
                  }`}>{opportunity.effort}</span>
                </div>
              )}
              {opportunity.timeframe && (
                <div className="flex items-center gap-1">
                  <span className="text-white/40">Timeline:</span>
                  <span className="text-white/60 font-medium">{opportunity.timeframe}</span>
                </div>
              )}
            </div>
            
            {/* Value proposition (intelligent opportunities) */}
            {isIntelligent && opportunity.valueForLaksh && (
              <div className="mb-3 p-2 bg-white/5 rounded space-y-1.5">
                <div className="text-xs">
                  <span className="text-green-400 font-medium">For Laksh: </span>
                  <span className="text-white/60">{opportunity.valueForLaksh}</span>
                </div>
                {opportunity.valueForThem && opportunity.valueForThem !== 'N/A - self-generated product' && (
                  <div className="text-xs">
                    <span className="text-cyan-400 font-medium">For Them: </span>
                    <span className="text-white/60">{opportunity.valueForThem}</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Alignment breakdown (old opportunities) */}
            {hasAlignment && showDetails && (
              <div className="mb-3 p-2 bg-cyan-500/5 rounded space-y-1 border border-cyan-500/20">
                <div className="text-xs font-medium text-cyan-400 mb-1">Alignment Breakdown:</div>
                {opportunity.alignment && Object.entries(opportunity.alignment.breakdown).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between text-xs">
                    <span className="text-white/50 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="text-white/70 font-mono">{Math.round(value as number)}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Value frame (old opportunities) */}
            {hasAlignment && opportunity.valueFrame && showDetails && (
              <div className="mb-3 p-2 bg-white/5 rounded space-y-2">
                <div>
                  <div className="text-xs font-medium text-green-400 mb-1">Value for Laksh:</div>
                  {opportunity.valueFrame.forLaksh.slice(0, 2).map((item, i) => (
                    <div key={i} className="text-xs text-white/60 ml-2">
                      • {item.dimension}: {item.description}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="text-xs font-medium text-cyan-400 mb-1">Value for Them:</div>
                  {opportunity.valueFrame.forThem.slice(0, 2).map((item, i) => (
                    <div key={i} className="text-xs text-white/60 ml-2">
                      • {item.dimension}: {item.description}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Suggested action */}
            {opportunity.suggested_action && (
              <div className="text-xs p-2 bg-cyan-500/10 rounded border border-cyan-500/20">
                <span className="text-cyan-400 font-medium">Next Step: </span>
                <span className="text-white/70">{opportunity.suggested_action}</span>
              </div>
            )}
            
            {/* Action steps (intelligent opportunities) */}
            {isIntelligent && opportunity.actionSteps && opportunity.actionSteps.length > 0 && showDetails && (
              <div className="mt-2 p-2 bg-white/5 rounded space-y-1">
                <div className="text-xs font-medium text-white/70 mb-1">Action Steps:</div>
                {opportunity.actionSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-white/50">
                    <span className="text-cyan-400 font-mono mt-0.5">{i + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Actions */}
          {!isApproved && (
            <div className="flex gap-2 shrink-0">
              <button
                onClick={onApprove}
                className="p-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded transition-colors"
                title="Approve"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                onClick={onReject}
                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                title="Reject"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Alignment Breakdown Panel - Phase A Transparency */}
      {showDetails && hasAlignment && opportunity.alignment && (
        <div className="px-4 pb-4 border-t border-white/5">
          <div className="mt-3 space-y-3">
            {/* Score Breakdown Bars */}
            <div className="space-y-2">
              <div className="text-xs text-white/50 font-medium">Alignment Breakdown</div>
              <AlignmentBar label="Cluster Overlap" value={opportunity.alignment.breakdown.clusterOverlap} color="#8b5cf6" />
              <AlignmentBar label="Build Relevance" value={opportunity.alignment.breakdown.buildRelevance} color="#f59e0b" />
              <AlignmentBar label="Stage Compatibility" value={opportunity.alignment.breakdown.stageCompatibility} color="#22d3ee" />
              <AlignmentBar label="Recency" value={opportunity.alignment.breakdown.recency} color="#6b7280" />
              <AlignmentBar label="Domain Match" value={opportunity.alignment.breakdown.domainSimilarity} color="#10b981" />
            </div>
            
            {/* Value Framing */}
            {opportunity.valueFrame && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                {/* Value for Laksh */}
                <div className="p-2 bg-white/5 rounded">
                  <div className="text-xs text-cyan-400 font-medium mb-1">Value for Laksh</div>
                  {opportunity.valueFrame.forLaksh.map((v, i) => (
                    <div key={i} className="text-xs text-white/50 mb-1">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        v.strength === 'high' ? 'bg-green-400' : 
                        v.strength === 'medium' ? 'bg-amber-400' : 'bg-white/30'
                      }`} />
                      {v.dimension}: {v.description}
                    </div>
                  ))}
                </div>
                
                {/* Value for Them */}
                <div className="p-2 bg-white/5 rounded">
                  <div className="text-xs text-green-400 font-medium mb-1">Value for Them</div>
                  {opportunity.valueFrame.forThem.map((v, i) => (
                    <div key={i} className="text-xs text-white/50 mb-1">
                      <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                        v.strength === 'high' ? 'bg-green-400' : 
                        v.strength === 'medium' ? 'bg-amber-400' : 'bg-white/30'
                      }`} />
                      {v.dimension}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Mutual Benefit Summary */}
            {opportunity.valueFrame?.mutualBenefit && (
              <div className="text-xs text-white/40 p-2 bg-white/5 rounded border-l-2 border-cyan-500">
                {opportunity.valueFrame.mutualBenefit}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Alignment Bar Component for visual breakdown
function AlignmentBar({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-white/40 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, value)}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-mono text-white/50 w-8 text-right">{Math.round(value)}</span>
    </div>
  );
}

export default GapsOpportunitiesPanel;
