# Family Zoo — Claude Project Memory

> This file serves as persistent context for Claude Code sessions. It is automatically read at the start of every conversation. Keep this document updated as the project evolves.

<!-- ============================================================
     PROJECT-SPECIFIC SECTIONS
     ============================================================ -->

## Project Identity

**Name:** Family Zoo Tutorial
**Purpose:** Progressive Sharpee tutorial — 17 versions that build a small family zoo interactive fiction game, each adding exactly one new engine concept
**Target Users:** Developers learning to author interactive fiction with the Sharpee TypeScript engine
**Repository:** https://github.com/Johnesco/familyzoo
**Project Board:** https://github.com/users/Johnesco/projects/5
**Live Site:** https://johnesco.github.io/familyzoo/ _(GitHub Pages deploy — verify)_

## Project Context

Family Zoo is a teaching codebase, not a single game. It delivers the same fictional zoo across 17 source files, each of which is a **self-contained, playable Sharpee story**:

- `v01` is the minimum viable story (one room, two pieces of scenery).
- `v02`–`v16` each add exactly one concept on top of the previous version, culminating in a full scoring/endgame game.
- `v17` re-organizes v16 into a multi-file project and adds an after-hours phase.

Every version is its own build target via `ifhub.conf`. The `src/index.ts` re-export defines which version is the "current" default (today: v17). Each version has its own transcript walkthrough in `tests/transcripts/` (v01–v16 today) and its own browser landing page in `browser/v##/`.

The authored docs in `docs/` pair with the source: `docs/tutorial.md` is the reader-facing walkthrough and `docs/v01-*.md` … `docs/v16-*.md` are per-version deep-dives.

**Current primary goal:** bring the tutorials up to date with the current Sharpee release (`@sharpee/*` 0.9.111). The tutorials were written against an earlier API and may drift from the current guides in `C:/code/npmsharpee/docs/guides/`. Update work should land one version at a time with matching spec, CLAUDE.md, and walkthrough updates.

## Sharpee Architecture

This is a Sharpee story project (TypeScript). Key patterns:

- Each version is a `Story` implementation with `config`, `createPlayer`, `initializeWorld`, and optional lifecycle hooks (`onEngineReady`, `extendParser`, `extendLanguage`, `getCustomActions`).
- v01–v16 live as single files (`src/vNN.ts`) with a matching `src/vNN-entry.ts` browser bootstrap.
- v17 is a multi-file story in `src/v17/` split by concern (zoo-map, zoo-items, characters, events, scoring, language, index).
- Rooms, items, scenery, NPCs are entities with composable traits (`IdentityTrait`, `RoomTrait`, `ContainerTrait`, `OpenableTrait`, `LockableTrait`, `SwitchableTrait`, `LightSourceTrait`, `SceneryTrait`, `ReadableTrait`, `NpcTrait`, `PettableTrait`, etc.).
- Timed behavior uses `plugin-scheduler` daemons and fuses; NPCs use `plugin-npc` with built-in or custom `NpcBehavior`s.
- All player-facing text flows through the language provider via message IDs — never hardcoded English in actions.
- Custom actions follow the four-phase pattern: `validate` → `execute` → `report` / `blocked`.

See `C:/code/npmsharpee/docs/guides/` for the canonical engine reference. If a tutorial disagrees with the current guide, the guide wins — flag and update.

## File Structure Overview

