# Lakshveer Rao — Personal Knowledge Wiki

This wiki is not written by a human.

It is compiled by an LLM from structured signal data — every meaningful
event, mention, project, and artifact in Lakshveer's public record.

**It is built for agents to read, not humans.**

## The pattern

```
src/raw/signals.json     ← human adds signals here (ground truth)
        ↓
  LLM compiler           ← bun scripts/compile-wiki.ts
        ↓
  public/wiki/           ← LLM owns this entirely
    index.md             ← agent entry point
    people/
    projects/
    orgs/
    domains/
    concepts/            ← emergent patterns LLM discovered
    meta/
      narrative.md       ← compiled story + timeline
      gaps.md            ← what's missing
      connections.md     ← non-obvious links + predictions
    queries/             ← past queries filed back in
```

## How agents should use this

Start at `index.md`. Follow backlinks. The meta/ articles give compiled analysis.
Past queries in `queries/` show what has already been asked and answered.

## How humans update it

1. Add a signal to `src/raw/signals.json`
2. Run `bun run wiki:compile`
3. The LLM updates affected articles

Never edit wiki files manually. They will be overwritten on next compile.

## How to query

```bash
bun run wiki:query "What is Lakshveer's strongest technical domain?"
```

The agent reads index.md, drills into relevant articles, answers,
and files the output into `queries/` — enriching the wiki for future queries.

## Source

Inspired by Andrej Karpathy's LLM Knowledge Base system and Farza Majeed's Farzapedia.
Built on top of lakshveer.com/universe — a live public intelligence graph.
