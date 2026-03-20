// ============================================
// GUIDED JOURNEY COMPONENT
// Animated story through Lakshveer's milestones
// ============================================

import { useState, useEffect, useRef } from 'react';
import { journeyChapters, emotionStyles, yearSummaries, type JourneyChapter } from '../../../experience/guided-journey';

interface GuidedJourneyProps {
  onNodeHighlight?: (nodeIds: string[]) => void;
  onClose?: () => void;
}

export function GuidedJourney({ onNodeHighlight, onClose }: GuidedJourneyProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [appeared, setAppeared] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const current = journeyChapters[currentIndex];
  const style = emotionStyles[current.emotion];

  useEffect(() => {
    setAppeared(false);
    const t = setTimeout(() => setAppeared(true), 50);
    return () => clearTimeout(t);
  }, [currentIndex]);

  useEffect(() => {
    if (onNodeHighlight) onNodeHighlight(current.nodeIds);
  }, [currentIndex]);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(i => {
          if (i >= journeyChapters.length - 1) {
            setIsPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, 4500);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  const goTo = (idx: number) => {
    setIsPlaying(false);
    setCurrentIndex(Math.max(0, Math.min(journeyChapters.length - 1, idx)));
  };

  return (
    <div className="h-full flex flex-col bg-[#050508] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-wider">Guided Journey</h2>
          <p className="text-xs text-white/30 mt-0.5">The story behind the graph</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded transition-colors">
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Main Chapter Card */}
      <div className="flex-1 px-5 flex flex-col justify-center">
        <div
          className="rounded-xl border p-5 transition-all duration-500"
          style={{
            borderColor: `${style.color}40`,
            backgroundColor: style.bgColor,
            opacity: appeared ? 1 : 0,
            transform: appeared ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          {/* Emotion tag */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">{style.icon}</span>
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: style.color }}>
              {style.label}
            </span>
            <span className="text-xs text-white/30 ml-auto">{current.date}</span>
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-white mb-2">{current.title}</h3>

          {/* Description */}
          <p className="text-sm text-white/70 leading-relaxed mb-4">{current.description}</p>

          {/* Stat highlight */}
          {current.stat && (
            <div
              className="inline-flex flex-col items-center px-4 py-2 rounded-lg"
              style={{ backgroundColor: `${style.color}15`, border: `1px solid ${style.color}30` }}
            >
              <span className="text-2xl font-bold" style={{ color: style.color }}>{current.stat.value}</span>
              <span className="text-xs text-white/50 mt-0.5">{current.stat.label}</span>
            </div>
          )}

          {/* Node pills */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {current.nodeIds.slice(0, 4).map(id => (
              <span
                key={id}
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${style.color}20`, color: style.color }}
              >
                {id.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="px-5 py-3">
        <div className="flex items-center gap-1.5 justify-center mb-3">
          {journeyChapters.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentIndex ? '20px' : '6px',
                height: '6px',
                backgroundColor: i === currentIndex ? style.color : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => goTo(currentIndex - 1)}
            disabled={currentIndex === 0}
            className="flex-1 py-2 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ backgroundColor: `${style.color}20`, color: style.color }}
          >
            {isPlaying ? (
              <><span>⏸</span> Pause</>
            ) : (
              <><span>▶</span> Play</>
            )}
          </button>

          <button
            onClick={() => goTo(currentIndex + 1)}
            disabled={currentIndex === journeyChapters.length - 1}
            className="flex-1 py-2 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>

        {/* Chapter counter */}
        <p className="text-center text-xs text-white/30 mt-2">
          {currentIndex + 1} of {journeyChapters.length}
        </p>
      </div>
    </div>
  );
}
