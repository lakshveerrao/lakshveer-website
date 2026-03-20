// ============================================
// PARTICIPATION GATEWAY — Universe v6
// Intelligence-driven role-based collaboration paths
// Uses participation-engine for live data
// ============================================

import { useState } from 'react';
import {
  generateParticipationPaths,
  getAllRoles,
  type ParticipationPath,
  type ParticipationRole,
} from '../../../intelligence/participation-engine';

interface ParticipationGatewayProps {
  onClose?: () => void;
  embedded?: boolean; // true when shown below the graph (no close button, wider layout)
}

const ROLE_DISPLAY: Record<ParticipationRole, { emoji: string; label: string }> = {
  Engineer:  { emoji: '⚙️', label: 'Engineer / Builder' },
  Investor:  { emoji: '💼', label: 'VC / Investor' },
  School:    { emoji: '🏫', label: 'School / Educator' },
  Organizer: { emoji: '🏁', label: 'Hackathon Organizer' },
  Sponsor:   { emoji: '🤝', label: 'Sponsor / Brand' },
  Media:     { emoji: '📰', label: 'Media / Journalist' },
  Mentor:    { emoji: '🧭', label: 'Mentor / Expert' },
  Parent:    { emoji: '👨‍👩‍👧', label: 'Parent' },
};

export function ParticipationGateway({ onClose, embedded = false }: ParticipationGatewayProps) {
  const [selectedRole, setSelectedRole] = useState<ParticipationRole | null>(null);
  const [path, setPath] = useState<ParticipationPath | null>(null);
  const roles = getAllRoles();

  const handleRoleSelect = (role: ParticipationRole) => {
    setSelectedRole(role);
    const generated = generateParticipationPaths(role);
    setPath(generated);
  };

  const handleBack = () => {
    setSelectedRole(null);
    setPath(null);
  };

  if (embedded) {
    // ── Embedded mode: shown below the graph on the public page ──
    return (
      <section className="w-full bg-[#050508] border-t border-white/5 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Prompt */}
          {!selectedRole ? (
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">How can you be part of this journey?</h2>
              <p className="text-sm text-white/40">I am a…</p>
            </div>
          ) : (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors mb-6"
            >
              ← Choose a different role
            </button>
          )}

          {/* Role Selection Grid */}
          {!selectedRole && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {roles.map(role => {
                const display = ROLE_DISPLAY[role];
                return (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className="flex flex-col items-center gap-2 p-4 bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.12] rounded-xl transition-all group"
                  >
                    <span className="text-2xl">{display.emoji}</span>
                    <span className="text-xs font-medium text-white/60 group-hover:text-white transition-colors text-center">
                      {display.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected Role — Path Display */}
          {selectedRole && path && (
            <EmbeddedPathDisplay path={path} display={ROLE_DISPLAY[selectedRole]} />
          )}
        </div>
      </section>
    );
  }

  // ── Panel mode: shown in right panel ──
  return (
    <div className="h-full flex flex-col bg-[#050508] text-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/10">
        <div>
          <h2 className="text-base font-bold text-white">How can I participate?</h2>
          <p className="text-xs text-white/40 mt-0.5">Find your place in this universe</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded transition-colors">
            <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Roles Grid or Detail */}
      {!selectedRole ? (
        <div className="px-5 py-4 space-y-2">
          {roles.map(role => {
            const display = ROLE_DISPLAY[role];
            return (
              <button
                key={role}
                onClick={() => handleRoleSelect(role)}
                className="w-full flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/15 rounded-xl transition-all text-left group"
              >
                <span className="text-2xl">{display.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                    {display.label}
                  </div>
                </div>
                <svg className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          })}
        </div>
      ) : path ? (
        <PanelPathDisplay path={path} display={ROLE_DISPLAY[selectedRole]} onBack={handleBack} />
      ) : null}

      {/* Footer */}
      <div className="mt-auto px-5 py-4 border-t border-white/5">
        <p className="text-xs text-white/30 text-center">Every conversation here has produced something real.</p>
      </div>
    </div>
  );
}

// ============================================
// PATH DISPLAY — Panel version (right sidebar)
// ============================================

function PanelPathDisplay({
  path,
  display,
  onBack,
}: {
  path: ParticipationPath;
  display: { emoji: string; label: string };
  onBack: () => void;
}) {
  return (
    <div className="px-5 py-4 space-y-4 flex-1 overflow-y-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
      >
        ← All roles
      </button>

      {/* Role header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{display.emoji}</span>
        <h3 className="text-xl font-bold text-white">{display.label}</h3>
      </div>

      {/* Why this matters */}
      <div>
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Why this matters</h4>
        <p className="text-sm text-white/70 leading-relaxed">{path.whyRelevant}</p>
      </div>

      {/* Ways to help */}
      <div>
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Ways you can help</h4>
        <ul className="space-y-1.5">
          {path.waysToHelp.map((way, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/60">
              <span className="text-cyan-400/60 mt-0.5">•</span>
              <span>{way}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Suggested actions */}
      <div>
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">Suggested actions</h4>
        <ul className="space-y-1.5">
          {path.suggestedActions.map((action, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-white/60">
              <span className="text-emerald-400/60 mt-0.5">→</span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Connect button */}
      {path.contactUrl && (
        <a
          href={path.contactUrl}
          target={path.contactUrl.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium hover:bg-cyan-500/30 transition-colors"
        >
          Connect →
        </a>
      )}
    </div>
  );
}

// ============================================
// PATH DISPLAY — Embedded version (below graph)
// ============================================

function EmbeddedPathDisplay({
  path,
  display,
}: {
  path: ParticipationPath;
  display: { emoji: string; label: string };
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">{display.emoji}</span>
        <h3 className="text-xl font-bold text-white">{display.label}</h3>
      </div>

      {/* Three columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Why this matters */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <h4 className="text-xs font-semibold text-cyan-400/70 uppercase tracking-wider mb-2">Why this matters</h4>
          <p className="text-sm text-white/60 leading-relaxed">{path.whyRelevant}</p>
        </div>

        {/* Ways to help */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <h4 className="text-xs font-semibold text-emerald-400/70 uppercase tracking-wider mb-2">Ways you can help</h4>
          <ul className="space-y-1.5">
            {path.waysToHelp.slice(0, 4).map((way, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                <span className="text-cyan-400/50 mt-0.5 text-xs">•</span>
                <span>{way}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Suggested actions */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <h4 className="text-xs font-semibold text-amber-400/70 uppercase tracking-wider mb-2">Suggested actions</h4>
          <ul className="space-y-1.5">
            {path.suggestedActions.slice(0, 4).map((action, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/60">
                <span className="text-emerald-400/50 mt-0.5 text-xs">→</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
          {path.contactUrl && (
            <a
              href={path.contactUrl}
              target={path.contactUrl.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 mt-3 text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
            >
              Connect →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
