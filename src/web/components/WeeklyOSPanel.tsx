/**
 * Weekly OS Panel
 * 
 * Replaces GapsOpportunitiesPanel with compressed 2-4 "next moves"
 * Shows mentor-style recommendations with clear reasoning
 */

import { useState, useEffect } from 'react';
import { X, Calendar, ExternalLink, Clock, TrendingUp } from 'lucide-react';

interface WeeklyMove {
  id: string;
  title: string;
  reasoning: string;
  actionType: 'apply' | 'connect' | 'build';
  actionUrl?: string;
  deadline?: string;
  effort: 'low' | 'medium' | 'high';
  relatedNodes: string[];
}

interface WeeklyOSData {
  success: boolean;
  week: string;
  moves: WeeklyMove[];
  energyMode: 'build' | 'exposure' | 'consolidation' | 'recovery';
  energyMetrics: {
    mode: string;
    score: number;
    recentActivity: {
      events: number;
      projects: number;
      awards: number;
      daysAnalyzed: number;
    };
    reasoning: string;
  };
  overridesSummary: string[];
  generatedAt: string;
}

interface WeeklyOSPanelProps {
  onClose: () => void;
}

export function WeeklyOSPanel({ onClose }: WeeklyOSPanelProps) {
  const [data, setData] = useState<WeeklyOSData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeeklyOS();
  }, []);

  async function fetchWeeklyOS() {
    try {
      setLoading(true);
      const response = await fetch('/api/universe/weekly-os', {
        headers: {
          'X-Universe-Auth': 'laksh-private-2026'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch weekly OS');
      }
      
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function getEnergyModeColor(mode: string): string {
    switch (mode) {
      case 'build': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'exposure': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'consolidation': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'recovery': return 'bg-green-500/10 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  }

  function getEffortLabel(effort: string): string {
    switch (effort) {
      case 'low': return '~30 min';
      case 'medium': return '~2 hours';
      case 'high': return '~1 day';
      default: return 'Variable';
    }
  }

  function getActionLabel(actionType: string): string {
    switch (actionType) {
      case 'apply': return 'Apply';
      case 'connect': return 'Connect';
      case 'build': return 'Build';
      default: return 'View';
    }
  }

  function formatDeadline(deadline: string): string {
    const date = new Date(deadline);
    const now = new Date();
    const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Overdue';
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days <= 7) return `${days} days`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-lg max-w-2xl w-full mx-4">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent)]"></div>
            <span className="text-[var(--text-secondary)]">Generating weekly moves...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-lg max-w-2xl w-full mx-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-red-400">Error</h2>
            <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
              <X size={20} />
            </button>
          </div>
          <p className="text-[var(--text-secondary)]">{error || 'Failed to load weekly OS'}</p>
          <button 
            onClick={fetchWeeklyOS}
            className="mt-4 px-4 py-2 bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/20"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg max-w-3xl w-full my-8">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-2">This Week's Moves</h2>
              <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>Week of {new Date(data.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
                <div className={`px-3 py-1 border rounded-full text-xs font-medium ${getEnergyModeColor(data.energyMode)}`}>
                  {data.energyMode.toUpperCase()} MODE
                </div>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Energy Context */}
          <div className="mt-4 p-4 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded text-sm">
            <p className="text-[var(--text-secondary)]">{data.energyMetrics.reasoning}</p>
            <div className="flex gap-4 mt-2 text-xs text-[var(--text-tertiary)]">
              <span>{data.energyMetrics.recentActivity.events} events</span>
              <span>{data.energyMetrics.recentActivity.projects} projects</span>
              <span>{data.energyMetrics.recentActivity.awards} awards</span>
              <span>(last {data.energyMetrics.recentActivity.daysAnalyzed} days)</span>
            </div>
          </div>

          {/* Overrides Summary */}
          {data.overridesSummary.length > 0 && (
            <div className="mt-4 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded text-sm">
              <div className="font-medium text-yellow-400 mb-2">Active Overrides:</div>
              <ul className="space-y-1 text-[var(--text-secondary)]">
                {data.overridesSummary.map((summary, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-yellow-400">•</span>
                    <span>{summary}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Moves List */}
        <div className="p-6">
          {data.moves.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-secondary)]">
              <TrendingUp size={48} className="mx-auto mb-4 opacity-20" />
              <p>No moves recommended this week.</p>
              <p className="text-sm mt-2">Enjoy the recovery time!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.moves.map((move, idx) => (
                <div 
                  key={move.id}
                  className="p-6 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-lg hover:border-[var(--accent)]/30 transition-colors"
                >
                  {/* Move Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl font-bold text-[var(--accent)]/50">
                          {idx + 1}
                        </span>
                        <h3 className="text-lg font-semibold">{move.title}</h3>
                      </div>
                      <p className="text-[var(--text-secondary)] leading-relaxed">
                        {move.reasoning}
                      </p>
                    </div>
                  </div>

                  {/* Move Metadata */}
                  <div className="flex items-center gap-4 text-sm text-[var(--text-tertiary)] mb-4">
                    {move.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{formatDeadline(move.deadline)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>{getEffortLabel(move.effort)}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  {move.actionUrl && (
                    <a
                      href={move.actionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent)]/20 transition-colors rounded"
                    >
                      <span>{getActionLabel(move.actionType)}</span>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] text-xs text-[var(--text-tertiary)] text-center">
          Generated {new Date(data.generatedAt).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
