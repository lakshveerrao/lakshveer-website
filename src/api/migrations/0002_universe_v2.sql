-- Universe V2 Migration: Core Tables
-- Neural Capability OS

-- ============================================
-- NODES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS universe_nodes (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  url TEXT,
  
  -- Temporal
  timestamp TEXT,
  year INTEGER,
  
  -- Clustering
  cluster_id TEXT,
  
  -- Scoring
  growth_weight REAL DEFAULT 0,
  impact_score REAL DEFAULT 0,
  momentum REAL DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active',
  
  -- Verification
  verification_status TEXT DEFAULT 'pending',
  confidence_score REAL DEFAULT 0,
  
  -- Evidence & Context
  evidence TEXT,
  why_it_matters TEXT,
  what_it_unlocked TEXT,
  what_it_enables TEXT,
  learning_gaps TEXT,
  ways_to_help TEXT,
  
  -- Metadata
  meta TEXT,
  
  -- Audit
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT,
  source TEXT
);

-- ============================================
-- EDGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS universe_edges (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  type TEXT NOT NULL,
  label TEXT,
  
  -- Strength
  weight REAL DEFAULT 50,
  
  -- Temporal
  timestamp TEXT,
  
  -- Verification
  verification_status TEXT DEFAULT 'pending',
  confidence_score REAL DEFAULT 0,
  inference_reason TEXT,
  
  -- Evidence
  evidence TEXT,
  
  -- Audit
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  approved_at TEXT,
  approved_by TEXT,
  source TEXT,
  
  FOREIGN KEY (source_id) REFERENCES universe_nodes(id),
  FOREIGN KEY (target_id) REFERENCES universe_nodes(id)
);

-- ============================================
-- CLUSTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS universe_clusters (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  icon TEXT,
  
  -- Scoring
  level INTEGER DEFAULT 1,
  momentum REAL DEFAULT 0,
  growth_rate REAL DEFAULT 0,
  
  -- Computed
  project_count INTEGER DEFAULT 0,
  skill_count INTEGER DEFAULT 0,
  
  -- Core skills
  core_skills TEXT,
  
  -- Audit
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- LEARNING GAPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS learning_gaps (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  
  cluster_id TEXT,
  
  priority_score REAL DEFAULT 0,
  roi_score REAL DEFAULT 0,
  
  blocks_next_level INTEGER DEFAULT 0,
  suggested_action TEXT,
  suggested_collaborator TEXT,
  
  status TEXT DEFAULT 'open',
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  closed_at TEXT,
  
  FOREIGN KEY (cluster_id) REFERENCES universe_clusters(id)
);

-- ============================================
-- OPPORTUNITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS opportunities (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  description TEXT,
  
  reasoning TEXT NOT NULL,
  confidence_score REAL DEFAULT 0,
  
  related_nodes TEXT,
  related_clusters TEXT,
  
  suggested_action TEXT,
  timeframe TEXT,
  
  status TEXT DEFAULT 'suggested',
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  approved_at TEXT,
  rejected_reason TEXT
);

-- ============================================
-- OUTREACH QUEUE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS outreach_queue (
  id TEXT PRIMARY KEY,
  
  target_node_id TEXT,
  target_name TEXT NOT NULL,
  target_contact TEXT,
  
  trigger_type TEXT,
  trigger_node_id TEXT,
  
  subject TEXT,
  draft TEXT NOT NULL,
  context TEXT,
  specific_ask TEXT,
  proof_links TEXT,
  
  status TEXT DEFAULT 'draft',
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT,
  sent_at TEXT,
  
  FOREIGN KEY (target_node_id) REFERENCES universe_nodes(id)
);

-- ============================================
-- WEEKLY REFLECTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_reflections (
  id TEXT PRIMARY KEY,
  week_start TEXT NOT NULL,
  week_end TEXT NOT NULL,
  
  builds_completed TEXT,
  skills_improved TEXT,
  clusters_grown TEXT,
  relationships_strengthened TEXT,
  gaps_widened TEXT,
  recommended_next_move TEXT,
  
  notes TEXT,
  
  generated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- AUDIT LOG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  
  previous_value TEXT,
  new_value TEXT,
  reason TEXT,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  created_by TEXT
);

-- ============================================
-- INGESTION SOURCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ingestion_sources (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  source_id TEXT,
  source_url TEXT,
  
  raw_content TEXT,
  
  extracted_nodes TEXT,
  extracted_edges TEXT,
  
  status TEXT DEFAULT 'pending',
  
  ingested_at TEXT DEFAULT CURRENT_TIMESTAMP,
  processed_at TEXT,
  error TEXT
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_nodes_type ON universe_nodes(type);
CREATE INDEX IF NOT EXISTS idx_nodes_cluster ON universe_nodes(cluster_id);
CREATE INDEX IF NOT EXISTS idx_nodes_verification ON universe_nodes(verification_status);
CREATE INDEX IF NOT EXISTS idx_nodes_timestamp ON universe_nodes(timestamp);

CREATE INDEX IF NOT EXISTS idx_edges_source ON universe_edges(source_id);
CREATE INDEX IF NOT EXISTS idx_edges_target ON universe_edges(target_id);
CREATE INDEX IF NOT EXISTS idx_edges_type ON universe_edges(type);
CREATE INDEX IF NOT EXISTS idx_edges_verification ON universe_edges(verification_status);

CREATE INDEX IF NOT EXISTS idx_gaps_cluster ON learning_gaps(cluster_id);
CREATE INDEX IF NOT EXISTS idx_gaps_status ON learning_gaps(status);

CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_outreach_status ON outreach_queue(status);
