/**
 * Weekly Compression Engine
 * 
 * The mentor intelligence: Takes 23+ opportunities and compresses to 2-4 clear "next moves"
 * 
 * Key principles:
 * - Ranking model (not point accumulation) - ranks separately by leverage, urgency, fit
 * - Context-aware reasoning - pulls from actual recent activity
 * - Mentor tone - sounds like a human ("Apply to X because Y" not "Priority: 87")
 * - Energy-adjusted - different mixes for build/exposure/consolidation/recovery modes
 */

import type { D1Database } from '@cloudflare/workers-types';
import type { EnergyMode } from './energy-check';
import type { WeeklyOverride } from './human-override';
import { isCategoryPaused, isForceIncluded } from './human-override';

export interface WeeklyMove {
  id: string;
  title: string;
  reasoning: string; // One clear sentence explaining why
  actionType: 'apply' | 'connect' | 'build'; // Internal categorization
  actionUrl?: string; // Pre-filled form URL or relevant link
  deadline?: string; // ISO date if time-sensitive
  effort: 'low' | 'medium' | 'high'; // Time commitment estimate
  relatedNodes: string[]; // Node IDs this builds on
}

export interface WeeklyOutput {
  week: string; // ISO date of Monday
  moves: WeeklyMove[];
  energyMode: EnergyMode;
  overridesSummary: string[];
  generatedAt: string;
}

interface ScoredOpportunity {
  opportunity: any; // From opportunity-intelligence.ts
  ranks: {
    leverage: number;  // 1 = best
    urgency: number;   // 1 = most urgent
    fit: number;       // 1 = best fit with trajectory
  };
  composite: number; // 0-100, weighted average of ranks
  reasoning: string;
}

/**
 * Main compression function: 23+ opportunities → 2-4 moves
 */
export async function compressToWeeklyOS(
  db: D1Database,
  opportunities: any[], // From getIntelligentOpportunities()
  energyMode: EnergyMode,
  overrides: WeeklyOverride[]
): Promise<WeeklyMove[]> {
  
  // Step 1: Apply filters
  let filtered = opportunities.filter(opp => {
    // Remove if category/type is paused
    const oppCategory = opp.category || opp.type || '';
    if (oppCategory && isCategoryPaused(overrides, oppCategory)) {
      return false;
    }
    return true;
  });
  
  // Step 2: Score and rank all opportunities
  const scored = await scoreOpportunities(db, filtered, energyMode);
  
  // Step 3: Select top opportunities based on energy mode
  const targetCount = getTargetCount(energyMode);
  const topScored = scored.slice(0, Math.min(targetCount * 2, scored.length)); // Get 2x for filtering
  
  // Step 4: Apply force-includes (override ranking)
  const forceIncluded = topScored.filter(s => 
    isForceIncluded(overrides, s.opportunity.id)
  );
  
  const regularPicks = topScored
    .filter(s => !isForceIncluded(overrides, s.opportunity.id))
    .slice(0, targetCount - forceIncluded.length);
  
  const finalPicks = [...forceIncluded, ...regularPicks].slice(0, targetCount);
  
  // Step 5: Convert to WeeklyMove format
  return finalPicks.map(scored => opportunityToMove(scored));
}

/**
 * Score opportunities using ranking model
 * Ranks separately by leverage, urgency, fit - then combines
 */
async function scoreOpportunities(
  db: D1Database,
  opportunities: any[],
  energyMode: EnergyMode
): Promise<ScoredOpportunity[]> {
  
  console.log('[COMPRESSION] Starting scoring for', opportunities.length, 'opportunities');
  
  // Get recent activity for context-aware scoring
  const recentActivity = await getRecentActivity(db);
  console.log('[COMPRESSION] Recent activity:', recentActivity?.length || 0, 'nodes');
  
  // Defensive: ensure recentActivity is array
  const safeRecentActivity = Array.isArray(recentActivity) ? recentActivity : [];
  
  // Rank by leverage (strategic value)
  const byLeverage = [...opportunities].sort((a, b) => 
    compareLeverage(b, a)
  );
  
  // Rank by urgency (deadline proximity)
  const byUrgency = [...opportunities].sort((a, b) =>
    compareUrgency(a, b)
  );
  
  // Rank by trajectory fit (builds on recent work)
  const byFit = [...opportunities].sort((a, b) =>
    compareFit(b, a, safeRecentActivity)
  );
  
  // Calculate composite scores
  const N = opportunities.length;
  const scored: ScoredOpportunity[] = opportunities.map(opp => {
    const ranks = {
      leverage: byLeverage.indexOf(opp) + 1,
      urgency: byUrgency.indexOf(opp) + 1,
      fit: byFit.indexOf(opp) + 1
    };
    
    // Normalize ranks to 0-100 and apply weights
    const weights = getWeightsForEnergyMode(energyMode);
    const composite = 
      ((N - ranks.leverage) / N * 100 * weights.leverage) +
      ((N - ranks.urgency) / N * 100 * weights.urgency) +
      ((N - ranks.fit) / N * 100 * weights.fit);
    
    const reasoning = generateMentorReasoning(opp, safeRecentActivity);
    
    return { opportunity: opp, ranks, composite, reasoning };
  });
  
  console.log('[COMPRESSION] Scoring complete, top 3 scores:', scored.slice(0, 3).map(s => s.composite));
  
  // Sort by composite score
  return scored.sort((a, b) => b.composite - a.composite);
}

