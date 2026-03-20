# LAKSH UNIVERSE — LEVERAGE ENGINE: Gap Analysis

## WHAT'S BUILT vs WHAT'S NEEDED

### 1. ECOSYSTEM EXPANSION ENGINE ❌ NOT BUILT

**Required:**
- Auto-crawl external nodes (person/org/company)
- Extract: portfolio companies, clients, grants, scholarships, events, sponsors
- Store as ecosystem subgraph
- Cache results

**Current State:**
- Manual node creation only
- No crawling/scraping
- No ecosystem extraction
- Static data

**To Build:**
- [ ] Scraper service for websites/LinkedIn
- [ ] Entity extraction from scraped content
- [ ] Ecosystem subgraph storage (new table: `ecosystem_entities`)
- [ ] Cache layer for crawled data
- [ ] UI to trigger crawl in private mode

---

### 2. ALIGNMENT ENGINE ❌ NOT BUILT

**Required:**
- Compute alignment score (0-100) based on:
  - Skill cluster overlap
  - Project similarity
  - Hardware/AI intersection
  - Stage compatibility
  - Thematic match
  - Recency
- Only scores > threshold trigger opportunities
- NO hardcoding

**Current State:**
- Hardcoded opportunity patterns
- No dynamic alignment scoring
- No skill/project comparison

**To Build:**
- [ ] Alignment scoring algorithm
- [ ] Skill cluster comparison
- [ ] Project similarity matching
- [ ] Thematic keyword extraction
- [ ] Store alignment scores per node pair

---

### 3. OPPORTUNITY ENGINE ⚠️ PARTIAL (Basic)

**Required:**
- Generate categorized opportunities:
  - Invite, Grant, Scholarship, Partnership, Sponsorship, Collab, Learning, Pitch
- Include: Why relevant, Why Laksh fits, Mutual benefit, Next step
- Triggered by alignment score

**Current State:**
- Basic pattern matching (5 patterns)
- Generic descriptions
- Not connected to ecosystem data
- Categories limited

**To Build:**
- [ ] Expand opportunity categories (8 types)
- [ ] Connect to alignment engine
- [ ] Generate specific reasoning per opportunity
- [ ] Add "next step" action items
- [ ] Link to ecosystem entities

---

### 4. VALUE FRAMING ENGINE ❌ NOT BUILT

**Required:**
- For each opportunity, generate TWO perspectives:
  - A) Why it benefits Laksh (skill growth, exposure, network, validation, resources)
  - B) Why it benefits them (unique narrative, demo builds, case study, visibility)

**Current State:**
- None

**To Build:**
- [ ] Benefit calculation for Laksh
- [ ] Benefit calculation for counterparty
- [ ] Store/display both perspectives
- [ ] No vague positioning

---

### 5. AUTOMATED OUTREACH ENGINE ⚠️ PARTIAL (Basic)

**Required:**
- Auto-draft when opportunity score > threshold
- Include: Connection path, Why now, Specific ask, Mutual value, Proof links (max 3)
- Status tracking: Drafted → Reviewed → Sent → Replied → Follow-up

**Current State:**
- Basic draft generation exists
- Generic template (not personalized)
- Status tracking exists but incomplete
- No auto-trigger from opportunities

**To Build:**
- [ ] Personalized draft generation
- [ ] Connection path calculation
- [ ] Trigger from high-score opportunities
- [ ] Better proof link selection
- [ ] Follow-up tracking

---

### 6. PUBLIC MODE ⚠️ PARTIAL

**Required:**
- Show: Verified relationships, Ecosystem expansions, Alignment highlights
- "How to collaborate" section per node
- Hide: Internal scores, Confidence metrics, Inference logic

**Current State:**
- Shows verified nodes/edges
- No ecosystem expansions
- No "how to collaborate" section
- Hides private data correctly

**To Build:**
- [ ] "How to collaborate" per external node
- [ ] Ecosystem highlights (public view)
- [ ] Alignment highlights for visitors

---

### 7. PRIVATE MODE ✅ MOSTLY DONE

**Required:**
- Alignment score breakdown
- Confidence score
- Data source references
- Ecosystem entities
- Opportunity scoring logic
- Outreach drafts
- Review controls

**Current State:**
- Confidence scoring ✓
- Verification dashboard ✓
- Gaps/Opportunities panels ✓
- Outreach queue ✓ (basic)
- Password protected ✓

**To Build:**
- [ ] Alignment score breakdown UI
- [ ] Ecosystem entity viewer
- [ ] Data source references display

---

### 8. VERIFICATION SYSTEM ✅ DONE

**Current State:**
- All inferred edges show source + confidence
- Approval toggle exists
- Separates verified/pending/inferred
- Audit logging

---

### 9. WEEKLY ACTION DASHBOARD ❌ NOT BUILT

**Required:**
- Top 5 highest leverage opportunities
- Top 3 relationship updates to send
- Top 2 skill gaps blocking next level
- Underleveraged connections
- Ecosystem expansions not yet explored

**Current State:**
- `weekly_reflections` table exists but empty
- No generation logic
- No UI

**To Build:**
- [ ] Weekly dashboard UI
- [ ] Leverage opportunity ranking
- [ ] Relationship update suggestions
- [ ] Gap impact analysis
- [ ] Underleveraged connection detection

---

## PRIORITY ORDER FOR IMPLEMENTATION

### Phase A: Alignment + Value Engine (Foundation)
1. Alignment scoring algorithm
2. Value framing for both sides
3. Connect to existing opportunity engine

### Phase B: Ecosystem Expansion
1. Web scraper service
2. Entity extraction
3. Ecosystem subgraph storage
4. UI for private mode

### Phase C: Smart Outreach
1. Personalized draft generation
2. Auto-trigger from alignment scores
3. Connection path display
4. Follow-up tracking

### Phase D: Weekly Dashboard
1. Opportunity ranking
2. Action recommendations
3. Gap analysis
4. Underleveraged detection

### Phase E: Public Mode Enhancements
1. "How to collaborate" sections
2. Ecosystem highlights
3. Visitor CTAs

---

## ESTIMATED EFFORT

| Component | Status | Effort |
|-----------|--------|--------|
| Ecosystem Expansion | ❌ | HIGH |
| Alignment Engine | ❌ | MEDIUM |
| Opportunity Engine | ⚠️ | MEDIUM |
| Value Framing | ❌ | LOW |
| Outreach Engine | ⚠️ | MEDIUM |
| Weekly Dashboard | ❌ | MEDIUM |
| Public Enhancements | ⚠️ | LOW |

**Total: ~60% of Leverage Engine not built**
