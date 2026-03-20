// ============================================
// HEALTH MONITOR — Universe v6.5
// Private mode only — shows system health issues
// ============================================

import React, { useMemo } from 'react';
import { generateHealthReport } from '../../../intelligence/system-health';
import type { HealthStatus } from '../../../intelligence/system-health';

const STATUS_COLOR: Record<HealthStatus, string> = {
  healthy: 'text-emerald-400',
  warning: 'text-amber-400',
  critical: 'text-red-400',
};

const STATUS_BG: Record<HealthStatus, string> = {
  healthy: 'bg-emerald-500/10 border-emerald-500/20',
  warning: 'bg-amber-500/10 border-amber-500/20',
  critical: 'bg-red-500/10 border-red-500/20',
};

const SEVERITY_DOT: Record<HealthStatus, string> = {
  healthy: 'bg-emerald-500',
  warning: 'bg-amber-500',
  critical: 'bg-red-500',
};

export function HealthMonitor() {
  const report = useMemo(() => generateHealthReport(), []);

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">System Health</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Universe intelligence diagnostics</p>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-medium ${STATUS_BG[report.status]}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${SEVERITY_DOT[report.status]}`} />
          <span className={STATUS_COLOR[report.status]}>
            {report.status === 'healthy' ? 'Healthy' : report.status === 'warning' ? 'Warning' : 'Critical'}
          </span>
        </div>
      </div>

      {/* Score bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-zinc-400">Health Score</span>
          <span className={STATUS_COLOR[report.status]}>{report.score}/100</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              report.score >= 80 ? 'bg-emerald-500' :
              report.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
            }`}
            style={{ width: `${report.score}%` }}
          />
        </div>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Signals" value={report.summary.totalSignals} />
        <StatCard label="Covered Nodes" value={report.summary.coveredNodes} />
        <StatCard label="Uncovered" value={report.summary.uncoveredNodes} warn={report.summary.uncoveredNodes > 5} />
        <StatCard label="Empty Clusters" value={report.summary.emptyClusters} warn={report.summary.emptyClusters > 0} />
        <StatCard label="Low Conf %" value={`${report.summary.lowConfidenceRatio}%`} warn={report.summary.lowConfidenceRatio > 50} />
        <StatCard label="Dupes Blocked" value={report.summary.duplicatesBlocked} good={report.summary.duplicatesBlocked > 0} />
      </div>

      {/* Issues */}
      {report.issues.length === 0 ? (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
          <span>✅</span>
          <span>No issues detected. Intelligence system is operating normally.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wide">Issues ({report.issues.length})</p>
          {report.issues.map(issue => (
            <div
              key={issue.id}
              className={`flex flex-col gap-1.5 p-3 rounded-lg border text-xs ${STATUS_BG[issue.severity]}`}
            >
              <div className="flex items-start gap-2">
                <span className={`w-1.5 h-1.5 rounded-full mt-0.5 flex-shrink-0 ${SEVERITY_DOT[issue.severity]}`} />
                <div className="flex-1">
                  <p className="text-white/90 font-medium leading-snug">{issue.title}</p>
                  <p className="text-zinc-400 mt-0.5 leading-relaxed">{issue.description}</p>
                  {issue.affectedItems && issue.affectedItems.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {issue.affectedItems.map(item => (
                        <span key={item} className="px-1.5 py-0.5 bg-zinc-800/60 rounded text-zinc-500 text-[10px]">
                          {item.replace(/-/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                  {issue.suggestion && (
                    <p className="text-zinc-500 mt-1.5 italic">{issue.suggestion}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checked at */}
      <p className="text-[10px] text-zinc-600 text-center">
        Checked at {new Date(report.checkedAt).toLocaleTimeString()}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
  warn = false,
  good = false,
}: {
  label: string;
  value: string | number;
  warn?: boolean;
  good?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 p-2 rounded-lg bg-zinc-900/50 border border-zinc-800/60">
      <span className={`text-sm font-semibold ${warn ? 'text-amber-400' : good ? 'text-emerald-400' : 'text-white'}`}>
        {value}
      </span>
      <span className="text-[10px] text-zinc-500 leading-tight">{label}</span>
    </div>
  );
}

export default HealthMonitor;
