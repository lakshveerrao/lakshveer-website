// ============================================
// SIGNAL CAPTURE PANEL — Universe v5.5
// Admin-only quick entry for external signals
// Only visible in private mode
// ============================================

import { useState } from 'react';
import { quickCapture } from '../../../intelligence/universe-brain';
import { nodes } from '../../data/universe-data';
import type { SignalSource } from '../../../intelligence/signal-engine';

interface SignalCapturePanelProps {
  onClose: () => void;
  onSignalProcessed?: (result: { signalId: string; mappedNodeIds: string[]; opportunitiesFound: number }) => void;
}

const SOURCE_OPTIONS: { value: SignalSource; label: string; emoji: string }[] = [
  { value: 'youtube', label: 'YouTube', emoji: '📺' },
  { value: 'article', label: 'Article', emoji: '📰' },
  { value: 'event', label: 'Event', emoji: '🎪' },
  { value: 'website', label: 'Website', emoji: '🌐' },
];

export function SignalCapturePanel({ onClose, onSignalProcessed }: SignalCapturePanelProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState<SignalSource>('website');
  const [relatedNodeId, setRelatedNodeId] = useState('');
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<{ signalId: string; mappedNodeIds: string[]; opportunitiesFound: number } | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) return;

    setProcessing(true);
    try {
      const res = quickCapture({
        url: url.trim(),
        source,
        title: title.trim(),
        relatedNodeId: relatedNodeId || undefined,
        notes: notes.trim() || undefined,
      });
      setResult(res);
      onSignalProcessed?.(res);
    } finally {
      setProcessing(false);
    }
  };

  const handleReset = () => {
    setUrl('');
    setTitle('');
    setSource('website');
    setRelatedNodeId('');
    setNotes('');
    setResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0a0a0f] border border-white/10 rounded-xl w-[420px] max-h-[80vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h3 className="text-sm font-bold text-white">Capture Signal</h3>
            <p className="text-xs text-white/30 mt-0.5">Feed intelligence into the Universe</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded transition-colors">
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        {!result ? (
          <div className="px-5 py-4 space-y-4">
            {/* Title */}
            <div>
              <label className="text-xs font-medium text-white/50 mb-1.5 block">Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="What happened? e.g. Won robotics hackathon"
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Source */}
            <div>
              <label className="text-xs font-medium text-white/50 mb-1.5 block">Source</label>
              <div className="flex gap-1.5">
                {SOURCE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSource(opt.value)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      source === opt.value
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-white/5 text-white/40 border border-white/5 hover:text-white/60'
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* URL */}
            <div>
              <label className="text-xs font-medium text-white/50 mb-1.5 block">URL</label>
              <input
                type="url"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Related Node */}
            <div>
              <label className="text-xs font-medium text-white/50 mb-1.5 block">Related Node</label>
              <select
                value={relatedNodeId}
                onChange={e => setRelatedNodeId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-white/30"
              >
                <option value="">Auto-detect</option>
                {nodes
                  .filter(n => n.type !== 'possibility')
                  .sort((a, b) => a.label.localeCompare(b.label))
                  .map(n => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))
                }
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="text-xs font-medium text-white/50 mb-1.5 block">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Additional context..."
                rows={3}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 resize-none"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || processing}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
                title.trim() && !processing
                  ? 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30'
                  : 'bg-white/5 text-white/20 border border-white/5 cursor-not-allowed'
              }`}
            >
              {processing ? 'Processing…' : '⚡ Process Signal'}
            </button>
          </div>
        ) : (
          /* Result */
          <div className="px-5 py-4 space-y-4">
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-sm font-semibold text-emerald-400 mb-2">✓ Signal Processed</p>
              <div className="space-y-1.5">
                <p className="text-xs text-white/50">
                  <span className="text-white/70">Mapped to:</span>{' '}
                  {result.mappedNodeIds.length > 0
                    ? result.mappedNodeIds.map(id => {
                        const node = nodes.find(n => n.id === id);
                        return node?.label || id;
                      }).join(', ')
                    : 'No nodes matched'
                  }
                </p>
                <p className="text-xs text-white/50">
                  <span className="text-white/70">Opportunities found:</span>{' '}
                  {result.opportunitiesFound}
                </p>
                <p className="text-xs text-white/30 mt-2">
                  Workspace caches invalidated. Changes visible on next node open.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2 rounded-lg text-xs font-medium bg-white/5 text-white/50 hover:text-white/80 border border-white/5 transition-all"
              >
                Add Another
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-2 rounded-lg text-xs font-medium bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
