# Universe UI Plan — Clean Slate Thinking

## The Real Problem
The page has two users baked into one UI:
- **Public visitor** (investor/mentor/journalist) → needs: understand Laksh fast, explore the graph, connect
- **Laksh (private)** → needs: intelligence dashboard, signals, health, wiki

Private mode tools are leaking visual complexity into the public experience.

---

## Mental Model: Two Modes, Same Canvas

### PUBLIC MODE (default, what 95% of visitors see)
Goal: Impress → Inform → Connect

**Hero strip — minimal:**
- Back arrow
- "Laksh · 8 · Builder" identity
- Ask box trigger (opens right panel with answer)
- "Connect" CTA button (opens right panel → participate tab)
- NO stats pills in header (move to canvas overlay — already there)
- NO quote ticker in header (lives in bottom strip)
- NO view mode switcher in header

**Left panel — collapsed by default, toggle via hamburger:**
- Section: "Explore by cluster" — 6 clusters (keep)
- Section: "Show" — 4 type toggles only: Projects · Skills · People · Future
  (cut: company, event, media, achievement, concept, core — these are graph internals)
- Possibilities toggle (keep — it's a key concept)
- NO filter chips with 10 options

**Right panel — 3 tabs only:**
1. **Insights** — default. Shows IntelligenceInsights (narrator + patterns). If ask query active, shows answer.
2. **Story** — GuidedJourney. The most compelling content for visitors.
3. **Connect** — ParticipationGateway. The conversion goal.
- Cut: signal-timeline tab (redundant with canvas timeline mode)

**Canvas controls:**
- Zoom +/− (keep, bottom-right)
- Reset (keep)
- View mode: small toggle INSIDE canvas bottom-left: `All · Clusters · Timeline`
  (move out of header, lives near the graph it controls)
- Stats badge top-right (keep, sm:flex)

**Ask box:**
- Keep floating at bottom center (it's the hero interaction)
- When answered → auto-opens right panel → Insights tab

### PRIVATE MODE (password-gated, Laksh only)
Public UI stays intact. Private mode ADDS:
- Right panel gets 2 more tabs: Feed · Wiki
- Left panel gets Intelligence section: Verification · Gaps · Weekly OS
- Canvas gets verification overlays
- That's it. No Surfaces, no Health in the panel tabs (move to dedicated routes or modals only)

---

## Specific Cuts

| Thing | Current | After |
|---|---|---|
| Header stats pills (5x) | Always visible | REMOVED |
| Header quote ticker | lg:visible | REMOVED from header |
| View mode in header | md:visible | MOVED to canvas bottom-left |
| Right panel tab: Timeline | Always | REMOVED (canvas has it) |
| Right panel tab: Surfaces | Private | REMOVED (modal only via left panel) |
| Right panel tab: Health | Private | REMOVED (modal only via left panel) |
| Left panel type filter | 10 chips | 4 toggles: Projects/Skills/People/Future |
| Left panel private tools | 3 buttons | KEEP but cleaner |
| Bottom quote strip | lg:hidden | KEEP |
| Mobile open button | Floating circle | KEEP |

---

## Tab Labels — Text Only, No Emojis
- `Insights` / `Story` / `Connect`
- Private adds: `Feed` / `Wiki`
- Small colored dot prefix (cyan for public, purple for private)

---

## Layout Cleanup

### Desktop
```
[← Laksh · 8]                    [Search]  [● Private]
─────────────────────────────────────────────────────
[▶ panel]  [         GRAPH CANVAS          ]  [◀ panel]
           [All · Clusters · Timeline]      [+][−][⌂]
           [     ✦ Ask anything…      ask →]
─────────────────────────────────────────────────────
(no bottom strip on desktop)
```

### Mobile
```
[☰ · Laksh]                          [● Private]
──────────────────────────────────────────────────
[              GRAPH CANVAS                      ]
[All · Clusters · Timeline]           [+][−][⌂]
[         ✦ Ask anything…       ask →]
[  ℹ︎ open panel ]   (floating)
──────────────────────────────────────────────────
[ "quote ticker" ]
```
Bottom sheet slides up when panel button tapped.

---

## What NOT to change
- Canvas rendering, simulation, physics — untouched
- Touch/pinch/pan — untouched  
- All component internals (IntelligenceInsights, GuidedJourney etc) — untouched
- Right panel node detail flow — untouched
- URL deep linking — untouched
- Password modal — untouched
