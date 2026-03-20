/**
 * Human Override System
 * 
 * Allows manual control of weekly opportunity compression:
 * - Pause entire category for a week ("No hackathons this week")
 * - Force-include specific opportunity ("Must apply to YC")
 * - Override energy mode ("Set to recovery, ignore calendar")
 * 
 * All overrides are week-specific and include human reasoning
 */

import type { D1Database } from '@cloudflare/workers-types';
import { formatDate } from './energy-check';

export interface WeeklyOverride {
  id: string;
  weekStart: string; // YYYY-MM-DD
  type: 'pause_category' | 'force_include' | 'set_energy_mode';
  reason: string;
  config: PauseCategoryConfig | ForceIncludeConfig | SetEnergyModeConfig;
  createdBy: string;
  createdAt: string;
}

interface PauseCategoryConfig {
  category: string; // 'hackathon', 'grant', 'speaking', etc.
}

interface ForceIncludeConfig {
  opportunityId: string;
  opportunityTitle?: string;
}

interface SetEnergyModeConfig {
  mode: 'build' | 'exposure' | 'consolidation' | 'recovery';
}

/**
 * Get all overrides for a specific week
 */
export async function getWeeklyOverrides(
  db: D1Database,
  weekStart: Date
): Promise<WeeklyOverride[]> {
  const weekStartStr = formatDate(weekStart);
  
  const result = await db.prepare(`
    SELECT * FROM weekly_overrides
    WHERE week_start = ?
    ORDER BY created_at DESC
  `).bind(weekStartStr).all<{
    id: string;
    week_start: string;
    type: string;
    reason: string;
    config: string;
    created_by: string;
    created_at: string;
  }>();
  
  return (result.results || []).map(row => ({
    id: row.id,
    weekStart: row.week_start,
    type: row.type as WeeklyOverride['type'],
    reason: row.reason,
    config: JSON.parse(row.config),
    createdBy: row.created_by,
    createdAt: row.created_at
  }));
}

/**
 * Create a new override
 */
export async function createOverride(
  db: D1Database,
  weekStart: Date,
  type: WeeklyOverride['type'],
  reason: string,
  config: PauseCategoryConfig | ForceIncludeConfig | SetEnergyModeConfig,
  createdBy: string = 'venkat'
): Promise<WeeklyOverride> {
  const id = `override-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const weekStartStr = formatDate(weekStart);
  const configStr = JSON.stringify(config);
  
  await db.prepare(`
    INSERT INTO weekly_overrides (id, week_start, type, reason, config, created_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, weekStartStr, type, reason, configStr, createdBy).run();
  
  return {
    id,
    weekStart: weekStartStr,
    type,
    reason,
    config,
    createdBy,
    createdAt: new Date().toISOString()
  };
}

/**
 * Delete an override
 */
export async function deleteOverride(
  db: D1Database,
  overrideId: string
): Promise<boolean> {
  const result = await db.prepare(`
    DELETE FROM weekly_overrides WHERE id = ?
  `).bind(overrideId).run();
  
  return result.success;
}

/**
 * Check if a category is paused for a given week
 */
export function isCategoryPaused(
  overrides: WeeklyOverride[],
  category: string
): boolean {
  return overrides.some(o => 
    o.type === 'pause_category' && 
    (o.config as PauseCategoryConfig).category === category
  );
}

/**
 * Check if an opportunity is force-included
 */
export function isForceIncluded(
  overrides: WeeklyOverride[],
  opportunityId: string
): boolean {
  return overrides.some(o =>
    o.type === 'force_include' &&
    (o.config as ForceIncludeConfig).opportunityId === opportunityId
  );
}

/**
 * Get overridden energy mode (if set)
 */
export function getOverriddenEnergyMode(
  overrides: WeeklyOverride[]
): 'build' | 'exposure' | 'consolidation' | 'recovery' | null {
  const modeOverride = overrides.find(o => o.type === 'set_energy_mode');
  if (!modeOverride) return null;
  
  return (modeOverride.config as SetEnergyModeConfig).mode;
}

/**
 * Get human-readable summary of active overrides
 */
export function getOverridesSummary(overrides: WeeklyOverride[]): string[] {
  return overrides.map(o => {
    switch (o.type) {
      case 'pause_category':
        return `Paused ${(o.config as PauseCategoryConfig).category}: ${o.reason}`;
      case 'force_include':
        return `Must include "${(o.config as ForceIncludeConfig).opportunityTitle || 'opportunity'}": ${o.reason}`;
      case 'set_energy_mode':
        return `Energy mode set to ${(o.config as SetEnergyModeConfig).mode}: ${o.reason}`;
      default:
        return o.reason;
    }
  });
}
