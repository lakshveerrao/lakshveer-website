// Universe V2 - Node Detail Panel
// Complete node information system with 8-point detail

import { useState, useEffect } from 'react';

interface NodeDetail {
  id: string;
  label: string;
  type: string;
  description?: string;
  url?: string;
  timestamp?: string;
  year?: number;
  cluster_id?: string;
  growth_weight: number;
  impact_score: number;
  momentum: number;
  status?: string;
  verification_status: string;
  confidence_score: number;
  evidence: string[];
  why_it_matters?: string;
  what_it_unlocked: string[];
  what_it_enables: string[];
  learning_gaps: string[];
  ways_to_help: string[];
  meta: Record<string, any>;
}

interface Edge {
  id: string;
  source_id: string;
  target_id: string;
  type: string;
  label?: string;
  weight: number;
  source_label?: string;
  target_label?: string;
  source_type?: string;
  target_type?: string;
  verification_status: string;
}

interface Cluster {
  id: string;
  label: string;
  color: string;
  level: number;
  momentum: number;
  growth_rate: number;
}

interface LearningGap {
  id: string;
  label: string;
  description?: string;
  priority_score: number;
  suggested_action?: string;
}

interface NodeDetailPanelProps {
  nodeId: string | null;
  mode: 'public' | 'private' | 'partner';
  onClose: () => void;
  onNodeClick: (nodeId: string) => void;
  authKey?: string;
}

// Completeness check - nodes need at least 5 of these 8 fields
const COMPLETENESS_FIELDS = [
  'description',
  'why_it_matters', 
  'evidence',
  'what_it_unlocked',
  'what_it_enables',
  'learning_gaps',
  'ways_to_help',
  'url'
];

function checkCompleteness(node: NodeDetail): { complete: boolean; missing: string[]; score: number } {
  const missing: string[] = [];
  
  if (!node.description) missing.push('description');
  if (!node.why_it_matters) missing.push('why_it_matters');
  if (!node.evidence || node.evidence.length === 0) missing.push('evidence');
  if (!node.what_it_unlocked || node.what_it_unlocked.length === 0) missing.push('what_it_unlocked');
  if (!node.what_it_enables || node.what_it_enables.length === 0) missing.push('what_it_enables');
  if (!node.learning_gaps || node.learning_gaps.length === 0) missing.push('learning_gaps');
  if (!node.ways_to_help || node.ways_to_help.length === 0) missing.push('ways_to_help');
  if (!node.url) missing.push('url');
  
  const filled = COMPLETENESS_FIELDS.length - missing.length;
  return {
    complete: filled >= 5,
    missing,
    score: Math.round((filled / COMPLETENESS_FIELDS.length) * 100)
  };
}

const nodeTypeIcons: Record<string, string> = {
  person: '👤',
  project: '🔧',
  skill: '⚡',
  technology: '💻',
  tool: '🛠️',
  event: '📅',
  organization: '🏢',
  award: '🏆',
  endorsement: '💬',
  potential: '✨',
};

const edgeTypeLabels: Record<string, string> = {
  'BUILT_WITH': 'Built',
  'LEARNED_FROM': 'Learned from',
  'ENABLED_BY': 'Enabled by',
  'PRESENTED_AT': 'Presented at',
  'WON_AT': 'Won at',
  'SUPPORTED_BY': 'Supported by',
  'ENDORSED_BY': 'Endorsed by',
  'EVOLVED_INTO': 'Evolved into',
  'CROSS_POLLINATED': 'Cross-pollinated with',
  'USES': 'Uses',
  'UNLOCKS': 'Unlocks',
};

