# Testing Family Zoo

This document inventories the ways we verify Family Zoo works, and when to reach for each. It's written for both human and AI collaborators working on the tutorials.

We test often, in many modes: as a player exploring, as an author authoring assertions, as a reviewer sanity-checking UX, and as an investigator isolating regressions. Each mode has a best-fit tool.

**Default posture:** reach for a `.transcript` first. Transcript assertions cover text, events, and state — that's the contract we want enforced in perpetuity. `probe.js` is the **escape hatch for deep logic checks that transcripts can't express**: arbitrary world-model queries, multi-step entity inspection, event-stream spelunking during exploration. When you find something via probe that *should* never regress, re-express it as a transcript assertion.

> Authoritative upstream reference: [`C:/code/npmsharpee/docs/guides/transcript-testing.md`](../../../npmsharpee/docs/guides/transcript-testing.md). If this doc and that guide disagree, the guide wins — update this file.

---

## Testing Modalities

Listed primary-first. Reach for transcript tooling before probe; drop to probe only when you need to inspect something a transcript can't express.

| Mode | What you do | Best tool | Output |
|---|---|---|---|
| **Systematic walkthrough** | Pre-author an expected sequence, verify every turn | `.transcript` file + `transcript-test` | PASS/FAIL per assertion |
| **Regression sweep** | Run every version's transcript at once | `transcript-test --all` or `npx sharpee build --test` | Summary + JSON results |
| **Blank-output hunt** | Find turns where the engine silently emits nothing | `transcript-runner.js` | Flags blanks automatically |
| **Event / semantic layer** | Verify the parser + action fired the right event regardless of prose | `[EVENT: true, type="..."]` in `.transcript` | Event-layer assertions |
| **Interactive REPL** | Drive the game from terminal, one line at a time | `transcript-test --play` | Text transcript in the terminal |
| **Play as a human** | Type commands, react to prose | Browser preview (portman) + Claude Preview | Visual, exactly what a reader sees |
| **Deep logic check (escape hatch)** | Inspect world model / trait state / event stream when a transcript can't express the question | `probe.js` | Text transcript + `:state`, `:entity`, `:events`, `:rooms`, `:contents` |

---

## Tools Inventory

All commands below run from the familyzoo repo root (`C:/code/text-games/sharpee/familyzoo/`). Prerequisite for anything that loads compiled code: `npm run build` (emits `dist/`).

### 1. Browser preview — the reader's experience

Portman-backed static server with live Claude Preview integration.

```bash
# Already wired — see .claude/launch.json
# In a Claude session:
#   preview_start(name="familyzoo-preview")
#   preview_screenshot(...)
#   preview_eval("window.location.href = '/familyzoo/v01/play.html'")
```

Direct URLs (server on port 9000):
- Landing: http://127.0.0.1:9000/familyzoo/
- Any version: http://127.0.0.1:9000/familyzoo/vNN/play.html

**Caveat:** `browser/vNN/familyzoo-NN.js` is a *pre-built* bundle committed to git. If you changed source, rebuild before trusting the preview. The browser build is not in `package.json` today (see Open Questions).

### 2. `probe.js` — deep logic check (escape hatch)

**Use this when a transcript can't express the check.** Examples: "does the scheduler actually have a pending fuse for the goat daemon?", "what traits does this entity carry after the lock is picked?", "which exit destinations resolve to undefined?", "did the event stream include action.blocked *anywhere* during this sequence?" If the thing you want to verify *can* be written as `[OK:]` / `[EVENT:]` / `[STATE:]`, write the transcript instead — that's the durable form.

Runs a single or batched set of commands against the compiled story, persists state to `.playstate.json` between invocations, and exposes debug commands (colon-prefixed).

```bash
npm run build

# One-shot: reset, look, examine, inspect
node C:/code/npmsharpee/probe.js . ":reset" "look" "examine sign" ":state" ":entity sign"

# Continue from saved state
node C:/code/npmsharpee/probe.js . "south" ":events"
```