```
familyzoo/
├── CLAUDE.md                     # THIS FILE
├── README.md                     # Public documentation (TODO — not yet authored)
├── package.json                  # @sharpee/* 0.9.111 deps, tsc build
├── tsconfig.json
├── ifhub.conf                    # Multi-target hub config (17 build targets)
├── landing.json                  # Per-version blurbs for the landing page
├── .github/
│   ├── ISSUE_TEMPLATE/           # sdlc-baseline issue templates
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/                # GitHub Pages deploy
├── browser/
│   ├── index.html                # Landing page (lists v01–v17)
│   ├── play-template.html        # Per-version play shell template
│   ├── play.html                 # Top-level "play latest" entry
│   ├── styles.css
│   └── v01 … v17/                # Per-version playable HTML + compiled JS
├── docs/
│   ├── tutorial.md               # Reader-facing progressive walkthrough (all 16 versions)
│   ├── v01-a-single-room.md
│   ├── v02-multiple-rooms.md
│   ├── …
│   ├── v16-scoring-endgame.md
│   └── functional-spec.md        # Authoritative feature spec (THIS project's source of truth)
├── src/
│   ├── index.ts                  # Re-exports the current default version (v17)
│   ├── browser-entry.ts          # Browser bootstrap for the default version
│   ├── v01.ts      + v01-entry.ts
│   ├── v02.ts      + v02-entry.ts
│   ├── …
│   ├── v16.ts      + v16-entry.ts
│   └── v17/                      # Multi-file story
│       ├── index.ts
│       ├── zoo-map.ts
│       ├── zoo-items.ts
│       ├── characters.ts
│       ├── events.ts
│       ├── scoring.ts
│       └── language.ts
├── tests/
│   └── transcripts/
│       ├── v01-single-room.transcript
│       ├── …
│       └── v16-scoring.transcript
└── dist/                         # tsc output (gitignored)
```

> When adding a new version, update: `src/vNN.ts`, `src/vNN-entry.ts`, `ifhub.conf`, `landing.json`, `browser/vNN/`, `docs/vNN-*.md`, `docs/tutorial.md`, `tests/transcripts/vNN-*.transcript`, and this file.

## Key Technical Patterns

### Version File Template

Each single-file version (v01–v16) follows the same structure:

```typescript
// Header comment: WHAT YOU'LL LEARN / TRY IT / BUILD & RUN
import { Story, StoryConfig } from '@sharpee/engine';
import { WorldModel, IFEntity, EntityType, ... } from '@sharpee/world-model';

const config: StoryConfig = { id: 'familyzoo-vNN', title, author, version, description };

class FamilyZooStory implements Story {
  config = config;
  createPlayer(world: WorldModel): IFEntity { … }
  initializeWorld(world: WorldModel): void { … }
  // Optional: onEngineReady, extendParser, extendLanguage, getCustomActions
}

export const story = new FamilyZooStory();
export default story;
```

### Teaching Comments

Tutorial files are **heavily commented for beginners**. Keep banners, section headers, and "why this matters" notes when editing. Don't strip comments to save space.

### One Concept Per Version

The core invariant: **v(N+1) adds exactly one new idea on top of v(N)**. When updating a version, do not retroactively introduce later concepts. If a guide change requires a new concept earlier, that is a spec change and must be ticketed.

### Language Layer Messages

```typescript
// GOOD — goes through the language provider
events.push(context.event('action.success', { messageId: 'zoo.feeding.fed_goats' }));

// BAD — hardcoded English
events.push({ text: 'The goats eat the feed.' });
```

### Per-Version Browser Bootstrap

Each `vNN-entry.ts` is a nearly-identical shell; only the import (`./vNN.js`), the `storagePrefix`, and the save-key namespace change. Keep them aligned when updating the default bootstrap.

## Data Formats

### Version Metadata (`ifhub.conf`)

```ini
[target.familyzoo-NN]
hub = yes
entry = src/vNN-entry.ts
binary = familyzoo-NN.js
subpath = vNN
title = Family Zoo vNN: <Concept>
description = Sharpee tutorial step NN — <Concept>.
walkthrough = tests/transcripts/vNN-<slug>.transcript
versionOf = familyzoo
versionLabel = vNN — <Concept>
# Only on the current default version:
versionPrimary = yes
versionPrimaryLabel = Current
```

### Version Blurb (`landing.json`)

```json
{
  "familyzoo-NN": {
    "summary": "2–3 sentence overview of what this version demonstrates.",
    "features": [
      "Feature or API introduced",
      "Engine primitive wired up",
      "Teaching callout"
    ]
  }
}
```

