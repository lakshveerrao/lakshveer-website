# Week 2 Complete: Weekly OS Engine

## ✅ DEPLOYED TO PRODUCTION

**URL:** https://lakshveer.com/universe  
**Version:** c127e317-9eb7-4c00-87d6-dcefb6911289  
**Branch:** refactor/phase-2-weekly-os  
**Database:** Migration 002 applied successfully  

---

## What We Built (26h planned → 3h actual)

### 1. **Energy Detection System** (`energy-check.ts`)
Automatically detects Laksh's current mode from recent activity:

**Algorithm:**
- Analyzes last 14 days of activity
- Weighted scoring: events=2pts, projects=1pt, awards=0.5pts
- Thresholds: 0-3=recovery, 4-7=build, 8-11=exposure, 12+=consolidation

**Example Output:**
```json
{
  "mode": "build",
  "score": 6.5,
  "reasoning": "Healthy build velocity (4 active projects, 2 events). Keep shipping.",
  "recentActivity": {
    "events": 2,
    "projects": 4,
    "awards": 1,
    "daysAnalyzed": 14
  }
}
```

### 2. **Human Override System** (`human-override.ts`)
Manual controls for Capt. Venkat:

**3 Override Types:**
- `pause_category`: "No hackathons this week" → removes all hackathon opportunities
- `force_include`: "Must apply to YC" → guarantees specific opportunity appears
- `set_energy_mode`: "Force recovery mode" → ignores auto-detected mode

**Database Table:**
```sql
CREATE TABLE weekly_overrides (
  id TEXT PRIMARY KEY,
  week_start TEXT, -- YYYY-MM-DD (Monday)
  type TEXT, -- pause_category | force_include | set_energy_mode
  reason TEXT, -- Human explanation
  config TEXT, -- JSON config
  created_by TEXT
);
```

**API Endpoints:**
- `GET /api/universe/overrides/:week` - Get overrides for specific week
- `POST /api/universe/overrides` - Create new override
- `DELETE /api/universe/overrides/:id` - Remove override

### 3. **Compression Engine** (`weekly-compression.ts`)
The core intelligence: 23 opportunities → 2-4 moves

**Not This (Engineering-Shaped):**
```
Priority: 87
Apply to YC S25
Leverage: High | Urgency: 14 days | Fit Score: 76
```

**This (Mentor-Shaped):**
```
Apply to YC S25
→ Deadline in 14 days. Builds on CircuitHeroes traction.
  Opens access to elite founders.
```

**Ranking Algorithm:**
```typescript
// Rank separately by each dimension
byLeverage = sort(opportunities, leverage score)
byUrgency = sort(opportunities, days until deadline)
byFit = sort(opportunities, builds on recent work)

// Calculate composite score (normalized ranks with weights)
composite = 
  ((N - rank_leverage) / N * 100 * weight_leverage) +
  ((N - rank_urgency) / N * 100 * weight_urgency) +
  ((N - rank_fit) / N * 100 * weight_fit)

// Weights adjust by energy mode:
// Build:         leverage=50%, urgency=20%, fit=30%
// Exposure:      leverage=40%, urgency=40%, fit=20%
// Consolidation: leverage=30%, urgency=50%, fit=20%
// Recovery:      leverage=60%, urgency=10%, fit=30%
```

**Context-Aware Reasoning:**
```typescript
// Builds reasoning from actual context
if (deadline within 7 days) reasons.push(`Deadline in ${days} days`)
if (builds on recent project) reasons.push(`Builds on your recent ${project} work`)
if (opens new room) reasons.push(strategicValue.opensRoom)

// Max 2 reasons, natural combination
return reasons.slice(0, 2).join('. ') + '.'
```

**Target Move Count by Energy Mode:**
- Recovery: 2 moves (minimal)
- Build: 3 moves (standard)
- Exposure: 4 moves (more engagement)
- Consolidation: 2 moves (wrap up)

### 4. **Weekly OS Panel** (`WeeklyOSPanel.tsx`)
Clean UI that replaces dense GapsOpportunitiesPanel

**UI Components:**
```
┌─────────────────────────────────────────┐
│ This Week's Moves                       │
│ Week of Mar 3 • BUILD MODE              │
│                                         │
│ Healthy build velocity (4 projects,    │
│ 2 events). Keep shipping.               │
├─────────────────────────────────────────┤
│ 1  Apply to YC S25                      │
│    Deadline in 14 days. Builds on       │
│    CircuitHeroes traction. Opens        │
│    access to elite founders.            │
│    📅 Mar 18 • ⏱ ~1 day                 │
│    [Apply →]                            │
│                                         │
│ 2  Speak at Hardware Founders Meetup    │
│    Your MotionX demo fits their theme.  │
│    Direct access to 40+ founders.       │
│    📅 Mar 12 • ⏱ ~30 min                │
│    [Register →]                         │
│                                         │
│ 3  Document CircuitHeroes v2 learnings  │
│    Recent trademark win validates       │
│    market. Time to consolidate.         │
│    ⏱ ~2 hours                           │
│    [Start →]                            │
└─────────────────────────────────────────┘
```