export function NodeDetailPanel({ 
  nodeId, 
  mode, 
  onClose, 
  onNodeClick,
  authKey 
}: NodeDetailPanelProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [node, setNode] = useState<NodeDetail | null>(null);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [cluster, setCluster] = useState<Cluster | null>(null);
  const [learningGaps, setLearningGaps] = useState<LearningGap[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'connections' | 'gaps' | 'help'>('overview');

  useEffect(() => {
    if (!nodeId) return;
    
    const fetchNodeDetail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const headers: Record<string, string> = {};
        if (authKey) {
          headers['X-Universe-Auth'] = authKey;
        }
        
        const response = await fetch(`/api/universe/nodes/${nodeId}?mode=${mode}`, { headers });
        const data = await response.json();
        
        if (!data.success) {
          setError(data.error || 'Failed to load node');
          return;
        }
        
        setNode(data.node);
        setEdges(data.edges || []);
        setCluster(data.cluster);
        setLearningGaps(data.learningGaps || []);
      } catch (err) {
        setError('Failed to fetch node details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchNodeDetail();
  }, [nodeId, mode, authKey]);

  if (!nodeId) return null;

  const completeness = node ? checkCompleteness(node) : null;

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-[#0a0a0f] border-l border-[var(--border-subtle)] shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          {node && (
            <>
              <span className="text-2xl">{nodeTypeIcons[node.type] || '📦'}</span>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">{node.label}</h2>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-wide">{node.type}</span>
              </div>
            </>
          )}
        </div>
        <button 
          onClick={onClose}
          className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[var(--text-muted)]">Loading...</div>
        </div>
      )}

      {error && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-red-400">{error}</div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && node && (
        <>
          {/* Completeness Warning (Private Mode) */}
          {mode === 'private' && completeness && !completeness.complete && (
            <div className="mx-6 mt-4 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-sm">
              <div className="flex items-center gap-2 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Incomplete Node ({completeness.score}%)
              </div>
              <div className="mt-1 text-xs text-amber-400/70">
                Missing: {completeness.missing.join(', ')}
              </div>
            </div>
          )}

          {/* Verification Status (Private Mode) */}
          {mode === 'private' && node.verification_status !== 'verified' && (
            <div className="mx-6 mt-4 flex items-center gap-2 text-sm">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                node.verification_status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                node.verification_status === 'inferred' ? 'bg-blue-500/20 text-blue-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {node.verification_status.toUpperCase()}
              </span>
              {node.confidence_score > 0 && (
                <span className="text-[var(--text-muted)]">
                  {node.confidence_score}% confidence
                </span>
              )}
            </div>
          )}

          {/* Scores Bar */}
          <div className="grid grid-cols-3 gap-4 px-6 py-4 border-b border-[var(--border-subtle)]">
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--accent)]">{node.growth_weight}</div>
              <div className="text-xs text-[var(--text-muted)]">Growth Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[var(--text-primary)]">{node.impact_score}</div>
              <div className="text-xs text-[var(--text-muted)]">Impact Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">{node.momentum}</div>
              <div className="text-xs text-[var(--text-muted)]">Momentum</div>
            </div>
          </div>

          {/* Cluster Badge */}
          {cluster && (
            <div className="px-6 py-3 border-b border-[var(--border-subtle)]">
              <div 
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                style={{ backgroundColor: `${cluster.color}20`, color: cluster.color }}
              >
                <span className="font-medium">{cluster.label}</span>
                <span className="text-xs opacity-70">Level {cluster.level}</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-[var(--border-subtle)]">
            {['overview', 'connections', ...(mode !== 'public' ? ['gaps', 'help'] : [])].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab 
                    ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* What this is */}
                {node.description && (
                  <div>
                    <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
                      What this is
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">{node.description}</p>
                  </div>
                )}

                {/* Why it matters */}
                {node.why_it_matters && (
                  <div>
                    <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
                      Why it matters
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">{node.why_it_matters}</p>
                  </div>
                )}

                {/* Evidence */}
                {node.evidence && node.evidence.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
                      Evidence
                    </h3>
                    <ul className="space-y-1">
                      {node.evidence.map((link, i) => (
                        <li key={i}>
                          <a 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-[var(--accent)] hover:underline flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            {link.length > 40 ? link.substring(0, 40) + '...' : link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* What it unlocked */}
                {node.what_it_unlocked && node.what_it_unlocked.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
                      What it unlocked
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {node.what_it_unlocked.map((item, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 text-xs bg-emerald-500/10 text-emerald-400 rounded"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* What it enables */}
                {node.what_it_enables && node.what_it_enables.length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
                      What it enables next
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {node.what_it_enables.map((item, i) => (
                        <span 
                          key={i}
                          className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 rounded"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* URL */}
                {node.url && (
                  <div>
                    <a 
                      href={node.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] text-sm hover:bg-[var(--accent)]/20 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Visit Link
                    </a>
                  </div>
                )}

                {/* Metadata */}
                {node.meta && Object.keys(node.meta).length > 0 && (
                  <div>
                    <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide mb-2">
                      Details
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(node.meta).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="text-[var(--text-muted)]">{key}: </span>
                          <span className="text-[var(--text-secondary)]">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'connections' && (
              <div className="space-y-3">
                {edges.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">No connections found.</p>
                ) : (
                  edges.map((edge) => {
                    const isSource = edge.source_id === nodeId;
                    const connectedLabel = isSource ? edge.target_label : edge.source_label;
                    const connectedType = isSource ? edge.target_type : edge.source_type;
                    const connectedId = isSource ? edge.target_id : edge.source_id;
                    
                    return (
                      <button
                        key={edge.id}
                        onClick={() => onNodeClick(connectedId)}
                        className="w-full flex items-center gap-3 p-3 bg-[var(--bg-elevated)] hover:bg-[var(--bg-elevated)]/80 transition-colors text-left"
                      >
                        <span className="text-lg">{nodeTypeIcons[connectedType || ''] || '📦'}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {connectedLabel}
                          </div>
                          <div className="text-xs text-[var(--text-muted)]">
                            {edgeTypeLabels[edge.type] || edge.type}
                            {edge.verification_status !== 'verified' && mode === 'private' && (
                              <span className="ml-2 text-yellow-400">• {edge.verification_status}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs text-[var(--text-muted)]">
                          {edge.weight}%
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'gaps' && mode !== 'public' && (
              <div className="space-y-3">
                {learningGaps.length === 0 ? (
                  <p className="text-sm text-[var(--text-muted)]">No learning gaps linked to this node.</p>
                ) : (
                  learningGaps.map((gap) => (
                    <div 
                      key={gap.id}
                      className="p-3 bg-amber-500/5 border border-amber-500/20"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-amber-400">{gap.label}</span>
                        <span className="text-xs text-amber-400/70">Priority: {gap.priority_score}</span>
                      </div>
                      {gap.description && (
                        <p className="text-xs text-[var(--text-muted)] mb-2">{gap.description}</p>
                      )}
                      {gap.suggested_action && (
                        <p className="text-xs text-[var(--text-secondary)]">
                          <span className="text-[var(--text-muted)]">Action: </span>
                          {gap.suggested_action}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'help' && mode !== 'public' && (
              <div className="space-y-4">
                <h3 className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                  Ways someone can help
                </h3>
                {node.ways_to_help && node.ways_to_help.length > 0 ? (
                  <ul className="space-y-2">
                    {node.ways_to_help.map((help, i) => (
                      <li 
                        key={i}
                        className="flex items-start gap-2 text-sm text-[var(--text-secondary)]"
                      >
                        <svg className="w-4 h-4 text-[var(--accent)] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {help}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">No help requests defined yet.</p>
                )}

                {/* Generate Outreach Draft button */}
                {(node.type === 'person' || node.type === 'organization') && (
                  <button className="w-full mt-4 px-4 py-2 bg-[var(--accent)]/10 text-[var(--accent)] text-sm hover:bg-[var(--accent)]/20 transition-colors flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Generate Outreach Draft
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default NodeDetailPanel;
