// ============================================
// NODE AGENT PANEL — Universe v5.5
// Shown when user clicks a node — deep context + intelligence
// v5.5: Signal capture button, signal/opportunity counts
// ============================================

import { useState, useEffect } from 'react';
import { runNodeAgent, type NodeAgentResult } from '../../../agents/node-agent';
import { getConnectedNodes } from '../../data/universe-data';
import { getCachedWorkspace } from '../../../intelligence/workspace-cache';
import { NodeWorkspacePanel } from './NodeWorkspacePanel';
import { SignalCapturePanel } from './SignalCapturePanel';
import type { NodeWorkspace } from '../../../workspaces/node-workspace';

interface NodeAgentPanelProps {
  nodeId: string;
  nodeLabel: string;
  nodeType: string;
  nodeDescription?: string;
  nodeTimestamp?: string;
  onNodeSelect?: (nodeId: string) => void;
  onClose?: () => void;
  privateMode?: boolean;
}

type Tab = 'overview' | 'connections' | 'intelligence' | 'workspace';

export function NodeAgentPanel({
  nodeId,
  nodeLabel,
  nodeType,
  nodeDescription,
  nodeTimestamp,
  onNodeSelect,
  onClose,
  privateMode = false,
}: NodeAgentPanelProps) {
  const [agentResult, setAgentResult] = useState<NodeAgentResult | null>(null);
  const [workspace, setWorkspace] = useState<NodeWorkspace | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [showSignalCapture, setShowSignalCapture] = useState(false);

  useEffect(() => {
    const result = runNodeAgent(nodeId);
    setAgentResult(result);
    const ws = getCachedWorkspace(nodeId);
    setWorkspace(ws);
    setActiveTab('overview');
  }, [nodeId]);

  const connectedNodes = getConnectedNodes(nodeId);

  const typeColors: Record<string, string> = {
    core: '#22d3ee', product: '#3b82f6', project: '#10b981',
    skill: '#8b5cf6', tool: '#f59e0b', person: '#ec4899',
    company: '#f97316', event: '#06b6d4', media: '#ef4444',
    achievement: '#fbbf24', possibility: 'rgba(255,255,255,0.5)', concept: '#64748b',
  };

  const nodeColor = typeColors[nodeType] || '#6b7280';

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'connections', label: `Connections (${connectedNodes.length})` },
    { id: 'workspace', label: 'Workspace' },
    ...(privateMode ? [{ id: 'intelligence' as Tab, label: 'Agent' }] : []),
  ];

  const handleSignalProcessed = () => {
    // Re-run agent and workspace after signal processed
    const result = runNodeAgent(nodeId);
    setAgentResult(result);
    const ws = getCachedWorkspace(nodeId);
    setWorkspace(ws);
  };

  return (
    <div className="h-full flex flex-col bg-[#050508] text-white">
      {/* Header */}
      <div className="px-5 pt-5 pb-3 border-b border-white/5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: nodeColor }} />
              <span className="text-xs font-medium uppercase tracking-wider" style={{ color: nodeColor }}>
                {nodeType}
              </span>
              {nodeTimestamp && (
                <span className="text-xs text-white/25">{nodeTimestamp}</span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">{nodeLabel}</h2>
            {/* v5.5: Signal & Opportunity indicators */}
            {agentResult && (agentResult.signalCount > 0 || agentResult.opportunityCount > 0) && (
              <div className="flex items-center gap-3 mt-1.5">
                {agentResult.signalCount > 0 && (
                  <span className="text-[10px] text-emerald-400/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/50" />
                    {agentResult.signalCount} signal{agentResult.signalCount > 1 ? 's' : ''}
                  </span>
                )}
                {agentResult.opportunityCount > 0 && (
                  <span className="text-[10px] text-amber-400/70 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
                    {agentResult.opportunityCount} opportunit{agentResult.opportunityCount > 1 ? 'ies' : 'y'}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* v5.5: Signal capture button (private only) */}
            {privateMode && (
              <button
                onClick={() => setShowSignalCapture(true)}
                className="p-1.5 hover:bg-white/10 rounded transition-colors"
                title="Capture Signal"
              >
                <svg className="w-4 h-4 text-cyan-400/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
            {onClose && (
              <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded transition-colors">
                <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-5 py-2 border-b border-white/5">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              activeTab === tab.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <>
            {nodeDescription && (
              <p className="text-sm text-white/65 leading-relaxed">{nodeDescription}</p>
            )}

            {/* Agent insights on this node */}
            {agentResult?.insights?.map(insight => (
              <div key={insight.id} className="p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
                <p className="text-xs font-semibold text-cyan-400 mb-1">{insight.headline}</p>
                <p className="text-xs text-white/50 leading-relaxed">{insight.explanation}</p>
                {insight.actionable && (
                  <p className="text-xs text-cyan-400/60 mt-1.5">{insight.actionable}</p>
                )}
              </div>
            ))}

            {/* Skill expansions */}
            {agentResult?.skillExpansions && agentResult.skillExpansions.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Next expansions</h4>
                {agentResult.skillExpansions.map((exp, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                    <div>
                      <span className="text-sm text-white">{exp.toCapability}</span>
                      <p className="text-xs text-white/40">{exp.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-3">
                      <span className="text-xs font-mono text-green-400">{exp.probability}%</span>
                      <p className="text-xs text-white/30">{exp.effort}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* External matches */}
            {agentResult?.externalMatches && agentResult.externalMatches.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">External matches</h4>
                {agentResult.externalMatches.map((match, i) => (
                  <div key={i} className="py-1.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">{match.name}</span>
                      <span className="text-xs font-mono text-amber-400">{match.matchScore}%</span>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{match.relevance}</p>
                    {match.url && (
                      <a href={match.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400/60 hover:text-cyan-400 mt-0.5 block">
                        {match.url.replace('https://', '')} →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* CONNECTIONS TAB */}
        {activeTab === 'connections' && (
          <>
            {connectedNodes.length === 0 ? (
              <p className="text-sm text-white/40">No connections found.</p>
            ) : (
              <div className="space-y-1.5">
                {connectedNodes.map(({ node, edge }) => (
                  <button
                    key={node.id}
                    onClick={() => onNodeSelect?.(node.id)}
                    className="w-full flex items-center gap-3 p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-left group"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: typeColors[node.type] || '#6b7280' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white group-hover:text-cyan-400 transition-colors truncate">{node.label}</div>
                      <div className="text-xs text-white/30 truncate">{(edge as any).relation || 'connected'}</div>
                    </div>
                    <svg className="w-3 h-3 text-white/20 group-hover:text-white/50 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            )}

            {/* Inferred connections (private) */}
            {privateMode && agentResult?.inferredConnections && agentResult.inferredConnections.length > 0 && (
              <div className="mt-4">
                <h4 className="text-xs font-semibold text-purple-400/60 uppercase tracking-wider mb-2">Inferred connections</h4>
                {agentResult.inferredConnections.map((conn, i) => (
                  <div key={i} className="py-1.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-purple-300/70">{conn.targetNodeId.replace(/-/g, ' ')}</span>
                      <span className="text-xs font-mono text-purple-400/60">{conn.confidence}%</span>
                    </div>
                    <p className="text-xs text-white/30 mt-0.5">{conn.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* WORKSPACE TAB */}
        {activeTab === 'workspace' && workspace && (
          <div className="-mx-5 -mt-4">
            <NodeWorkspacePanel workspace={workspace} privateMode={privateMode} />
          </div>
        )}
        {activeTab === 'workspace' && !workspace && (
          <p className="text-sm text-white/30">Generating workspace…</p>
        )}

        {/* AGENT TAB (private only) */}
        {activeTab === 'intelligence' && privateMode && agentResult && (
          <>
            <div className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/20 mb-2">
              <p className="text-xs text-purple-400/70">
                Node agent analysis for <strong>{nodeLabel}</strong>.
                {agentResult.signalCount > 0 && ` ${agentResult.signalCount} signals ingested.`}
                {agentResult.opportunityCount > 0 && ` ${agentResult.opportunityCount} opportunities matched.`}
              </p>
            </div>

            {/* Agent suggestions (v5.5) */}
            {agentResult.agentSuggestions.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Agent suggestions</h4>
                {agentResult.agentSuggestions.map((sug, i) => (
                  <div key={i} className="py-1.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        sug.type === 'opportunity' ? 'bg-amber-500/20 text-amber-300' :
                        sug.type === 'connection' ? 'bg-blue-500/20 text-blue-300' :
                        'bg-green-500/20 text-green-300'
                      }`}>
                        {sug.type}
                      </span>
                      <span className="text-sm text-white">{sug.title}</span>
                      {sug.source && (
                        <span className="text-[10px] text-white/20 ml-auto">{sug.source}</span>
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{sug.description}</p>
                  </div>
                ))}
              </div>
            )}

            {agentResult.suggestedFutureNodes.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Suggested new nodes</h4>
                {agentResult.suggestedFutureNodes.map((sug, i) => (
                  <div key={i} className="py-1.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/5 text-white/30">{sug.type}</span>
                      <span className="text-sm text-white">{sug.label}</span>
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">{sug.reasoning}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Signal Capture Modal */}
      {showSignalCapture && (
        <SignalCapturePanel
          onClose={() => setShowSignalCapture(false)}
          onSignalProcessed={handleSignalProcessed}
        />
      )}
    </div>
  );
}
