# Family Zoo — Current (Chord edition) — Claude Project Memory

> Project-specific context for Claude Code sessions in this folder. Shared context
> (toolchain, commands, testing standard, conventions) comes from the workspace
> `CLAUDE.md` one level up, which Claude Code loads automatically. Do not restate
> it here; link to it.

## Project Identity

**Name:** Family Zoo — Current (the finished zoo)
**Purpose:** The master story for a sixteen-step tutorial for Chord, the Sharpee
authoring language, and the hub's **Current** entry.
**Engine:** Sharpee / Chord. The exact version is pinned in `package.json`, held across
the whole `@sharpee/*` scope by an `overrides` block.
**Repository:** https://github.com/Johnesco/familyzoo
**Live:** https://johnesco.github.io/familyzoo/

## Project Context

Family Zoo builds one game across sixteen steps, v01 (one room, about fifty lines) to
v16 (the whole zoo, about eight hundred). Each step is published as its own repo,
`familyzoo-v01` … `familyzoo-v16`, so the hub can show the whole trail; the model is
[`multi-version-guide.md`](https://github.com/Johnesco/ifhub/blob/main/reference/multi-version-guide.md).

## Key Design Decisions (do not change without discussion)

- **One master, generated steps.** `familyzoo.story` is the finished zoo. Each step repo is
  the master sliced to the blocks introduced at or before that step, using the step map in
  the workspace tooling (not in this repo). Change the master and the step map, then
  re-lay the steps. Never hand-edit a step's `.story`: a re-lay overwrites it.
- **Step titles live in the step map.** A step's title appears in its `.story` header, its
  opening test card, `ifhub.conf`, its README, and here in `README.md` and `landing.json`.
  Renaming a step means changing the step map, not just those files.
- **Chord, not TypeScript.** Reworked from the 0.9.x TypeScript edition on 2026-09-10; the
  old edition is kept in `legacy/`. Chord 4.0 (Sharpee 5.5.0) removed the TypeScript
  hatches (`define text … from`, ADR-361 D1), so the story must be pure Chord.
- **Built output is the artifact.** `play.html`, `game.js`, `tests.html` and the walkthrough
  files are committed and served by GitHub Pages. IF Hub does not build or test: build in
  the workspace first, then ship.

## File Structure Overview

```
familyzoo/
├── CLAUDE.md              THIS FILE
├── README.md              public documentation, including the step table
├── ifhub.conf             the IF Hub card (versionPrimary = yes)
├── landing.json           prose for the GROUP landing page; build_landing.py renders it
├── index.html             into index.html for the whole trail
├── familyzoo.story        the master story
├── familyzoo.tests.json   the master's tests
├── play.html, game.js     the built player
├── tests.html             the test report
├── walkthrough*.txt       walkthrough, its output, and the guide
├── src/                   browser entry plus generated story-ir.ts / version.ts
└── legacy/                the 0.9.x TypeScript edition
```

## Working in this project

**SDLC profile:** core

Shared rules live in the workspace `../CLAUDE.md` (loaded automatically). Build and ship:

```bash
python ../tools/build.py familyzoo --force        # rebuild the master
python ../tools/build.py familyzoo-vNN --force    # rebuild one step: game.js, tests.html, walkthrough
python C:/code/ifhub/tools/ship.py familyzoo-vNN  # publish one step + register it on the hub
python C:/code/ifhub/tools/build_landing.py familyzoo --force   # regenerate index.html
```

`ship.py` takes one game per run. Use `--refresh-pages` when a title changes, so the
step's own `index.html` is rewritten. Building and testing tools exist only in the local
workspace; a cloud session can run `npx sharpee test` but cannot produce `tests.html`.

This project uses the [sdlc-baseline](https://github.com/Johnesco/sdlc-baseline) universal
workflow. Claude must follow these canonical docs:

- [Workflow (7 steps)](https://github.com/Johnesco/sdlc-baseline/blob/main/docs/workflow.md)
- [Roles & hat-switch protocol](https://github.com/Johnesco/sdlc-baseline/blob/main/docs/roles.md)
- [Definition of Done](https://github.com/Johnesco/sdlc-baseline/blob/main/docs/definition-of-done.md)
- [Severity & priority matrix](https://github.com/Johnesco/sdlc-baseline/blob/main/docs/severity-matrix.md)
- [Commit, PR, and branch conventions](https://github.com/Johnesco/sdlc-baseline/blob/main/docs/commit-conventions.md)
- [Release management](https://github.com/Johnesco/sdlc-baseline/blob/main/docs/release-management.md)
- [Testing](https://github.com/Johnesco/sdlc-baseline/blob/main/docs/testing.md)
- [Backlog hygiene](https://github.com/Johnesco/sdlc-baseline/blob/main/docs/backlog-hygiene.md)
- [ADR protocol](https://github.com/Johnesco/sdlc-baseline/blob/main/docs/adrs.md)
- [Profiles](https://github.com/Johnesco/sdlc-baseline/blob/main/docs/profiles.md)

**Three non-negotiables:**

1. **No code without a ticket.** An Issue, or an ADR stub for a decision.
2. **Decide before you build.** Anything above a tuning tweak gets a six-line ADR stub first.
3. **Claude cannot QA its own work.** The Verify column is always human-owned.

## Project History

### Recent Changes
- 2026-10-28: v16 renamed "After Hours & Story States" on branch
  `claude/vibrant-archimedes-uhwg0l` here and in `familyzoo-v16`. Not merged yet; the step
  map still needs the new title.
- 2026-10-27: All sixteen steps moved to Sharpee 5.5.0 (Chord 4.0.0) and rebuilt. v16's
  TypeScript hatch (`chord-extras.ts`) was replaced by `define phrase flavor, cycling` and
  `define phrase aside, first-time`. This master on GitHub is still on 5.4.1 with the hatch.
- 2026-09-17: All sixteen steps and this master shipped on Sharpee 5.4.1.
- 2026-09-10: Chord edition replaced the 0.9.x TypeScript edition (kept in `legacy/`).