### Transcript (`tests/transcripts/vNN-*.transcript`)

```
title: <Version Title>
story: familyzoo-NN
description: <what this walkthrough proves>

---

> look
[OK: contains "Zoo Entrance"]

> take sign
[OK: contains "can't"]
```

See `C:/code/npmsharpee/docs/guides/transcript-testing.md` for the full assertion syntax.

## Current Feature Status

### Implemented (per-version concept additions)

- [x] v01 — A Single Room (`Story`, `RoomTrait`, `SceneryTrait`, player placement)
- [x] v02 — Multiple Rooms & Navigation (`Direction`, `RoomTrait.exits`)
- [x] v03 — Scenery detail (`SceneryTrait`, alias lists)
- [x] v04 — Portable Objects (`EntityType.ITEM`, take/drop/inventory)
- [x] v05 — Containers & Supporters (`ContainerTrait`, `SupporterTrait`)
- [x] v06 — Openable Things (`OpenableTrait`)
- [x] v07 — Locked Doors & Keys (`LockableTrait`, `DoorTrait`, `via`)
- [x] v08 — Light & Dark (`isDark`, `LightSourceTrait`, `SwitchableTrait`)
- [x] v09 — Readable Objects (`ReadableTrait`)
- [x] v10 — Switchable Devices (`SwitchableTrait` standalone)
- [x] v11 — NPCs (`NpcPlugin`, `NpcTrait`, `NpcBehavior`)
- [x] v12 — Event Handlers (`registerEventHandler`, `chainEvent`)
- [x] v13 — Custom Actions (four-phase `Action`, grammar, language)
- [x] v14 — Capability Dispatch (`registerCapabilityBehavior`)
- [x] v15 — Timed Events (`SchedulerPlugin`, daemons, fuses)
- [x] v16 — Scoring & Endgame (`setMaxScore`, `awardScore`, victory daemon)
- [x] v17 — After Hours & Multi-File Organization (behavior swap, gated daemon)

### In Progress

- [ ] _(nothing tracked yet — use `gh issue list` once the board is live)_

### Planned / Known Gaps

- [ ] Tutorial accuracy pass against `@sharpee/*` 0.9.111 guides — every version
- [ ] `docs/v17-*.md` per-version doc (currently only v01–v16 have per-version docs)
- [ ] `tests/transcripts/v17-*.transcript` walkthrough
- [ ] `README.md` at the repo root
- [ ] GitHub Projects board + labels set up via `scripts/setup-labels.sh` (from sdlc-baseline)

<!-- ============================================================
     SDLC WORKFLOW
     This section is universal. It works across any project that
     uses GitHub Issues + Projects for tracking.

     Source: https://github.com/Johnesco/sdlc-baseline
     ============================================================ -->

## Instructions for Claude

### Roles and Responsibilities

| Role | Owner | Board Columns | Key Rule |
|------|-------|---------------|----------|
| **PO** (Product Owner) | Human | Backlog, Done | Decides priority, accepts work |
| **BA** (Business Analyst) | Human or Claude | Backlog, Ready | Scopes tickets, writes acceptance criteria |
| **Dev** (Developer) | Claude (primary) | In Progress | Writes code, follows conventions |
| **Documenter** | Claude (bundled with Dev) | In Progress | Updates spec, CLAUDE.md, README |
| **QA** (Quality Assurance) | **Human (always)** | **Verify** | Verifies completed work |

> **The most important rule: Claude cannot QA its own work.** The Verify column is always human-owned. The person or AI that wrote the code is not qualified to verify it.

**Hat-switch protocol:** When working with Claude, explicitly state which role you're in to keep the interaction predictable:
- `"PO hat — let's prioritize the backlog."`
- `"BA mode — help me scope this feature."`
- `"Dev time — implement ticket #12."`
- `"QA check — I'm testing what you built."`

### Ticket-First, Documentation-Aware Workflow (MANDATORY)

