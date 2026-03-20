// NodeWorldPanel - NODE=WORLD Full Context Display
// Shows: What, Why, Evidence, Unlocked, Enables, Gaps, Ways to Help, Outreach

import { useState } from 'react';
import type { NodeDetailResponse, NodeWorld, LearningGap, NodeCompleteness } from '@/hooks/useUniverseAPI';
import { generateOutreach, isPrivateMode } from '@/hooks/useUniverseAPI';

interface NodeWorldPanelProps {
  nodeData: NodeDetailResponse;
  onNodeSelect?: (nodeId: string) => void;
  onClose?: () => void;
}

// Evidence type icons
const evidenceIcons: Record<string, string> = {
  link: '🔗',
  video: '▶',
  tweet: '𝕏',
  image: '🖼',
  document: '📄',
};

export function NodeWorldPanel({ nodeData, onNodeSelect, onClose }: NodeWorldPanelProps) {
  const [showOutreachForm, setShowOutreachForm] = useState(false);
  const [outreachContext, setOutreachContext] = useState('');
  const [outreachAsk, setOutreachAsk] = useState('');
  const [generatedOutreach, setGeneratedOutreach] = useState<any>(null);
  const [generating, setGenerating] = useState(false);

  const { node, nodeWorld, cluster, learningGaps, completeness } = nodeData;
  const privateMode = isPrivateMode();

  const handleGenerateOutreach = async () => {
    setGenerating(true);
    const result = await generateOutreach(node.id, outreachContext, outreachAsk);
    if (result?.success) {
      setGeneratedOutreach(result.draft);
    }
    setGenerating(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-cyan-400 uppercase tracking-wider font-medium">
              {node.type}
            </span>
            {node.timestamp && (
              <span className="text-xs text-white/30">{node.timestamp}</span>
            )}
          </div>
          <h2 className="text-xl font-semibold text-white">{node.label}</h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
          >
            <svg className="w-4 h-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Completeness Warning (Private Mode Only) */}
      {privateMode && completeness && !completeness.isComplete && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber-400 text-sm font-medium">Incomplete Node</span>
            <span className="text-xs text-amber-400/70">{completeness.score}% filled</span>
          </div>
          <div className="text-xs text-white/60">
            Missing: {completeness.missingSections.join(', ')}
          </div>
        </div>
      )}

      {/* 1. WHAT THIS NODE IS */}
      {nodeWorld.whatThisIs && (
        <Section title="What this is">
          <p className="text-sm text-white/70 leading-relaxed">{nodeWorld.whatThisIs}</p>
        </Section>
      )}

      {/* 2. WHY IT MATTERS */}
      {nodeWorld.whyItMatters && (
        <Section title="Why it matters">
          <p className="text-sm text-white/70 leading-relaxed">{nodeWorld.whyItMatters}</p>
        </Section>
      )}

      {/* 3. EVIDENCE */}
      {nodeWorld.evidence && nodeWorld.evidence.length > 0 && (
        <Section title="Evidence">
          <div className="space-y-2">
            {nodeWorld.evidence.map((ev, i) => (
              <a
                key={i}
                href={ev.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded transition-colors group"
              >
                <span className="text-sm">{evidenceIcons[ev.type] || '🔗'}</span>
                <span className="text-sm text-white/70 group-hover:text-white flex-1 truncate">
                  {ev.title || ev.url}
                </span>
                <svg className="w-3 h-3 text-white/30 group-hover:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* 4. WHAT IT UNLOCKED */}
      {nodeWorld.whatItUnlocked && nodeWorld.whatItUnlocked.length > 0 && (
        <Section title="What it unlocked">
          <div className="flex flex-wrap gap-1.5">
            {nodeWorld.whatItUnlocked.map((unlocked, i) => (
              <button
                key={i}
                onClick={() => onNodeSelect?.(unlocked.id)}
                className="px-2 py-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 rounded text-xs text-green-400 transition-colors"
              >
                {unlocked.label}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* 5. WHAT IT ENABLES NEXT */}
      {nodeWorld.whatItEnablesNext && nodeWorld.whatItEnablesNext.length > 0 && (
        <Section title="What it enables next">
          <div className="space-y-1.5">
            {nodeWorld.whatItEnablesNext.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                <span className="text-amber-400 mt-0.5">→</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 6. LEARNING GAPS (Private Mode) */}
      {privateMode && nodeWorld.connectedGaps && nodeWorld.connectedGaps.length > 0 && (
        <Section title="Connected Learning Gaps">
          <div className="space-y-2">
            {nodeWorld.connectedGaps.map((gap) => (
              <div key={gap.id} className="p-2 bg-red-500/10 border border-red-500/20 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-red-400 font-medium">{gap.label}</span>
                  <span className="text-xs text-white/40">ROI: {gap.roi_score}</span>
                </div>
                {gap.description && (
                  <p className="text-xs text-white/50">{gap.description}</p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 7. WAYS TO HELP */}
      {nodeWorld.waysToHelp && nodeWorld.waysToHelp.length > 0 && (
        <Section title="Ways someone can help">
          <div className="space-y-1.5">
            {nodeWorld.waysToHelp.map((help, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-white/60">
                <span className="text-cyan-400 mt-0.5">•</span>
                <span>{help}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 8. GENERATE OUTREACH (Private Mode, Person/Org nodes) */}
      {privateMode && (node.type === 'person' || node.type === 'organization') && (
        <Section title="Outreach">
          {!showOutreachForm && !generatedOutreach && (
            <button
              onClick={() => setShowOutreachForm(true)}
              className="w-full p-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded text-sm text-cyan-400 transition-colors"
            >
              Generate Outreach Draft
            </button>
          )}

          {showOutreachForm && !generatedOutreach && (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-white/50 block mb-1">Context (optional)</label>
                <textarea
                  value={outreachContext}
                  onChange={(e) => setOutreachContext(e.target.value)}
                  placeholder="Why are you reaching out?"
                  className="w-full p-2 bg-white/5 border border-white/10 rounded text-sm text-white/80 placeholder:text-white/30 resize-none"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-xs text-white/50 block mb-1">Specific Ask (optional)</label>
                <textarea
                  value={outreachAsk}
                  onChange={(e) => setOutreachAsk(e.target.value)}
                  placeholder="What would you like from them?"
                  className="w-full p-2 bg-white/5 border border-white/10 rounded text-sm text-white/80 placeholder:text-white/30 resize-none"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowOutreachForm(false)}
                  className="flex-1 p-2 bg-white/5 hover:bg-white/10 rounded text-sm text-white/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateOutreach}
                  disabled={generating}
                  className="flex-1 p-2 bg-cyan-500/20 hover:bg-cyan-500/30 rounded text-sm text-cyan-400 transition-colors disabled:opacity-50"
                >
                  {generating ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          )}

          {generatedOutreach && (
            <div className="space-y-3">
              <div className="p-3 bg-white/5 rounded">
                <div className="text-xs text-white/50 mb-1">Subject</div>
                <div className="text-sm text-white/80">{generatedOutreach.subject}</div>
              </div>
              <div className="p-3 bg-white/5 rounded">
                <div className="text-xs text-white/50 mb-1">Draft</div>
                <pre className="text-sm text-white/70 whitespace-pre-wrap font-sans">{generatedOutreach.draft}</pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedOutreach.draft);
                }}
                className="w-full p-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded text-sm text-cyan-400 transition-colors"
              >
                Copy to Clipboard
              </button>
            </div>
          )}
        </Section>
      )}

      {/* Cluster Info */}
      {cluster && (
        <div 
          className="p-3 rounded-lg border"
          style={{ 
            borderColor: `${cluster.color}40`,
            backgroundColor: `${cluster.color}10`
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cluster.color }} />
            <span className="text-sm font-medium" style={{ color: cluster.color }}>
              {cluster.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/50">
            <span>Level {cluster.level}</span>
            <span>•</span>
            <span>{cluster.growth_rate?.toFixed(1) || 0} proj/mo</span>
          </div>
        </div>
      )}

      {/* URL Link */}
      {node.url && (
        <a
          href={node.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 p-2 bg-white/5 hover:bg-white/10 rounded text-sm text-cyan-400 transition-colors"
        >
          Visit
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  );
}

// Section component
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

export default NodeWorldPanel;