Debug commands (pass as arguments, colon-prefixed):

| Command | Purpose |
|---|---|
| `:reset` | Delete save, start fresh |
| `:state` | Turn + location + inventory + score |
| `:entity <name>` | Dump traits + properties for matching entity |
| `:find <text>` | Locate entities by partial name/id/alias |
| `:rooms` | All rooms with exit table |
| `:contents <room>` | List what's in a room (with flags) |
| `:events` | Events from the last turn |
| `:score` | Score breakdown |
| `:world` | Entity counts by type |
| `:undo` | Undo last turn |

**Best for:** deep logic checks, trait/state inspection, event-stream spelunking. Not the default playthrough tool — use it when a transcript can't express what you need to verify. Anything important you learn here should get re-expressed as a transcript assertion so the check sticks.

### 3. `transcript-test` — walkthrough assertions

The canonical transcript runner, shipped with `@sharpee/transcript-tester` (already in devDeps).

```bash
npm run build

# Run a single transcript
./node_modules/.bin/transcript-test . tests/transcripts/v01-single-room.transcript

# Run every transcript in tests/transcripts/
./node_modules/.bin/transcript-test . --all

# Verbose (shows the actual game output for each assertion)
./node_modules/.bin/transcript-test . tests/transcripts/v01-single-room.transcript --verbose

# Chained walkthrough (state persists via $save / $restore between files)
./node_modules/.bin/transcript-test . --chain tests/transcripts/v01-*.transcript tests/transcripts/v02-*.transcript

# Interactive REPL — type commands, see output, no file
./node_modules/.bin/transcript-test . --play

# Stop at first failure, JSON report
./node_modules/.bin/transcript-test . --all -s -o test-results/
```

**Best for:** Authored expectations, CI-style regression, catching prose drift.

### 4. `transcript-runner.js` — blank-output detection

A wrapper around the same tester that *flags any turn that emits nothing* as a failure. Useful when modernizing because API drift often shows up as silent messages (message ID not found, language provider returning empty string, etc.).

```bash
npm run build
node C:/code/npmsharpee/transcript-runner.js . --verbose
```

**Best for:** Modernization passes. Silent output is almost always a bug.

### 5. `npx sharpee build --test` — one-shot build + everything

Ships in the `sharpee` CLI bin. Builds the `.sharpee` bundle + browser client, then runs every transcript.

```bash
./node_modules/.bin/sharpee build --test
./node_modules/.bin/sharpee build --test --verbose --stop-on-failure
```

**Best for:** "Did I break anything?" before committing.

---

## Writing `.transcript` Files — Quick Reference

Full spec: [`transcript-testing.md`](../../../npmsharpee/docs/guides/transcript-testing.md). Common cases:

```
title: Short title
story: familyzoo
description: What this file proves

---

## A section
> look
[OK: contains "Zoo Entrance"]
[OK: not contains "troll"]
[OK: contains_any "gate" "entrance"]
[OK: matches /\d+ rooms?/]

## Event-layer assertion (survives prose rewrites)
> take key
[EVENT: true, type="if.event.taken"]
[EVENT: false, type="action.blocked"]

## State-layer assertion
> put key in mailbox
[STATE: true, player.inventory not-contains key]
[STATE: true, mailbox contains key]

## Goal with pre/post-conditions
[GOAL: Unlock the gate]
[REQUIRES: inventory contains "key"]
[ENSURES: entity "gate" unlocked]

> unlock gate with key
[OK: contains "unlock"]

[END GOAL]

## Skip or TODO when appropriate
> do something not implemented yet
[TODO: waiting on v15 scheduler]
```

Control flow (`IF`, `WHILE`, `DO`/`UNTIL`, `RETRY`, `NAVIGATE TO`) and test commands (`$teleport`, `$take`, `$save`, `$restore`) are all in the upstream guide.

---

## Choosing a Modality (decision tree)