Every software change — feature, bug fix, refactor, or data update — follows this sequence. No step may be skipped.

The **Functional Specification** (`docs/functional-spec.md`) is the authoritative record of what Family Zoo teaches, how the versions are structured, and what each version demonstrates. It is the single source of truth for this tutorial series. The per-version prose in `docs/vNN-*.md` and `docs/tutorial.md` is derivative — if prose and spec disagree, the spec wins.

**Before ANY change**, follow these steps in order:

1. **Capture as a ticket** — Create a GitHub Issue describing the change before any other work begins. Include a clear title, relevant labels, acceptance criteria, and an associated **milestone**. Every issue must belong to an existing milestone by the time it ships; if no existing milestone fits, create a new one. No code is written without a ticket.

   > **IMPORTANT — Add to Project Board:** After creating the issue, you **must** also add it to the GitHub Projects board. The `gh issue create` command does **NOT** auto-add issues to the project board. Run this immediately after creating the issue:
   > ```
   > gh project item-add [PROJECT_NUMBER] --owner Johnesco --url [ISSUE_URL]
   > ```
   > An issue that is not on the board is considered incomplete. This is a known gotcha — do not skip this step.

2. **Review documentation for affected areas** — Read the relevant sections of `docs/functional-spec.md`, `docs/tutorial.md`, the per-version `docs/vNN-*.md`, this CLAUDE.md, and the matching Sharpee guide in `C:/code/npmsharpee/docs/guides/`. Identify what exists, what will be impacted, and note any discrepancies.

3. **Flag discrepancies** — If existing code already differs from what the documentation says, stop and flag the mismatch for validation before proceeding. Do not silently "fix" documentation to match code or vice versa without explicit confirmation. **Tutorial/Guide drift is expected** (the tutorials are dated) — surface it, don't paper over it.

4. **Refine the ticket** — Based on the documentation review, update the GitHub Issue with additional context, affected doc sections, and a plan for documentation updates. The ticket should reflect the full scope of work including doc changes.

5. **Implement the change** — Write the code. Reference the ticket number (`#XX`) in commits.

6. **Update all documentation** — Update the Functional Specification, per-version docs, `docs/tutorial.md`, CLAUDE.md, README.md, `landing.json`, `ifhub.conf`, and transcript walkthroughs so they accurately reflect the new state. This is not optional — a change is not complete until its documentation is current.

7. **Verify consistency** — After updating, confirm that the documentation and code are in agreement. Any remaining gaps must be called out explicitly.

**Key rules:**
- No code without a ticket — every change starts as a GitHub Issue
- A change without a corresponding documentation update is considered **incomplete**
- Documentation updates are part of the definition of done, not a follow-up task
- When in doubt about whether docs need updating, they do
- The Functional Specification is the primary document; CLAUDE.md, README.md, and per-version docs are secondary but must stay consistent

### Compressing Steps for Small Changes

Not every change needs the full ceremony. Here's when you can compress:

- **Data-only changes** (fixing a typo in a room description, adjusting a landing blurb): Steps 2-4 can compress into a quick scan. Still need a ticket (Step 1) and human verification (Step 7).
- **Bug fixes with obvious cause** (e.g. broken walkthrough assertion): Step 2 becomes "confirm the spec describes the expected behavior." Steps 3-4 can compress into a single issue comment.
- **Documentation-only changes**: Step 5 becomes "edit the docs" instead of "write code." Step 6 is the main deliverable.
- **When NOT to compress**: Adding or reshaping a version, changing what a version teaches, API migrations across all 17 versions, anything that modifies player-facing behavior or introduces a new Sharpee concept.

### When Making Changes

1. **Ticket first** — Follow the workflow above before all else
2. **Read before editing** — Always read the target version file, its transcript, and its doc before modifying
3. **Preserve the teaching structure** — Keep the header comment block, step comments, and one-concept-per-version invariant
4. **Follow existing patterns** — Match the Sharpee conventions already in use (message IDs, trait composition, four-phase actions)
5. **Keep it simple** — Tutorial code is explicit on purpose. Don't refactor to be clever; refactor to be clearer.