/**
 * Compare opportunities by leverage (strategic value)
 */
function compareLeverage(a: any, b: any): number {
  // Use confidence score as leverage proxy
  const aLeverage = a.confidence || a.strategicValue?.leverage || 50;
  const bLeverage = b.confidence || b.strategicValue?.leverage || 50;
  
  // Higher leverage = better
  return bLeverage - aLeverage;
}

/**
 * Compare opportunities by urgency (deadline)
 */
function compareUrgency(a: any, b: any): number {
  // If no deadline field, check timeframe text
  if (!a.deadline && !b.deadline) {
    // Parse timeframe if exists
    const aUrgent = a.timeframe?.includes('immediate') || a.timeframe?.includes('week') ? 1 : 0;
    const bUrgent = b.timeframe?.includes('immediate') || b.timeframe?.includes('week') ? 1 : 0;
    return bUrgent - aUrgent;
  }
  if (!a.deadline) return 1; // a is less urgent
  if (!b.deadline) return -1; // b is less urgent
  
  const aDays = daysUntil(a.deadline);
  const bDays = daysUntil(b.deadline);
  
  // Closer deadline = more urgent
  return aDays - bDays;
}

/**
 * Compare opportunities by trajectory fit (builds on recent work)
 */
function compareFit(a: any, b: any, recentActivity: any[]): number {
  const aFit = calculateFitScore(a, recentActivity);
  const bFit = calculateFitScore(b, recentActivity);
  
  return bFit - aFit;
}

/**
 * Calculate how well opportunity fits current trajectory
 */
function calculateFitScore(opp: any, recentActivity: any[]): number {
  let score = 0;
  
  // Defensive: ensure recentActivity is array
  const safeRecentActivity = Array.isArray(recentActivity) ? recentActivity : [];
  
  // Check pathNodes (from graph opportunities) or relatedNodes
  const relatedNodes = Array.isArray(opp?.pathNodes) ? opp.pathNodes : 
                       (Array.isArray(opp?.relatedNodes) ? opp.relatedNodes : []);
  if (relatedNodes.length > 0 && safeRecentActivity.length > 0) {
    const recentNodeIds = safeRecentActivity.map(n => n?.id).filter(Boolean);
    const overlap = relatedNodes.filter((id: string) => recentNodeIds.includes(id));
    score += overlap.length * 10;
  }
  
  // Check if matches recent themes by type
  if (opp?.type && safeRecentActivity.some(n => n?.type === opp.type)) {
    score += 5;
  }
  
  // Boost if low effort (easier to execute)
  if (opp?.effort === 'low') {
    score += 5;
  }
  
  return score;
}

/**
 * Get recent activity nodes (last 30 days)
 */
async function getRecentActivity(db: D1Database): Promise<any[]> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db.prepare(`
      SELECT * FROM universe_nodes
      WHERE date(created_at) >= date(?)
      ORDER BY created_at DESC
      LIMIT 20
    `).bind(thirtyDaysAgo.toISOString().split('T')[0]).all();
    
    return Array.isArray(result.results) ? result.results : [];
  } catch (error) {
    console.error('[COMPRESSION] getRecentActivity failed:', error);
    return []; // Return empty array instead of crashing
  }
}

/**
 * Generate mentor-style reasoning (sounds human, not algorithmic)
 */
