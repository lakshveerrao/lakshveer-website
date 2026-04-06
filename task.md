# Universe Page — Killer Rebuild

## Goal
A stranger (journalist, investor, mentor) lands, feels something, learns the story, and reaches out.

## What we're keeping
- Force simulation engine (works fine)
- Private mode toggle + intelligence layers
- All existing components (WikiPanel, SignalTimeline, etc.)
- `universe-data.ts` nodes (skills, tools, possibilities) — too rich to lose
- `universe-intelligence.ts` clusters, arcs, momentum

## What we're changing
- The full page layout and first-impression
- Node hover cards — real content, not just labels
- Click experience — story card, not panel tabs
- Add "Ask Lakshveer" floating input → /api/wiki/query
- Add social proof strip (live numbers)
- Make possibilities feel alive (pulsing, labeled as futures)
- Full-bleed canvas by default, panels collapse

## Layout (new)

```
┌─────────────────────────────────────────────────────┐
│ HERO STRIP (fixed top, 56px)                        │
│ "Lakshveer · 8 · 170+ builds · 126 signals · Ask ↗"│
├──────────┬──────────────────────────┬───────────────┤
│ LEFT     │                          │ RIGHT         │
│ (w-64)   │   FULL BLEED CANVAS      │ (w-80)        │
│ collapse │   (graph, the hero)      │ context panel │
│ by def   │                          │ slides in     │
│          │                          │ on node click │
│          │   floating ASK box       │ or tab switch │
│          │   bottom center          │               │
└──────────┴──────────────────────────┴───────────────┘
│ QUOTE TICKER (bottom, scrolling endorsements)       │
└─────────────────────────────────────────────────────┘
```

## Key UX moments

1. **Landing** — Hero strip tells the story in one line. Graph fades in with nodes settling.
2. **Hover node** — Rich tooltip: name, one-line story, key stat. NOT just label.
3. **Click node** — Right panel slides in: wiki article or capability card. Human, scannable.
4. **Ask anything** — Floating input bottom-center. User types → graph highlights matching nodes → answer in right panel.
5. **Possibilities** — Pulsing differently, labeled "What's next →", tooltip explains why it's plausible.
6. **Quote ticker** — Bottom scrolling strip: real quotes from endorsers. Rotating.
7. **Stats badge** — Top right: "78 nodes · 334 edges · centralized" from tweet inspiration.

## Node hover card format
```
[icon] CircuitHeroes
Trading card game · 300+ decks sold
₹1,00,000 grant · Trademark registered
```

## Right panel modes (simplified from 9 tabs to 3)
- NODE (default when node selected) — wiki/capability card
- STORY (when no node) — narrative arc, timeline
- ASK (when query active) — query result + highlighted nodes

## Social proof numbers (hardcoded from signals)
- 170+ builds documented
- 126 signals captured  
- 39 endorsers
- ₹1,40,000 in grants
- 13 press features
- 7 hackathons

## Rotating quotes (from signals)
1. "An 8-year-old showed up and built. That alone changed what we thought was possible." — Runable
2. "Laksh knows more about hardware than I did during my entire engineering." — Shubham Kukreti
3. "4 founders I'm really bullish on... Laksh of CircuitHeroes." — Roohi Kirit
4. "If there were more kids like Lakshveer..." — Dr. Aniruddha Malpani
5. "An 8-year-old just schooled us all at Hardware Hackathon." — Lion Circuits
6. "Huge influence on me re-thinking how curiosity doesn't have any age." — Besta Prem Sai
7. "Youngest founder ever in our Delta cohort" — The Residency

## Implementation plan
1. Rewrite universe.tsx top section (hero strip + quote ticker)
2. Refactor right panel: 3 modes, slide-in animation
3. Upgrade hover card: rich tooltip component
4. Add Ask box: floating input, POST /api/wiki/query, highlight nodes
5. Possibility nodes: pulsing animation + "What's next" label
6. Stats badge overlay on canvas
7. Left panel: collapsed by default, toggle
8. Keep ALL existing private mode / intelligence / wiki tabs intact

## Status
[ ] Hero strip
[ ] Quote ticker  
[ ] Rich hover cards
[ ] Right panel refactor (3 modes)
[ ] Ask anything box
[ ] Possibility node pulse
[ ] Stats badge
[ ] Left panel collapsed default
