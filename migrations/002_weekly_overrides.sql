-- Weekly Override System
-- Allows manual control of weekly opportunity compression

CREATE TABLE IF NOT EXISTS weekly_overrides (
  id TEXT PRIMARY KEY,
  week_start TEXT NOT NULL, -- ISO date string (YYYY-MM-DD) for Monday of week
  type TEXT NOT NULL, -- 'pause_category' | 'force_include' | 'set_energy_mode'
  reason TEXT NOT NULL, -- Human-readable explanation
  config TEXT, -- JSON config: { category: 'hackathon' } or { opportunityId: '...' } or { mode: 'recovery' }
  created_by TEXT, -- 'venkat' | 'laksh' | 'system'
  created_at TEXT DEFAULT (datetime('now')),
  
  -- Constraints
  CHECK (type IN ('pause_category', 'force_include', 'set_energy_mode'))
);

-- Index for fast weekly lookups
CREATE INDEX IF NOT EXISTS idx_weekly_overrides_week ON weekly_overrides(week_start);

-- Example data for testing
-- INSERT INTO weekly_overrides (id, week_start, type, reason, config, created_by) VALUES
--   ('override-1', '2026-03-03', 'pause_category', 'Too many hackathons lately, need consolidation time', '{"category":"hackathon"}', 'venkat'),
--   ('override-2', '2026-03-10', 'force_include', 'Must apply to YC before deadline', '{"opportunityId":"yc-s25-application"}', 'venkat'),
--   ('override-3', '2026-03-17', 'set_energy_mode', 'School exams coming up, force recovery mode', '{"mode":"recovery"}', 'venkat');
