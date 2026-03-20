# Opportunity Engine v2 - Intelligence Layer

## The Problem with v1
- Dumb keyword matching
- Only looks at existing nodes in isolation
- No graph traversal
- No creative reasoning
- Just says "you match this org" - useless

## What We Actually Need

### 1. GRAPH INTELLIGENCE
The universe is a graph. Opportunities hide in:
- **Paths**: A → B → C connections that reveal non-obvious opportunities
- **Triangles**: If A connects to B and B connects to C, should A connect to C?
- **Clusters**: What capabilities combined unlock new possibilities?
- **Gaps**: What's missing that would unlock value?

### 2. INFERENCE TYPES

**A. Path-Based Opportunities**
- "You demoed to ISRO Chief → ISRO has youth programs → You have drone skills → Propose: ISRO Youth Drone Ambassador"
- "Malpani funded you → Malpani funds education startups → You teach STEM → Propose: Malpani Education Fellowship"

**B. Skill Combination Opportunities**
- Hardware + AI + Teaching → "AI-powered electronics tutor product"
- Robotics + Card Games + Sales → "Robotics card game for schools"
- 3D Printing + Drone + Vision → "Custom drone with CV capabilities"

**C. Network Leverage Opportunities**
- "Person X endorsed you → Person X advises Company Y → Company Y needs Z which you have"
- "You won Event A → Event A sponsored by Org B → Org B runs Program C you qualify for"

**D. Timing-Based Opportunities**
- "Hackathon X announced → You have all required skills → Entry deadline in 3 weeks"
- "Grant cycle opens March → Your project fits criteria → Start application now"

**E. Content/Narrative Opportunities**
- "You have 5 shipped products before age 9 → Media angle: youngest hardware entrepreneur"
- "CircuitHeroes + teaching experience → Book/course opportunity"

**F. Gap-Filling Opportunities**
- "Your drone cluster is weak → But you have all prerequisites → 2-week sprint could level up"
- "No computer vision projects shipped → But you know OpenCV → Ship one demo to unlock new category"

### 3. OPPORTUNITY STRUCTURE

```typescript
interface IntelligentOpportunity {
  id: string;
  type: 'path' | 'combination' | 'network' | 'timing' | 'content' | 'gap';
  
  // The insight
  title: string;           // "ISRO Youth Drone Program"
  insight: string;         // The non-obvious connection
  reasoning: string[];     // Step by step logic
  
  // Evidence from graph
  pathNodes: string[];     // Nodes involved in this reasoning
  pathEdges: string[];     // Edges that connect them
  
  // Value proposition
  valueForLaksh: string;
  valueForThem: string;
  mutualBenefit: string;
  
  // Actionability
  nextStep: string;        // Single concrete action
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  
  // Confidence
  confidence: number;      // How sure are we this is real
  novelty: number;         // How non-obvious is this
}
```

### 4. THE ENGINE

**Phase 1: Graph Analysis**
- Extract all paths of length 2-4 from Laksh node
- Find all triangles (potential introductions)
- Identify bridge nodes (high-connectivity nodes)
- Map skill clusters and their intersections

**Phase 2: Pattern Detection**
- Run pattern matchers for each opportunity type
- Score based on evidence strength
- Filter low-confidence matches

**Phase 3: LLM Reasoning**
- For high-potential patterns, use LLM to:
  - Validate the logic
  - Generate creative variations
  - Write compelling framing
  - Suggest specific actions

**Phase 4: Ranking & Display**
- Rank by (confidence × impact × novelty)
- Show on nodes as indicators
- Expandable cards with full reasoning

### 5. VISUAL INTEGRATION

**On Graph Nodes:**
- Glow/pulse for nodes with opportunities
- Badge count showing opportunity count
- Color coding by opportunity type

**On Click:**
- Slide-out panel with opportunities for that node
- Full reasoning chain visible
- One-click actions (generate outreach, add to queue)

### 6. EXAMPLE OUTPUTS

**Path-Based:**
```
💡 ISRO Youth Drone Ambassador
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You demoed CircuitHeroes to ISRO Chief (Jan 2026)
→ ISRO runs youth outreach programs
→ India pushing drone education in schools
→ You have drone + teaching + hardware skills

Opportunity: Propose yourself as ISRO's youth drone education ambassador

Value for ISRO: Authentic young voice, proven teaching ability, hardware credibility
Value for Laksh: National platform, ISRO association, drone skill validation

Next Step: Draft proposal to ISRO outreach department
Confidence: 72% | Effort: Medium | Timeline: 2-3 months
```

**Combination-Based:**
```
💡 RoboCards: Robotics Learning Card Game
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CircuitHeroes sold 300+ decks (proven format)
+ You have deep robotics knowledge
+ Schools need robotics curriculum
+ Card games work for STEM education

Opportunity: Create "RoboCards" - robotics concepts as card game

Value for Schools: Engaging robotics intro, no equipment needed
Value for Laksh: New product, leverages existing success, scales teaching

Next Step: Design 10 prototype cards for core robotics concepts
Confidence: 85% | Effort: Medium | Timeline: 1-2 months
```

**Network-Based:**
```
💡 South Park Commons Hardware Residency
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
You're connected to SPC through [node]
→ SPC runs founder residencies
→ They focus on technical founders
→ Your hardware portfolio is unique for your age

Opportunity: Apply for SPC residency or youth program

Value for SPC: Unique story, technical depth, long-term relationship
Value for Laksh: SF network, founder community, potential funding path

Next Step: Research SPC programs, find warm intro through [person]
Confidence: 65% | Effort: Low | Timeline: Immediate
```

### 7. IMPLEMENTATION PLAN

1. **Graph Traversal Functions**
   - getAllPaths(fromNode, maxLength)
   - findTriangles(node)
   - getClusterIntersections()
   - findBridgeNodes()

2. **Pattern Matchers**
   - pathOpportunityMatcher()
   - skillCombinationMatcher()
   - networkLeverageMatcher()
   - timingMatcher()
   - contentAngleMatcher()
   - gapFillingMatcher()

3. **LLM Integration**
   - validateOpportunity(pattern)
   - generateCreativeVariations(pattern)
   - writeCompellingFrame(opportunity)
   - suggestNextStep(opportunity)

4. **Visual Layer**
   - Node opportunity indicators
   - Opportunity panel component
   - Reasoning chain visualization

### 8. SUCCESS CRITERIA

Good opportunities should be:
- **Non-obvious**: Not just "apply to this grant"
- **Actionable**: Clear next step
- **Evidenced**: Based on real graph connections
- **Valuable**: Clear benefit to both parties
- **Novel**: Things Laksh/Venkat haven't thought of
