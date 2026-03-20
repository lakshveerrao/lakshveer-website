// ============================================
// UNIVERSE SYSTEM HEALTH MONITOR — v6.5
// Detects structural problems in the intelligence system
// Private mode only
// ============================================

import SignalStore from '../data/signal-store';
import { nodes } from '../web/data/universe-data';
import { capabilityClusters } from '../web/data/universe-intelligence';
import { mapSignalToNodes } from './signal-engine';

// ============================================
// TYPES
// ============================================

export type HealthStatus = 'healthy' | 'warning' | 'critical';

export interface HealthIssue {
  id: string;
  severity: HealthStatus;
  category: 'signals' | 'nodes' | 'clusters' | 'coverage';
  title: string;
  description: string;
  affectedItems?: string[];
  suggestion?: string;
}

export interface SystemHealthReport {
  status: HealthStatus;
  score: number; // 0–100
  issues: HealthIssue[];
  checkedAt: string;
  summary: {
    totalSignals: number;
    coveredNodes: number;
    uncoveredNodes: number;
    emptyClusters: number;
    lowConfidenceRatio: number;
    duplicatesBlocked: number;
  };
}

// ============================================
// HEALTH CHECKS
// ============================================

function checkSignalDensity(issues: HealthIssue[]): void {
  const stats = SignalStore.getStats();

  // Too few signals
  if (stats.total < 5) {
    issues.push({
      id: 'health-low-signal-count',
      severity: 'critical',
      category: 'signals',
      title: 'Very few signals in the system',
      description: `Only ${stats.total} signal(s) detected. Intelligence accuracy is low.`,
      suggestion: 'Add at least 10 signals via Signal Capture to improve pattern detection.',
    });
  } else if (stats.total < 10) {
    issues.push({
      id: 'health-signal-count-warning',
      severity: 'warning',
      category: 'signals',
      title: 'Low signal count',
      description: `${stats.total} signals is below the recommended minimum of 10.`,
      suggestion: 'Add more signals to improve opportunity and pattern detection.',
    });
  }

  // Low confidence ratio
  const lowCount = stats.byConfidence['low'] || 0;
  const lowRatio = stats.total > 0 ? lowCount / stats.total : 0;
  if (lowRatio > 0.5) {
    issues.push({
      id: 'health-low-confidence-dominance',
      severity: 'warning',
      category: 'signals',
      title: 'Too many low-confidence signals',
      description: `${Math.round(lowRatio * 100)}% of signals are low-confidence (manual notes). This reduces pattern accuracy.`,
      suggestion: 'Prioritize adding press articles and event signals (high confidence).',
    });
  }
}

function checkNodeCoverage(issues: HealthIssue[]): void {
  const signals = SignalStore.getAllSignals();
  const coveredNodeIds = new Set<string>();

  for (const signal of signals) {
    const mapped = mapSignalToNodes(signal);
    for (const id of mapped) coveredNodeIds.add(id);
  }

  const allNodeIds = nodes.map(n => n.id);
  const uncovered = allNodeIds.filter(id => !coveredNodeIds.has(id));
  const uncoveredRatio = allNodeIds.length > 0 ? uncovered.length / allNodeIds.length : 0;

  if (uncoveredRatio > 0.7) {
    issues.push({
      id: 'health-low-node-coverage',
      severity: 'warning',
      category: 'nodes',
      title: 'Most nodes have no signal coverage',
      description: `${uncovered.length} of ${allNodeIds.length} nodes have zero signal connections.`,
      affectedItems: uncovered.slice(0, 5),
      suggestion: 'Add signals mentioning key projects and skills to improve coverage.',
    });
  }

  // Inactive nodes — in graph but no recent signals
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const recentlyCovered = new Set<string>();
  for (const signal of signals) {
    if (signal.date && new Date(signal.date) >= threeMonthsAgo) {
      const mapped = mapSignalToNodes(signal);
      for (const id of mapped) recentlyCovered.add(id);
    }
  }

  const inactiveNodes = nodes
    .filter(n => n.type === 'project' || n.type === 'product')
    .filter(n => !recentlyCovered.has(n.id))
    .map(n => n.label);

  if (inactiveNodes.length > 5) {
    issues.push({
      id: 'health-inactive-nodes',
      severity: 'warning',
      category: 'nodes',
      title: 'Several projects have no recent activity',
      description: `${inactiveNodes.length} projects/products have no signals in the last 3 months.`,
      affectedItems: inactiveNodes.slice(0, 5),
      suggestion: 'Consider adding a progress signal or archiving stale projects.',
    });
  }
}

