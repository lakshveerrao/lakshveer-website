# raw/

This is the ground truth. The LLM never edits files in here.

## What lives here

**signals.json** — Every meaningful public event, mention, or artifact
associated with Lakshveer Rao. Each signal is a typed, structured record:

```json
{
  "id": "sig-isro-meeting-2025",
  "source": "event",
  "title": "ISRO Chairman Demo — Lakshveer demonstrated electronics to Shri S. Somanath",
  "date": "2025-04",
  "entities": ["ISRO", "S. Somanath", "Lakshveer"],
  "domains": ["electronics", "robotics", "space"],
  "organizations": ["ISRO"],
  "rawText": "...",
  "confidence": "high",
  "surface": "conference"
}
```

## The pattern (Karpathy / Farza)

Karpathy described compiling a personal research wiki from raw documents.
Farza built "Farzapedia" from 2,500 diary entries and Apple Notes.

This is the same pattern — but instead of unstructured diary text,
the raw input is **typed signal data**. Structured from the start.

The compiler reads signals.json → writes /public/wiki/ as markdown articles.
The wiki is built for agents to navigate, not humans to read.
index.md is the entry point. Backlinks connect everything.

## How to add a new signal

Add an entry to signals.json following the schema.
Then run:

```bash
bun run wiki:compile
```

The compiler will create or update affected articles automatically.

## How to query the wiki

```bash
bun run wiki:query "What is Lakshveer's strongest domain?"
```

The agent reads index.md, drills into relevant articles, returns an answer,
and files the output back into /public/wiki/queries/.

## Rule

Human adds to raw/. LLM owns wiki/. Never the other way around.
