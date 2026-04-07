# Universe Mobile UX Redesign

## Problems to solve
1. **Zero context** — visitor sees a blob of lines with no idea what they're looking at
2. **Header too small** — "Lakshveer" in 12px with nothing explaining who he is
3. **Graph is unnavigable** — 111 nodes, all visible, tangled, no entry point
4. **No onboarding** — no hint what nodes are, what to tap, what to do
5. **Toolbar is cryptic** — All/Clusters/Time, +/−/⊡ icons with zero explanation
6. **Node tap does nothing visible on mobile** — no card, no feedback

## Plan

### A. Header — make it a proper identity bar
- Bigger avatar (32px → 40px)
- "Lakshveer" in 16px bold
- Subtitle always visible on mobile: "8 · Builder · 170+ projects" 
- Back arrow on mobile too (go home)

### B. First-visit onboarding overlay (localStorage gated)
- Shows once, covers canvas
- Title: "Lakshveer's Universe"
- 3 lines: what this is, how to navigate, what to expect
- Two CTAs: "Explore the graph" + "Read his story →"
- Dismisses on tap anywhere / button
- Key facts: 8yo · 170+ builds · 4 years · Hardware+AI

### C. Hint strip (persistent, subtle)
- Below header, above canvas: single line "Tap any node to explore · pinch to zoom"
- Fades after 5s or on first tap
- Color: zinc-600, tiny text

### D. Graph — show fewer nodes by default on mobile
- Default: hide 'possibility' nodes (they clutter without adding context)
- Hide 'concept' nodes too (abstract, not meaningful to first-timer)
- Show: core, project, product, skill, tool, person, company, event, media, achievement
- This drops from 111 → ~90 nodes, much cleaner

### E. Node tap → bottom mini-card (mobile)
- Tapping a node shows a mini info card ABOVE the toolbar (not the full sheet)
- Shows: colored dot + name (18px) + type badge + 1-line description + stat
- Two buttons: "Learn more →" (opens full right panel) + "×" dismiss
- This is the KEY missing interaction — tap feedback

### F. Toolbar redesign
- Remove the cryptic ⊡ button
- Label the view modes properly: "All nodes" / "Clusters" / "Timeline"
- Make "Explore →" button more prominent (it's the main CTA)
- Add a color legend: 4 key node types with colored dots

### G. Legend overlay (bottom-left, always visible, compact)
- 4 dots with labels: 🔵 Projects  🟣 Skills  🟡 Tools  🩷 People
- Tiny, 10px, fades to 40% opacity after 3s

## Implementation order
1. Header fix (quick)
2. Node tap mini-card (highest impact)  
3. Onboarding overlay
4. Graph default filter (hide possibility + concept on mobile)
5. Hint strip
6. Legend
7. Toolbar labels
