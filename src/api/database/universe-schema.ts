import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// ============================================
// UNIVERSE V2 DATABASE SCHEMA
// Neural Capability OS
// ============================================

// Node Types
export type NodeType = 
  | 'person' | 'project' | 'skill' | 'technology' | 'event' 
  | 'organization' | 'award' | 'endorsement' | 'tool' | 'trip'
  | 'capability' | 'potential' | 'influence' | 'cluster' | 'note';

// Edge Types  
export type EdgeType = 
  | 'BUILT_WITH' | 'LEARNED_FROM' | 'ENABLED_BY' | 'PRESENTED_AT'
  | 'WON_AT' | 'SUPPORTED_BY' | 'ENDORSED_BY' | 'EVOLVED_INTO'
  | 'CROSS_POLLINATED' | 'CAPABILITY_EXPANSION' | 'FUTURE_PATH'
  | 'COMPOUNDS_INTO' | 'MENTORED_BY' | 'USES' | 'UNLOCKS';

// Verification Status
export type VerificationStatus = 'verified' | 'pending' | 'rejected' | 'inferred';

// ============================================
// NODES TABLE
// ============================================
export const universeNodes = sqliteTable('universe_nodes', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  type: text('type').notNull(), // NodeType
  description: text('description'),
  url: text('url'),
  
  // Temporal
  timestamp: text('timestamp'), // YYYY-MM format
  year: integer('year'),
  
  // Clustering
  clusterId: text('cluster_id'),
  
  // Scoring (computed but cached)
  growthWeight: real('growth_weight').default(0),
  impactScore: real('impact_score').default(0),
  momentum: real('momentum').default(0),
  
  // Status
  status: text('status').default('active'), // active, completed, potential
  
  // Verification
  verificationStatus: text('verification_status').default('pending'), // VerificationStatus
  confidenceScore: real('confidence_score').default(0), // 0-100
  
  // Evidence & Context
  evidence: text('evidence'), // JSON array of evidence links
  whyItMatters: text('why_it_matters'),
  whatItUnlocked: text('what_it_unlocked'), // JSON array of skill/node IDs
  whatItEnables: text('what_it_enables'), // JSON array of potential next steps
  learningGaps: text('learning_gaps'), // JSON array of gap IDs
  waysToHelp: text('ways_to_help'), // JSON array of help requests
  
  // Metadata
  meta: text('meta'), // JSON for flexible additional data
  
  // Audit
  createdAt: text('created_at').default('sql', `CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default('sql', `CURRENT_TIMESTAMP`),
  createdBy: text('created_by'),
  source: text('source'), // 'manual', 'twitter', 'youtube', 'notes'
});

// ============================================
// EDGES TABLE
// ============================================
export const universeEdges = sqliteTable('universe_edges', {
  id: text('id').primaryKey(),
  sourceId: text('source_id').notNull().references(() => universeNodes.id),
  targetId: text('target_id').notNull().references(() => universeNodes.id),
  type: text('type').notNull(), // EdgeType
  label: text('label'),
  
  // Strength
  weight: real('weight').default(50), // 0-100
  
  // Temporal
  timestamp: text('timestamp'),
  
  // Verification
  verificationStatus: text('verification_status').default('pending'),
  confidenceScore: real('confidence_score').default(0),
  inferenceReason: text('inference_reason'), // Why this was inferred
  
  // Evidence
  evidence: text('evidence'), // JSON array of proof links
  
  // Audit
  createdAt: text('created_at').default('sql', `CURRENT_TIMESTAMP`),
  approvedAt: text('approved_at'),
  approvedBy: text('approved_by'),
  source: text('source'), // 'manual', 'twitter', 'youtube', 'inferred'
});

// ============================================
// CLUSTERS TABLE
// ============================================
export const universeClusters = sqliteTable('universe_clusters', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  description: text('description'),
  color: text('color').notNull(),
  icon: text('icon'),
  
  // Scoring
  level: integer('level').default(1), // 1-5 mastery level
  momentum: real('momentum').default(0),
  growthRate: real('growth_rate').default(0), // projects/month
  
  // Computed (cached)
  projectCount: integer('project_count').default(0),
  skillCount: integer('skill_count').default(0),
  
  // Core skills for this cluster
  coreSkills: text('core_skills'), // JSON array of skill node IDs
  
  // Audit
  updatedAt: text('updated_at').default('sql', `CURRENT_TIMESTAMP`),
});

// ============================================
// LEARNING GAPS TABLE
// ============================================
export const learningGaps = sqliteTable('learning_gaps', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  description: text('description'),
  
  // Related cluster
  clusterId: text('cluster_id').references(() => universeClusters.id),
  
  // Priority scoring
  priorityScore: real('priority_score').default(0), // 0-100
  roiScore: real('roi_score').default(0), // Return on investment if closed
  
  // What closing this gap enables
  blocksNextLevel: integer('blocks_next_level').default(0), // 1 if blocking
  suggestedAction: text('suggested_action'),
  suggestedCollaborator: text('suggested_collaborator'), // Node ID of person/org
  
  // Status
  status: text('status').default('open'), // open, in_progress, closed
  
  // Audit
  createdAt: text('created_at').default('sql', `CURRENT_TIMESTAMP`),
  closedAt: text('closed_at'),
});

// ============================================
// OPPORTUNITIES TABLE (Inferred)
// ============================================
export const opportunities = sqliteTable('opportunities', {
  id: text('id').primaryKey(),
  label: text('label').notNull(),
  description: text('description'),
  
  // Reasoning
  reasoning: text('reasoning').notNull(), // Why this is suggested
  confidenceScore: real('confidence_score').default(0),
  
  // Related entities
  relatedNodes: text('related_nodes'), // JSON array of node IDs
  relatedClusters: text('related_clusters'), // JSON array of cluster IDs
  
  // Action
  suggestedAction: text('suggested_action'),
  timeframe: text('timeframe'),
  
  // Status
  status: text('status').default('suggested'), // suggested, approved, rejected, completed
  
  // Audit
  createdAt: text('created_at').default('sql', `CURRENT_TIMESTAMP`),
  approvedAt: text('approved_at'),
  rejectedReason: text('rejected_reason'),
});

// ============================================
// OUTREACH QUEUE TABLE
// ============================================
export const outreachQueue = sqliteTable('outreach_queue', {
  id: text('id').primaryKey(),
  
  // Target
  targetNodeId: text('target_node_id').references(() => universeNodes.id),
  targetName: text('target_name').notNull(),
  targetContact: text('target_contact'), // email, twitter handle, etc.
  
  // Trigger
  triggerType: text('trigger_type'), // milestone, award, connection, event, growth
  triggerNodeId: text('trigger_node_id'),
  
  // Draft content
  subject: text('subject'),
  draft: text('draft').notNull(),
  context: text('context'), // Why reaching out
  specificAsk: text('specific_ask'),
  proofLinks: text('proof_links'), // JSON array
  
  // Status
  status: text('status').default('draft'), // draft, reviewed, sent, responded
  
  // Audit
  createdAt: text('created_at').default('sql', `CURRENT_TIMESTAMP`),
  reviewedAt: text('reviewed_at'),
  sentAt: text('sent_at'),
});

// ============================================
// WEEKLY REFLECTIONS TABLE
// ============================================
export const weeklyReflections = sqliteTable('weekly_reflections', {
  id: text('id').primaryKey(),
  weekStart: text('week_start').notNull(), // YYYY-MM-DD
  weekEnd: text('week_end').notNull(),
  
  // Auto-generated content
  buildsCompleted: text('builds_completed'), // JSON array
  skillsImproved: text('skills_improved'), // JSON array
  clustersGrown: text('clusters_grown'), // JSON array with growth %
  relationshipsStrengthened: text('relationships_strengthened'), // JSON array
  gapsWidened: text('gaps_widened'), // JSON array
  recommendedNextMove: text('recommended_next_move'),
  
  // Manual additions
  notes: text('notes'),
  
  // Audit
  generatedAt: text('generated_at').default('sql', `CURRENT_TIMESTAMP`),
});

// ============================================
// AUDIT LOG TABLE
// ============================================
export const auditLog = sqliteTable('audit_log', {
  id: text('id').primaryKey(),
  
  // Action
  action: text('action').notNull(), // approve, reject, edit, create, delete, send_outreach
  entityType: text('entity_type').notNull(), // node, edge, opportunity, outreach
  entityId: text('entity_id').notNull(),
  
  // Details
  previousValue: text('previous_value'), // JSON
  newValue: text('new_value'), // JSON
  reason: text('reason'),
  
  // Audit
  createdAt: text('created_at').default('sql', `CURRENT_TIMESTAMP`),
  createdBy: text('created_by'),
});

// ============================================
// INGESTION SOURCES TABLE
// ============================================
export const ingestionSources = sqliteTable('ingestion_sources', {
  id: text('id').primaryKey(),
  type: text('type').notNull(), // twitter, youtube, notes, manual
  sourceId: text('source_id'), // tweet ID, video ID, etc.
  sourceUrl: text('source_url'),
  
  // Raw content
  rawContent: text('raw_content'),
  
  // Extracted entities
  extractedNodes: text('extracted_nodes'), // JSON array of node IDs created
  extractedEdges: text('extracted_edges'), // JSON array of edge IDs created
  
  // Status
  status: text('status').default('pending'), // pending, processed, failed
  
  // Audit
  ingestedAt: text('ingested_at').default('sql', `CURRENT_TIMESTAMP`),
  processedAt: text('processed_at'),
  error: text('error'),
});