### Testing

Full testing guide: [`docs/testing.md`](docs/testing.md).

Quick map:

- **Default posture:** write a `.transcript`. Transcripts can assert text (`[OK:]`), events (`[EVENT:]`), and world state (`[STATE:]`). That's the durable form — check it in under `tests/transcripts/`.
- **`transcript-test` CLI** (in `node_modules/.bin`) runs transcripts or drops into `--play` REPL mode. Use `--all` for regression sweeps and `--verbose` when an assertion misbehaves.
- **`probe.js` at `C:/code/npmsharpee/probe.js`** is the **escape hatch for deep logic checks** — inspect world-model state, traits, event streams, scheduler fuses, etc. when a transcript can't express the question. Anything you discover here that should *never regress* gets promoted to a transcript assertion.
- **`transcript-runner.js` at `C:/code/npmsharpee/transcript-runner.js`** adds blank-output detection on top of the standard runner — useful for modernization passes where silent messages signal missing message IDs.
- **Browser preview** via `.claude/launch.json` (portman-backed) for visual/UX checks. Each version lives at `http://127.0.0.1:9000/familyzoo/vNN/play.html`.
- **Gotcha:** probe + transcript-test both load `dist/index.js` (= default export, currently v17). For v01-specific testing you'll need to swap the re-export or build a per-version variant. See `docs/testing.md` for the full list.

### Maintaining Documentation

**UPDATE the Functional Specification** (`docs/functional-spec.md`) when you:
- Add, remove, or re-scope a version
- Change what concept a version teaches
- Change the data formats in `ifhub.conf`, `landing.json`, or transcripts
- Change the build / publish pipeline

**UPDATE `docs/tutorial.md` and the per-version `docs/vNN-*.md`** when you:
- Change any version's code in a way that affects the narrative walkthrough
- Introduce new APIs, traits, or patterns
- Update the "Try" commands or "Common mistake" notes

**UPDATE CLAUDE.md** when you:
- Add new source files or reorganize the tree
- Change which version is the default export in `src/index.ts`
- Modify the build/publish flow or add new tooling
- Make significant design decisions

**UPDATE README.md** when changes affect:
- The public project description
- Setup or build instructions
- Which versions are playable and where

## Development Workflow

### GitHub Issues & Projects

All work is tracked in **GitHub Issues** with a **GitHub Projects** kanban board.

- **Issues** = All work items (features, bugs, docs, tasks, spikes)
- **Labels** = Type (`feature`, `bug`, `docs`, `task`, `spike`) + Area (see below) + Priority (`priority:high`, `priority:low`) + Resolution (`resolution:wontfix`, `resolution:duplicate`, etc.)
  - Resolution labels are only applied when closing an issue **without completing the work**. No resolution label = completed.
- **Milestones** = Major initiatives — e.g. `Update to 0.9.111`, `v17 docs & tests`, `Publish & Landing Polish`.
- **Projects board** = Visual kanban for tracking status

Suggested area labels for this repo:
- `area:tutorial` — prose, narrative, teaching structure
- `area:code` — TypeScript source under `src/`
- `area:tests` — transcripts, walkthroughs, asserts
- `area:build` — `ifhub.conf`, `package.json`, `tsconfig.json`, GH Pages workflow
- `area:docs` — spec, per-version docs, CLAUDE.md, README.md
- `area:browser` — per-version HTML, landing, styles

### Board Columns

| Column | What's Here |
|--------|-------------|
| **Backlog** | Captured; refinement happens here (doc review, scope, AC) |
| **Ready** | Acceptance criteria finalized, ready to build |
| **In Progress** | Actively being coded |
| **Verify** | Code complete, awaiting human testing |
| **Done** | Verified and accepted |

### Board Automations (GitHub Projects Workflows)

These transitions are handled automatically by GitHub Projects:

| Trigger | Sets Status To |
|---------|---------------|
| Item added to project | **Backlog** |
| Item reopened | **In Progress** |
| Item closed | **Done** |
| Pull request merged | **Done** |

These transitions are **manual** and must be set during the workflow:

| Transition | When to Move |
|------------|-------------|
| Backlog → Ready | Refinement checklist complete, acceptance criteria finalized |
| Ready → In Progress | When coding begins |
| In Progress → Verify | When code is complete, awaiting testing |

### Commit Convention

```
#XX: description
```

Where `XX` is the GitHub Issue number. Use `Fixes #XX` in PR body for auto-close.

### Branch Naming

```
[type]/[short-description]
```

| Prefix | Use for |
|--------|---------|
| `feature/` | New versions, new engine concepts |
| `fix/` | Bug fixes (broken walkthrough, failing build) |
| `docs/` | Documentation changes |
| `task/` | Refactors, tooling, dependency bumps |
| `spike/` | Research, investigation |

Use lowercase and hyphens. Include the issue number if helpful: `task/12-bump-sharpee-0-9-112`. Solo work can commit to `main` freely — branch when changes need review or span multiple sessions.

### Severity and Priority

Bug severity maps to priority labels:

| Severity | Priority Label | Response |
|----------|---------------|----------|
| **Critical** — Build broken, tutorial unplayable | `priority:high` | Fix immediately |
| **High** — Version fails its walkthrough | `priority:high` | Fix before new features |
| **Medium** — Doc inconsistency, cosmetic glitch | *(no label)* | Normal backlog order |
| **Low** — Typo, polish | `priority:low` | Fix when convenient |

### Building and Testing

```bash
npm install           # Install @sharpee/* deps (0.9.111 currently)
npm run build         # tsc compile to dist/
npm run dev           # tsc --watch
```

The multi-target browser/playable build is driven by `ifhub.conf` (the `ifhub` tool or equivalent bundler). The default target is the re-export in `src/index.ts` (currently `v17`).

### Idea to Ship Cycle

| Phase | What Happens |
|-------|--------------|
| **Capture** | `gh issue create` + add to project board |
| **Refine** | Discussion in issue comments, spec it out |
| **Build** | PR with `Fixes #XX`, branch + implementation |
| **Verify** | PR includes spec + per-version doc + transcript updates, human reviews |
| **Ship** | Merge PR → issue auto-closes → board updates |

<!-- ============================================================
     END SDLC WORKFLOW
     Everything below this line is project-specific.
     ============================================================ -->

## Project History

### Recent Changes

- **2026-04-15 → 2026-04-16**: Group landing page + per-version blurbs (`landing.json`), per-version `storagePrefix` + source/walkthrough pages, 17 variants published, initial import of v01–v17 working copy.

### Architecture Decisions

1. **One concept per version** — the teaching contract. Never bundle two new ideas into a single version.
2. **Self-contained single-file versions (v01–v16)** — a reader can open one file and see the whole story. v17 deliberately breaks this to demonstrate multi-file organization.
3. **Per-version browser bundle + transcript** — every version is independently playable and independently testable.
4. **`src/index.ts` points at the current default version** — the "latest completed" version of the tutorial. Today that is v17.
5. **All text through the language layer** — tutorial is also a style guide for Sharpee idioms.
6. **Docs in three layers** — `docs/functional-spec.md` (authoritative), `docs/tutorial.md` (reader-facing narrative), `docs/vNN-*.md` (per-version deep-dive). Stay consistent across all three.
7. **Sharpee guide (`C:/code/npmsharpee/docs/guides/`) is the upstream source of truth for engine behavior** — if a tutorial contradicts the current guide, the tutorial is what needs updating.

## Security Considerations

- No network calls at runtime; no secrets in source.
- Input validation happens inside the Sharpee parser — don't bypass it.
- GitHub Pages deploy workflow copies files read-only; don't add steps that run user-supplied code in CI.

---

*Last updated: 2026-04-16*
*Maintained by: John Googol and Claude Code sessions*