**Features:**
- Energy mode badge (color-coded)
- Activity context (events, projects, awards count)
- Active overrides summary (if any)
- 2-4 moves with clear reasoning
- Deadline + effort estimates
- One-click action buttons
- No scores/percentages visible

### 5. **API Endpoint** (`/api/universe/weekly-os`)
Main endpoint that wires everything together:

**Flow:**
```
1. Get current week (Monday-Sunday)
2. Fetch all opportunities from intelligent engine
3. Detect energy mode from recent activity
4. Check for weekly overrides
5. Apply energy mode override if exists
6. Run compression (opportunities → moves)
7. Return WeeklyOutput
```

**Request:**
```bash
GET /api/universe/weekly-os
Headers: X-Universe-Auth: laksh-private-2026
```

**Response:**
```json
{
  "success": true,
  "week": "2026-03-03",
  "moves": [
    {
      "id": "yc-s25-application",
      "title": "Apply to YC S25",
      "reasoning": "Deadline in 14 days. Builds on CircuitHeroes traction. Opens access to elite founders.",
      "actionType": "apply",
      "actionUrl": "https://ycombinator.com/apply",
      "deadline": "2026-03-18",
      "effort": "high",
      "relatedNodes": ["circuitheroes", "projects-by-laksh"]
    },
    // ... 1-3 more moves
  ],
  "energyMode": "build",
  "energyMetrics": {
    "mode": "build",
    "score": 6.5,
    "reasoning": "Healthy build velocity...",
    "recentActivity": { "events": 2, "projects": 4, "awards": 1 }
  },
  "overridesSummary": [],
  "generatedAt": "2026-03-04T10:30:00.000Z"
}
```

---

## How to Use

### For Laksh (Weekly Check-in):
1. Visit https://lakshveer.com/universe
2. Enter password: `insidenagole`
3. Click "Weekly OS" button (purple button in sidebar)
4. See 2-4 clear moves with reasoning
5. Click action buttons to apply/register/start
6. That's it - no scores to interpret, just do

### For Capt. Venkat (Override Controls):

**Pause a Category:**
```bash
POST /api/universe/overrides
{
  "weekStart": "2026-03-03",
  "type": "pause_category",
  "reason": "Too many hackathons lately, need consolidation time",
  "config": { "category": "hackathon" },
  "createdBy": "venkat"
}
```

**Force-Include Opportunity:**
```bash
POST /api/universe/overrides
{
  "weekStart": "2026-03-10",
  "type": "force_include",
  "reason": "Must apply to YC before deadline",
  "config": { 
    "opportunityId": "yc-s25-application",
    "opportunityTitle": "YC S25 Application"
  },
  "createdBy": "venkat"
}
```

**Override Energy Mode:**
```bash
POST /api/universe/overrides
{
  "weekStart": "2026-03-17",
  "type": "set_energy_mode",
  "reason": "School exams coming up, force recovery mode",
  "config": { "mode": "recovery" },
  "createdBy": "venkat"
}
```

---

## Testing Checklist (Week 2 Test Gate)

### ✅ Must Pass Before Week 3:

1. **Laksh understands in <10 seconds**
   - [ ] Open Weekly OS panel
   - [ ] Read first move
   - [ ] Can explain what to do and why
   - [ ] No confusion about scores/rankings

2. **Each move explainable in one sentence**
   - [ ] Reasoning is natural language (not "Priority: 87")
   - [ ] Mentions concrete details (project names, deadlines)
   - [ ] Sounds like a human mentor said it
   - [ ] Max 2 reasons per move

3. **Energy mode makes sense**
   - [ ] Matches current reality (feels right)
   - [ ] Activity counts are accurate
   - [ ] Reasoning explains the mode choice
   - [ ] Mode affects move mix appropriately

4. **Override system works**
   - [ ] Can create override via API
   - [ ] Override shows in summary
   - [ ] Paused category doesn't appear
   - [ ] Force-included item appears first
   - [ ] Energy override changes mode

5. **Mentor tone passes**
   - [ ] No engineering jargon ("priority score", "rank", "weight")
   - [ ] Uses active voice ("Apply to X", not "X application recommended")
   - [ ] References specific projects/events by name
   - [ ] Feels personal, not generic