```
Do I know what "correct" looks like and want it enforced forever?
  → Write a .transcript under tests/transcripts/. Prefer [EVENT:] / [STATE:]
    for semantic claims, [OK:] for prose-sensitive claims.

Am I hunting a regression across versions?
  → transcript-test --all, or transcript-runner.js (adds blank-output detection).

Am I about to ship / close a ticket?
  → sharpee build --test from the repo root.

Am I exploring, forming a hypothesis, trying random commands?
  → transcript-test --play (terminal REPL), then promote findings to a transcript.

Is the question "does this LOOK right to a reader"?
  → Browser preview.

Is the question something a transcript can't express?  (e.g., "does the scheduler
have a fuse registered for daemonX?", "which entities have SceneryTrait but also
a non-empty ContainerTrait?", "what's the exact event ordering in a turn with
no prose change?")
  → probe.js. Inspect, learn, then try to express the finding as a transcript
    assertion so the check becomes durable.
```

---

## Per-Version Testing (important gotcha)

`probe.js` and `transcript-test` both load `dist/index.js` — which is whatever `src/index.ts` re-exports (today: **v17**). This means:

- Running the v01 transcript today actually validates it against v17 (a superset). It passes, but it's not testing v01 in isolation.
- To test v01 *specifically*, you have three options:
  1. **Temporarily re-export v01 from `src/index.ts`**, rebuild, run, then revert.
  2. **Build just v01's entry** (e.g., `tsc src/v01-entry.ts` emits the v01 tree into `dist/`) and point a runner at it. Needs tooling.
  3. **Rely on the pre-built browser bundle** (`browser/vNN/familyzoo-NN.js`) via the preview for human-style checks.

For the modernization passes planned on #1 and #2, expect to use option (1) or add a tiny CLI wrapper that swaps the default export. Track as a separate ticket if we decide we need it.

---

## Claude-Specific Notes

When the user says "test this", infer the modality:

- **"Check if v03 still works"** → `transcript-test . tests/transcripts/v03-scenery.transcript --verbose`.
- **"Did we break anything?"** → `transcript-test . --all`.
- **"Play through v01"** → browser preview (screenshots + in-window input) for UX; `transcript-test --play` for fast text play.
- **"What events does this action emit?"** → first try adding `[EVENT: true, type="..."]` to a transcript; if you need the raw stream to discover what's there, probe.js with `:events`.
- **"Show me the world state"** → probe.js with `:state`, `:rooms`, `:contents`, `:entity`. Durable state-layer claims go into a transcript with `[STATE:]`.
- **"Verify it renders correctly"** → browser preview + screenshot.

Default rule: if the check can be written as an `[OK:]` / `[EVENT:]` / `[STATE:]` assertion, write it as that. Probe is for questions those assertions can't express.

When writing transcripts, prefer:
1. One text assertion (`[OK: contains "..."]`) per prose-sensitive check.
2. One event assertion for the critical semantic claim — this is the part that *shouldn't* break when prose is reworded.
3. State assertions only for puzzles where the mutation is the point.
4. Generous `#` comments — these transcripts are tutorial material too; future readers learn from them.

---

## Open Questions / Follow-ups

- **No `npm test` script yet.** Current `package.json` only has `build` and `dev`. Worth adding `test`, `play`, `probe` scripts once we pick final conventions. File as a task.
- **No per-version entry selector.** See gotcha above. Candidate: a thin wrapper (`node scripts/test-version.js v01 tests/transcripts/v01-*.transcript`) that rebuilds with the right re-export.
- **`walkthroughs/` directory doesn't exist here.** Everything is unit-test style under `tests/transcripts/`. If we want chained save/restore across tutorial versions, we'll need one. Not clear we do — each version is a fresh story.
- **No CI yet.** Once we add GitHub Actions, the obvious job is `sharpee build --test`.
- **ADRs with deeper rationale:** ADR-073 (transcript testing), ADR-092 (smart directives), ADR-134 (generic tester extraction). In `C:/code/npmsharpee/docs/architecture/adrs/` if they exist locally.
