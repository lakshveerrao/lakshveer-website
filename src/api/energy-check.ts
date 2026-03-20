/**
 * Energy Check - Detects current energy/activity mode
 * 
 * Analyzes recent activity (last 14 days) to determine:
 * - Build mode: High project velocity, consolidation time
 * - Exposure mode: Lots of events/talks scheduled
 * - Consolidation mode: Recent wins, time to document/celebrate
 * - Recovery mode: Low activity, breathing room needed
 * 
 * Used by weekly compression to adjust opportunity mix
 */

import type { D1Database } from '@cloudflare/workers-types';

export type EnergyMode = 'build' | 'exposure' | 'consolidation' | 'recovery';

export interface EnergyMetrics {
  mode: EnergyMode;
  score: number;
  recentActivity: {
    events: number;      // Upcoming/recent events
    projects: number;    // Active projects
    awards: number;      // Recent wins
    daysAnalyzed: number;
  };
  reasoning: string;
}

/**
 * Detect current energy mode from recent activity
 * 
 * Scoring:
 * - Events (talks, hackathons, panels): 2 points each
 * - Projects (active builds): 1 point each
 * - Awards (recent wins): 0.5 points each
 * 
 * Thresholds:
 * - 0-3: Recovery (low activity, need rest)
 * - 4-7: Build (healthy project velocity)
 * - 8-11: Exposure (lots of external engagement)
 * - 12+: Consolidation (high activity, need to process/document)
 */
export async function detectEnergyMode(
  db: D1Database,
  weekStart: Date
): Promise<EnergyMetrics> {
  const daysBack = 14;
  const startDate = new Date(weekStart);
  startDate.setDate(startDate.getDate() - daysBack);
  
  // Query nodes by type with date filtering
  const eventsQuery = await db.prepare(`
    SELECT COUNT(*) as count
    FROM nodes
    WHERE type IN ('event', 'talk', 'panel', 'hackathon')
      AND (
        date(created_at) >= date(?)
        OR (metadata IS NOT NULL AND json_extract(metadata, '$.date') >= ?)
      )
  `).bind(startDate.toISOString().split('T')[0], startDate.toISOString().split('T')[0]).first<{ count: number }>();
  
  const projectsQuery = await db.prepare(`
    SELECT COUNT(*) as count
    FROM nodes
    WHERE type = 'project'
      AND (
        date(created_at) >= date(?)
        OR (metadata IS NOT NULL AND json_extract(metadata, '$.status') = 'active')
      )
  `).bind(startDate.toISOString().split('T')[0]).first<{ count: number }>();
  
  const awardsQuery = await db.prepare(`
    SELECT COUNT(*) as count
    FROM nodes
    WHERE type = 'award'
      AND date(created_at) >= date(?)
  `).bind(startDate.toISOString().split('T')[0]).first<{ count: number }>();
  
  const events = eventsQuery?.count || 0;
  const projects = projectsQuery?.count || 0;
  const awards = awardsQuery?.count || 0;
  
  // Calculate weighted score
  const score = (events * 2) + (projects * 1) + (awards * 0.5);
  
  // Determine mode
  let mode: EnergyMode;
  let reasoning: string;
  
  if (score < 4) {
    mode = 'recovery';
    reasoning = `Low activity (${events} events, ${projects} projects). Time to rest and recharge.`;
  } else if (score < 8) {
    mode = 'build';
    reasoning = `Healthy build velocity (${projects} active projects, ${events} events). Keep shipping.`;
  } else if (score < 12) {
    mode = 'exposure';
    reasoning = `High external engagement (${events} events, ${projects} projects). Focus on connections.`;
  } else {
    mode = 'consolidation';
    reasoning = `Very high activity (${events} events, ${projects} projects, ${awards} wins). Time to document and celebrate.`;
  }
  
  return {
    mode,
    score,
    recentActivity: {
      events,
      projects,
      awards,
      daysAnalyzed: daysBack
    },
    reasoning
  };
}

/**
 * Get Monday of current week (ISO week starts Monday)
 */
export function getWeekStart(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
