// ============================================
// NODE WORKSPACE — Types
// Universe v5.5: Actionable context for each node
// ============================================

export interface WorkspaceItem {
  id: string;
  title: string;
  description: string;
  action?: string; // CTA text
  url?: string;
  effort?: 'low' | 'medium' | 'high';
  priority?: number; // 0–100, higher = more important
  badge?: string; // e.g. "New", "Trending", "Quick Win"
}

// ============================================
// NODE WORKSPACE
// 7 categories of actionable context (v5.5: added discover)
// ============================================

export interface NodeWorkspace {
  nodeId: string;
  generatedAt: number; // Date.now()

  // ── Public categories ──
  learn: WorkspaceItem[];         // Resources, tutorials, next skills to explore
  build: WorkspaceItem[];         // Project ideas, prototypes, extensions
  discover: WorkspaceItem[];      // v5.5: Real-world events, competitions, labs, grants
  opportunities: WorkspaceItem[]; // Competitions, grants, programs, partnerships

  // ── Private categories ──
  connect: WorkspaceItem[];       // People, orgs, communities to reach
  collaborate: WorkspaceItem[];   // Projects or teams to join
  compete: WorkspaceItem[];       // Competitions, challenges, hackathons
}