### Test Scenarios:

**Scenario 1: Normal Week (Build Mode)**
- Expected: 3 moves, mix of build/apply/connect
- Check: Moves build on recent projects
- Check: Deadlines within 2 weeks prioritized

**Scenario 2: High Activity (Exposure Mode)**
- Expected: 4 moves, more connect/speaking opportunities
- Check: Events and networking emphasized
- Check: Less time-intensive tasks

**Scenario 3: Pause Hackathons**
- Create override: pause_category = 'hackathon'
- Expected: No hackathon opportunities in moves
- Check: Override shows in summary

**Scenario 4: Force-Include Critical Deadline**
- Create override: force_include YC application
- Expected: YC appears in top 2 moves even if lower score
- Check: Reasoning still makes sense

---

## Technical Metrics

### Performance:
- Build time: 3.46s (up from 2.08s due to new engines)
- Bundle size: 506.58 kB (acceptable, under 512kB limit)
- Database migration: 3.3ms execution
- Worker startup: 16ms (fast)

### Code Stats:
- New files: 5 (1,313 lines total)
- Modified files: 2
- API endpoints added: 4
- Database tables added: 1

### Architecture:
- **Energy Check:** Pure function, no external deps
- **Override System:** CRUD operations, simple SQL
- **Compression Engine:** Stateless ranking, no LLM yet
- **UI Panel:** React component, fetch API

---

## What's Different from Original Gaps Panel

| Old (GapsOpportunitiesPanel) | New (WeeklyOSPanel) |
|------------------------------|---------------------|
| 780 lines of code | 300 lines of code |
| Shows all 23 opportunities | Shows 2-4 moves |
| Grouped by category | Ranked by composite score |
| Shows confidence scores | No scores visible |
| Generic reasoning | Context-aware reasoning |
| No energy awareness | Adapts to energy mode |
| No manual controls | Override system |
| "Gap detected in X" | "Builds on your recent Y work" |

---

## Known Limitations (Week 2)

1. **No historical tracking yet:** Doesn't remember what you picked last week
2. **No outcome feedback:** Can't learn from good/bad moves yet (Week 3: Room Tracker)
3. **Template reasoning:** Not LLM-generated (but sounds good enough for now)
4. **No notification system:** Must manually check weekly (could add push later)
5. **Override UI missing:** Must use API directly (could add admin panel)

---

## If Something Breaks

### Override not working:
```bash
# Check if override was created
curl "https://lakshveer.com/api/universe/overrides/2026-03-03" \
  -H "X-Universe-Auth: laksh-private-2026" | jq .

# Delete and recreate if malformed
curl -X DELETE "https://lakshveer.com/api/universe/overrides/OVERRIDE_ID" \
  -H "X-Universe-Auth: laksh-private-2026"
```

### Energy mode seems wrong:
- Check database has recent nodes (last 14 days)
- Verify node created_at timestamps are correct
- Try override: set_energy_mode to force correct mode

### No moves showing:
- Check opportunities endpoint works: `/api/universe/opportunities/intelligent`
- Verify privateMode is true (Weekly OS requires auth)
- Check browser console for errors

### Reasoning sounds generic:
- This is expected for opportunities without relatedNodes
- Week 3 (Room Tracker) will improve this with historical context
- Can manually improve by adding relatedNodes to opportunities

---

## Next Steps (Week 3 - Only if Test Gate Passes)

**Persona Gateway + Room Tracker:**
- 7 personas for world engagement (VC, organizer, sponsor, etc.)
- Room impact tracker (log outcomes, capture feedback)
- Pre-filled contact forms (30-sec friction)
- Proof-backed statements (no "talented", only concrete facts)

**Dependencies:**
- ✅ Week 2 test gate must pass
- ✅ Override system validated by Capt. Venkat
- ✅ Mentor tone approved by Laksh

---

## Summary

**Built:** 5 new files, 1,313 lines, 4 API endpoints, 1 database table  
**Time:** 3 hours (26h planned)  
**Status:** ✅ Deployed, ✅ Database migrated, ⏳ Ready for testing  
**Branch:** refactor/phase-2-weekly-os  
**Version:** c127e317-9eb7-4c00-87d6-dcefb6911289  

**Core Value Delivered:**
- 23 opportunities compressed to 2-4 clear moves
- Mentor-style reasoning (sounds human)
- Energy-aware recommendations
- Manual override controls
- Clean UI (no visible computation)

**Test Gate:** Must validate with Laksh this week before proceeding to Week 3.
