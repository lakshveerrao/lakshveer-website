// ClusterScoreCard - Shows computed cluster scores with formula transparency
// Displays: Level, Score breakdown, Growth Velocity, Formula (private mode)

import type { EnrichedCluster } from '@/hooks/useUniverseAPI';
import { isPrivateMode } from '@/hooks/useUniverseAPI';

interface ClusterScoreCardProps {
  cluster: EnrichedCluster;
  onClick?: () => void;
  expanded?: boolean;
}

export function ClusterScoreCard({ cluster, onClick, expanded = false }: ClusterScoreCardProps) {
  const privateMode = isPrivateMode();
  const level = cluster.computedLevel || cluster.level;
  const score = cluster.computedScore || 0;

  // Level indicator bars
  const levelBars = Array.from({ length: 5 }, (_, i) => i < level);

  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-lg border transition-all cursor-pointer ${
        expanded ? 'bg-white/10' : 'bg-white/5 hover:bg-white/10'
      }`}
      style={{ borderColor: `${cluster.color}40` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: cluster.color }} 
          />
          <span className="font-medium text-white">{cluster.label}</span>
        </div>
        <div className="text-right">
          <div className="text-lg font-semibold" style={{ color: cluster.color }}>
            L{level}
          </div>
          {privateMode && (
            <div className="text-xs text-white/40">{score.toFixed(1)}/100</div>
          )}
        </div>
      </div>

      {/* Level Bars */}
      <div className="flex gap-1 mb-3">
        {levelBars.map((filled, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full transition-colors"
            style={{
              backgroundColor: filled ? cluster.color : 'rgba(255,255,255,0.1)',
            }}
          />
        ))}
      </div>

      {/* Stats Row */}
      <div className="flex items-center gap-4 text-xs text-white/50 mb-2">
        <span>{cluster.nodeCount || 0} nodes</span>
        <span>•</span>
        <span>{(cluster.growthVelocity || cluster.growth_rate || 0).toFixed(1)} proj/mo</span>
      </div>

      {/* Score Breakdown (Private Mode + Expanded) */}
      {privateMode && expanded && cluster.scoreComponents && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">
            Score Breakdown
          </div>
          
          <div className="space-y-2">
            <ScoreBar 
              label="Complexity" 
              value={cluster.scoreComponents.complexity} 
              color="#22d3ee" 
              weight={0.25}
            />
            <ScoreBar 
              label="Cross-cluster" 
              value={cluster.scoreComponents.crossCluster} 
              color="#a855f7" 
              weight={0.20}
            />
            <ScoreBar 
              label="Recency" 
              value={cluster.scoreComponents.recency} 
              color="#10b981" 
              weight={0.20}
            />
            <ScoreBar 
              label="Validation" 
              value={cluster.scoreComponents.validation} 
              color="#f59e0b" 
              weight={0.20}
            />
            <ScoreBar 
              label="Depth" 
              value={cluster.scoreComponents.depth} 
              color="#ec4899" 
              weight={0.15}
            />
          </div>

          {/* Formula */}
          {cluster.formula && (
            <div className="mt-4 p-2 bg-white/5 rounded text-xs text-white/40 font-mono">
              {cluster.formula}
            </div>
          )}
        </div>
      )}

      {/* Growth Velocity Indicator */}
      {cluster.growthVelocity > 0 && (
        <div className="mt-2 flex items-center gap-1">
          <svg 
            className="w-3 h-3" 
            fill="none" 
            stroke={cluster.growthVelocity > 1 ? '#22d3ee' : '#64748b'} 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
            />
          </svg>
          <span className={`text-xs ${cluster.growthVelocity > 1 ? 'text-cyan-400' : 'text-white/40'}`}>
            {cluster.growthVelocity > 2 ? 'High velocity' : 
             cluster.growthVelocity > 1 ? 'Growing' : 
             cluster.growthVelocity > 0.5 ? 'Active' : 'Slow'}
          </span>
        </div>
      )}
    </div>
  );
}

// Score bar component
function ScoreBar({ 
  label, 
  value, 
  color, 
  weight 
}: { 
  label: string; 
  value: number; 
  color: string; 
  weight: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 text-xs text-white/50">{label}</div>
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all"
          style={{ 
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="w-10 text-xs text-white/40 text-right">
        {value.toFixed(0)}
      </div>
      <div className="w-8 text-xs text-white/30 text-right">
        ×{weight}
      </div>
    </div>
  );
}

// Compact version for lists
export function ClusterScoreCardCompact({ cluster }: { cluster: EnrichedCluster }) {
  const level = cluster.computedLevel || cluster.level;
  
  return (
    <div 
      className="flex items-center gap-3 p-2 bg-white/5 rounded"
      style={{ borderLeft: `3px solid ${cluster.color}` }}
    >
      <div className="flex-1">
        <div className="text-sm text-white/80">{cluster.label}</div>
        <div className="text-xs text-white/40">
          {cluster.nodeCount || 0} nodes • {(cluster.growthVelocity || cluster.growth_rate || 0).toFixed(1)} proj/mo
        </div>
      </div>
      <div className="text-lg font-semibold" style={{ color: cluster.color }}>
        L{level}
      </div>
    </div>
  );
}

export default ClusterScoreCard;