function generateMentorReasoning(opp: any, recentActivity: any[]): string {
  const reasons: string[] = [];
  
  // Use existing insight if it's human-readable
  if (opp.insight && opp.insight.length < 100 && !opp.insight.includes('|')) {
    return opp.insight;
  }
  
  // Deadline urgency (if deadline exists)
  if (opp.deadline) {
    const days = daysUntil(opp.deadline);
    if (days <= 7) {
      reasons.push(`Deadline in ${days} day${days === 1 ? '' : 's'}`);
    }
  } else if (opp.timeframe?.includes('immediate')) {
    reasons.push('Act now');
  }
  
  // Builds on recent work (check pathNodes)
  const relatedNodes = opp.pathNodes || opp.relatedNodes || [];
  const relatedRecent = recentActivity.find(n => relatedNodes.includes(n.id));
  if (relatedRecent) {
    reasons.push(`Builds on your recent ${relatedRecent.label} work`);
  }
  
  // Strategic value from reasoning array (if exists)
  if (opp.reasoning && Array.isArray(opp.reasoning) && opp.reasoning.length > 0) {
    // Take the most mentor-like reason (avoid "You have strong skills")
    const goodReasons = opp.reasoning.filter((r: string) => 
      !r.includes('You have strong skills') && 
      !r.includes('Market opportunity exists') &&
      r.length > 20
    );
    if (goodReasons.length > 0) {
      reasons.push(goodReasons[0]);
    }
  }
  
  // Fallback to valueForLaksh or nextStep
  if (reasons.length === 0) {
    if (opp.valueForLaksh) {
      return opp.valueForLaksh;
    }
    if (opp.nextStep) {
      return opp.nextStep;
    }
    return 'Strong strategic fit';
  }
  
  // Take max 2 reasons, natural combination
  return reasons.slice(0, 2).join('. ') + '.';
}

/**
 * Calculate days until deadline
 */
function daysUntil(deadline: string): number {
  const now = new Date();
  const target = new Date(deadline);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Get ranking weights based on energy mode
 */
function getWeightsForEnergyMode(mode: EnergyMode): { leverage: number; urgency: number; fit: number } {
  switch (mode) {
    case 'build':
      return { leverage: 0.5, urgency: 0.2, fit: 0.3 }; // Prioritize high-leverage builds
    case 'exposure':
      return { leverage: 0.4, urgency: 0.4, fit: 0.2 }; // Balance leverage and urgency
    case 'consolidation':
      return { leverage: 0.3, urgency: 0.5, fit: 0.2 }; // Focus on urgent/deadline items
    case 'recovery':
      return { leverage: 0.6, urgency: 0.1, fit: 0.3 }; // Only highest leverage, low urgency
    default:
      return { leverage: 0.4, urgency: 0.3, fit: 0.3 };
  }
}

/**
 * Get target number of moves based on energy mode
 */
function getTargetCount(mode: EnergyMode): number {
  switch (mode) {
    case 'recovery':
      return 2; // Minimal moves
    case 'build':
      return 3; // Standard cadence
    case 'exposure':
      return 4; // More engagement opportunities
    case 'consolidation':
      return 2; // Focus on wrapping up
    default:
      return 3;
  }
}

/**
 * Convert scored opportunity to WeeklyMove
 */
function opportunityToMove(scored: ScoredOpportunity): WeeklyMove {
  const opp = scored.opportunity;
  
  // Determine action type based on opportunity type and content
  let actionType: WeeklyMove['actionType'] = 'build';
  if (opp.type === 'gap' || opp.type === 'path') actionType = 'connect';
  if (opp.type === 'content') actionType = 'build';
  if (opp.title?.toLowerCase().includes('apply') || opp.nextStep?.toLowerCase().includes('apply')) actionType = 'apply';
  
  // Get effort level
  let effort: WeeklyMove['effort'] = 'medium';
  if (opp.effort === 'low') effort = 'low';
  if (opp.effort === 'high' || opp.effort === 'medium') effort = opp.effort;
  
  // Get action URL
  const actionUrl = opp.url || opp.actionUrl || opp.nextStep;
  
  // Get related nodes
  const relatedNodes = opp.pathNodes || opp.relatedNodes || [];
  
  return {
    id: opp.id,
    title: opp.title,
    reasoning: scored.reasoning,
    actionType,
    actionUrl,
    deadline: opp.deadline,
    effort,
    relatedNodes
  };
}