function checkClusterHealth(issues: HealthIssue[]): void {
  const signals = SignalStore.getAllSignals();
  const coveredDomains = new Set<string>();
  for (const signal of signals) {
    (signal.domains || []).forEach(d => coveredDomains.add(d));
    (signal.entities || []).forEach(e => coveredDomains.add(e));
  }

  const emptyClusters = capabilityClusters.filter(cluster => {
    return !cluster.nodeIds.some(id => coveredDomains.has(id));
  });

  if (emptyClusters.length > 0) {
    issues.push({
      id: 'health-empty-clusters',
      severity: 'warning',
      category: 'clusters',
      title: `${emptyClusters.length} cluster(s) have no signal coverage`,
      description: 'Clusters without signals cannot generate opportunity matches.',
      affectedItems: emptyClusters.map(c => c.name).slice(0, 5),
      suggestion: 'Add at least one signal touching each cluster.',
    });
  }
}

function checkDuplicateSignals(issues: HealthIssue[]): void {
  const stats = SignalStore.getStats();
  if (stats.duplicatesBlocked > 0) {
    issues.push({
      id: 'health-duplicates-blocked',
      severity: 'healthy',
      category: 'signals',
      title: `${stats.duplicatesBlocked} duplicate(s) blocked`,
      description: 'Signal deduplication is working correctly.',
    });
  }
}

// ============================================
// MAIN REPORT GENERATOR
// ============================================

export function generateHealthReport(): SystemHealthReport {
  const issues: HealthIssue[] = [];

  checkSignalDensity(issues);
  checkNodeCoverage(issues);
  checkClusterHealth(issues);
  checkDuplicateSignals(issues);

  // Compute overall score
  const criticals = issues.filter(i => i.severity === 'critical').length;
  const warnings = issues.filter(i => i.severity === 'warning').length;
  const score = Math.max(0, 100 - criticals * 25 - warnings * 10);

  const status: HealthStatus =
    criticals > 0 ? 'critical' : warnings > 0 ? 'warning' : 'healthy';

  // Summary stats
  const signals = SignalStore.getAllSignals();
  const allNodeIds = new Set(nodes.map(n => n.id));
  const coveredIds = new Set<string>();
  for (const s of signals) {
    mapSignalToNodes(s).forEach(id => coveredIds.add(id));
  }
  const uncoveredCount = [...allNodeIds].filter(id => !coveredIds.has(id)).length;

  const emptyClusters = capabilityClusters.filter(
    c => !c.nodeIds.some(id => coveredIds.has(id))
  ).length;

  const stats = SignalStore.getStats();
  const lowRatio = stats.total > 0 ? ((stats.byConfidence['low'] || 0) / stats.total) : 0;

  return {
    status,
    score,
    issues: issues.filter(i => i.severity !== 'healthy'), // show actionable issues only
    checkedAt: new Date().toISOString(),
    summary: {
      totalSignals: stats.total,
      coveredNodes: coveredIds.size,
      uncoveredNodes: uncoveredCount,
      emptyClusters,
      lowConfidenceRatio: Math.round(lowRatio * 100),
      duplicatesBlocked: stats.duplicatesBlocked,
    },
  };
}
