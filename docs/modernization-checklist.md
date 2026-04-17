# Family Zoo — Per-Version Modernization Checklist

> This is the canonical procedure for bringing a Family Zoo tutorial version up to the currently-pinned Sharpee release. It runs **per version**, is repeatable, and is reviewable. The same pattern will be applied 17+ times in the first pass.

**Authoritative inputs**
- Pinned engine version: whatever `package.json` lists under `@sharpee/*` (today: **0.9.111**).
- Current API guides: [`C:/code/npmsharpee/docs/guides/`](../../../npmsharpee/docs/guides/).
- Spec: [`docs/functional-spec.md`](functional-spec.md).
- Testing standard: [`docs/testing.md`](testing.md) and the workspace [`../CLAUDE.md`](../../CLAUDE.md).

**The rule when they disagree:** the guide wins. The tutorial is what needs updating.

---

## How to use this checklist

1. **Work in order, v01 → v02 → … → v17.** Each version *is* the previous version plus one concept. A change to v01 must propagate forward through every subsequent version. Modernizing out of order risks building on stale foundations. The earlier the fix, the wider the ripple — and that ripple is intentional, not optional.
2. Pick the next un-modernized version `vNN`. Open the matching GitHub Issue (or file one if it doesn't exist yet).
3. Work the phases in order — **Scope → Source audit → Comment/teaching audit → Behavior audit → One-concept guard → Artifact audit → Report**.
4. **Propagate changes forward.** After modernizing `vNN`, every change (API rename, import path, comment wording) that also appears in `v(N+1)` through `v17` must be carried forward into those files. These forward-propagation edits are part of the same PR or tracked as immediate follow-up tickets — never deferred indefinitely. This may be tedious, but all versions must stay in sync because each step builds on the previous one.
5. Fill in the **Report template** at the bottom. Paste it into the issue.
6. Only after the report is posted and accepted do you open the modernization PR.
7. Keep this file living. When you hit a check not already listed, add it.

A full pass on one version is typically half a day of reading + change + verification. Do not combine two versions into one PR — the "one concept per version" invariant depends on isolating diffs.

> **Why propagation matters:** If v01 changes `EntityType.SCENERY` → `EntityType.OBJECT`, but v03 still says `EntityType.SCENERY`, the reader hits a jarring inconsistency mid-tutorial. Worse: v03's code is supposed to *be* v02's code plus one concept — if the base doesn't match, the diff is noise. Propagation is the teaching contract.

---

## Phase 1 — Scope

Before touching code, re-anchor to what this version is *supposed* to teach.

- [ ] Read [`docs/functional-spec.md`](functional-spec.md) §4.`NN` (the per-version scope).
- [ ] Read [`docs/tutorial.md`](tutorial.md) for the `vNN` section — it's the reader-facing narrative.
- [ ] Read [`docs/vNN-*.md`](.) — the per-version deep-dive.
- [ ] Identify which Sharpee guides cover this version's concepts. At minimum always re-read [`creating-stories.md`](../../../npmsharpee/docs/guides/creating-stories.md). Also read:
  - [`project-structure.md`](../../../npmsharpee/docs/guides/project-structure.md) — v01, v17 (repo layout)
  - [`event-handlers.md`](../../../npmsharpee/docs/guides/event-handlers.md) — v12
  - [`creating-a-language-implementation.md`](../../../npmsharpee/docs/guides/creating-a-language-implementation.md) — v13, v14
  - [`scenes.md`](../../../npmsharpee/docs/guides/scenes.md) — v15, v16
  - [`transcript-testing.md`](../../../npmsharpee/docs/guides/transcript-testing.md) — every version (walkthroughs)
- [ ] Confirm the "one concept per version" statement. If the concept has been renamed upstream (e.g. a trait, a hook), flag it — do **not** silently rename the tutorial's teaching frame without spec approval.

**Output of Phase 1:** a one-paragraph note in the issue: *"v`NN` teaches X. Current guide on X lives at Y. No scope change needed."* — or, if needed, a spec-change proposal.

---

## Phase 2 — Source audit

Read `src/vNN.ts` (and `src/vNN/` if multi-file) line by line against the current guides. Check each of the following.

### 2.1 Imports & package surfaces

- [ ] Every imported symbol still exists in the pinned `@sharpee/*` package.
  - Check with `npm ls @sharpee/<pkg>` and grep the installed `dist/` or check the package's `exports` field.
- [ ] No import from a deprecated subpath (e.g. old barrels that have been split into sub-packages).
- [ ] Import style matches how the current guides import it (named vs default, specific sub-path or barrel).

### 2.2 `Story` interface conformance

Against [`creating-stories.md`](../../../npmsharpee/docs/guides/creating-stories.md):
- [ ] `config: StoryConfig` matches current shape. Required fields: `id`, `title`, `author`, `version`, `description`. Additional fields (`language`, etc.) present only if needed for this version.
- [ ] `createPlayer(world)` returns an `IFEntity` and the player is added to `world` correctly.
- [ ] `initializeWorld(world)` builds the world using current idioms.
- [ ] Optional hooks present only when the version introduces them: `onEngineReady`, `extendParser`, `extendLanguage`, `getCustomActions`.
- [ ] The class is exported as both a named `story` and a `default`.

### 2.3 World API

Against the guides + `@sharpee/world-model`:
- [ ] `world.createEntity(displayName, EntityType.X)` — entity type is the current one. **Known drift:** v01 uses `EntityType.SCENERY`; current guide uses `EntityType.OBJECT` + `SceneryTrait`. Catch analogous renames in every file.
- [ ] `world.moveEntity(childId, parentId)` for placement. Direct `contents` manipulation is a red flag.
- [ ] Room connections: `world.connectRooms(...)` or explicit `RoomTrait.exits` — whichever the current guide shows. Don't mix styles.
- [ ] Doors: `world.createDoor(...)` vs. manual door entities. Current idiom?
- [ ] `world.setPlayer(...)` / `world.getPlayer()` — still the right calls?
- [ ] Event handlers: `world.registerEventHandler(...)` / `world.chainEvent(...)` (v12+). Signatures match?
- [ ] State: `world.setStateValue(...)` / `getStateValue(...)` (v12+). Still the right API?
- [ ] Score: `world.setMaxScore(...)` / `world.awardScore(...)` (v16+).

### 2.4 Trait constructor signatures

For **every** trait used in this version, confirm against the current world-model source / guide:
- [ ] Constructor accepts the options shape still expected (property names, optionality).
- [ ] No removed properties (e.g. a property that was moved to a sibling trait).
- [ ] No new required properties going unset.

Common traits to audit (roughly in version order): `IdentityTrait`, `ActorTrait`, `RoomTrait`, `ContainerTrait`, `SceneryTrait`, `SupporterTrait`, `OpenableTrait`, `LockableTrait`, `DoorTrait`, `LightSourceTrait`, `SwitchableTrait`, `ReadableTrait`, `NpcTrait`, `EdibleTrait`, `DrinkableTrait`, `WearableTrait`, `PettableTrait`.

### 2.5 Event names

- [ ] Every `if.event.*` name used (in `chainEvent`, `registerEventHandler`, transcript `[EVENT:]`) exists in the current event taxonomy.
- [ ] Custom event shapes match the `EventData` shape the current engine expects.

### 2.6 Action shape (v13+)

Against [`creating-a-language-implementation.md`](../../../npmsharpee/docs/guides/creating-a-language-implementation.md) and the guides' action examples:
- [ ] Four-phase pattern: `validate` → `execute` → `report` (or `blocked`).
- [ ] `ActionContext` shape: `context.event(...)`, `context.world`, `context.player`, etc. still matches.
- [ ] All player-facing output is via `messageId` through the language provider — **zero** hardcoded English strings in the action itself.
- [ ] Grammar registration uses the current `extendParser` surface.

### 2.7 Plugin registration

- [ ] `NpcPlugin` (v11+) — constructor args, register call, where in lifecycle?
- [ ] `SchedulerPlugin` (v15+) — daemon / fuse registration, `schedulerWorld.registerDaemon(...)`, `schedulerWorld.registerFuse(...)`, etc.
- [ ] Plugin registration lives in `onEngineReady` (that's the hook).

### 2.8 Browser bootstrap

`src/vNN-entry.ts`:
- [ ] Imports current `@sharpee/client-web` (or current package) symbols: `GameEngine`, `BrowserClient`, `ThemeManager`, `PerceptionService`, save/restore hooks.
- [ ] `storagePrefix` is unique per version (e.g. `'familyzoo-v03'`) — otherwise saves collide.
- [ ] Save/restore hook wiring matches the current guide.
- [ ] No deprecated client APIs (old theme names, removed perception methods, etc.).

---

## Phase 3 — Comment / teaching audit

Sharpee guide compliance is necessary but not sufficient. These files are **beginner teaching material**. Comments are a first-class deliverable. Flag anything that fails these checks.

### 3.1 Header banner

Every version file starts with a banner comment containing:
- [ ] **WHAT YOU'LL LEARN** — 3–6 bullets of concrete takeaways.
- [ ] **NEW IN THIS VERSION** (v02+) — the one-concept-per-version addition, explicitly called out.
- [ ] **TRY IT** — 4–8 example commands a reader should type on first play.
- [ ] **BUILD & RUN** — the current real commands. **Known drift across all files:** header comments show `./build.sh -s familyzoo` and `node dist/cli/sharpee.js --story tutorials/familyzoo --play` — these are both stale. Update to `npm run build` + current browser / transcript invocation.

### 3.2 Section dividers

- [ ] Banner-style comment dividers split the file into sections (`// ==== IMPORTS ====`, `// ==== STORY CONFIGURATION ====`, `// ==== STEP 1: …`, etc.).
- [ ] Sections map to the narrative in `docs/vNN-*.md`. A reader jumping between file and doc should see the same landmarks.

### 3.3 First-use commentary

- [ ] The **first** time this version introduces a concept, there's a "why this matters" comment adjacent to it (2–5 lines, plain English, no jargon without unpacking).
- [ ] Later reuses of the same concept do **not** repeat the explanation — they keep the file readable.
- [ ] Concepts introduced in earlier versions and reused here have a short cross-reference (`// (introduced in v03)`) only when a reader might not remember.

### 3.4 Narrative flow

- [ ] Read the file top-to-bottom as a stranger. It should read like a guided walkthrough: setup → build the world → wire interactions → go.
- [ ] No dead code. No commented-out experiments. No "TODO: figure this out later."
- [ ] No stray debugging `console.log`s.

### 3.5 Per-version doc + tutorial doc

- [ ] `docs/vNN-*.md` reflects the current state of the code, the current Sharpee API, and the current "Try" list.
- [ ] The corresponding section in `docs/tutorial.md` matches.
- [ ] "Common mistake" callouts are still accurate for the current API.

---

## Phase 4 — Behavior audit (walkthrough + transcripts)

This is where the tutorial code meets the test surface. Lean on the [`testing.md`](testing.md) guidance.

- [ ] `npm run build` — clean compile, no TS errors.
- [ ] Run the version's transcript:
  ```bash
  ./node_modules/.bin/transcript-test . tests/transcripts/vNN-*.transcript --verbose
  ```
  (Note the default-export gotcha: today `dist/index.js` re-exports v17. For a strict per-version check, temporarily re-export `vNN` from `src/index.ts`, rebuild, run, then revert. Track that step in the issue.)
- [ ] Run the blank-output detector:
  ```bash
  node C:/code/npmsharpee/transcript-runner.js . --verbose
  ```
  — any silent turn almost certainly means a message ID lookup failed.
- [ ] Skim the browser preview to confirm prose reads as intended. `preview_start` via the configured `.claude/launch.json`, then navigate to `/familyzoo/vNN/play.html`.
- [ ] If the transcript is thin (fewer assertions than concepts in the version), **extend it**:
  - One `[OK:]` per prose-sensitive line.
  - One `[EVENT:]` per semantic claim that must survive prose rewording.
  - `[STATE:]` on any puzzle where the mutation is the point.
- [ ] For deep-logic questions the transcript can't express, use `probe.js` — then **promote the finding to a transcript assertion** so the check becomes durable. Don't leave the check in probe.

---

## Phase 5 — One-concept-per-version guard

The core tutorial invariant. Easy to break accidentally when bringing code "up to modern idioms."

- [ ] Re-diff against `vNN-1.ts`: every substantive change from the predecessor either (a) *is* the one new concept, or (b) is a pure API refresh (trait rename, import path shuffle).
- [ ] No imports introducing a trait or plugin that belongs to a later version.
- [ ] No code sneaking in a concept that's the subject of `v(N+1)` or later — compare the import list against `docs/functional-spec.md` §4.
- [ ] If a new current-API idiom would pull in an earlier concept (e.g. a refactor that forces a scheduler usage into v08), **stop and ticket it as a spec change**.
- [ ] **Forward-propagation check:** every modernization change that also exists in `v(N+1)` through `v17` is either (a) applied in this same PR, or (b) tracked as an immediate follow-up ticket. The reader's experience is progressive — if v01 changes an import or entity type and v03 still uses the old form, the tutorial is broken even though each file compiles individually.

---

## Phase 6 — Artifact audit

Before writing the PR, confirm every touch-site is accounted for.

**This version's artifacts:**
- [ ] `src/vNN.ts` (or `src/vNN/*.ts`)
- [ ] `src/vNN-entry.ts` — browser bootstrap
- [ ] `tests/transcripts/vNN-*.transcript` — walkthrough
- [ ] `docs/vNN-*.md` — per-version deep-dive
- [ ] `docs/tutorial.md` — the `vNN` section
- [ ] `landing.json` — the per-version blurb (`summary` + `features`)
- [ ] `ifhub.conf` — the `[target.familyzoo-NN]` block (title, description, walkthrough path, labels)
- [ ] `browser/vNN/*.html` — if prose on the play shell changed
- [ ] `docs/functional-spec.md` §4.`NN` — only if the version's scope changed (rare; tickets as a scope change)
- [ ] `CLAUDE.md` — only if the change reveals a new project-wide convention
- [ ] This file — if the check you ran isn't already listed, add it

**Forward-propagation artifacts (v(N+1) through v17):**
- [ ] For every code-level change made to `vNN` (import paths, entity types, trait constructors, API calls), confirm the same pattern appears in later versions and carry the fix forward. List every later file touched or note that the pattern doesn't recur.
- [ ] For every comment-level change (BUILD & RUN banner, section dividers, first-use wording), propagate the same fix into later files where the comment was inherited verbatim.
- [ ] Transcripts for later versions — re-run `transcript-test --all` after propagation to confirm no regressions.
- [ ] Document the propagation scope in the PR description: "Changed X in v01; propagated to v02–v17" or "Changed X in v08; propagated to v09–v17; not present in v01–v07."

---

## Phase 7 — Report

Post this template as a comment on the modernization issue. Keep sections that apply; delete sections that don't.

```markdown
## Modernization report: v`NN`

### Scope
v`NN` teaches **<concept>**. Current guide: [<guide>](...). Scope unchanged / scope change proposed (see below).

### Drift findings
| # | Where (file:line) | Current tutorial | Current Sharpee | Severity |
|---|---|---|---|---|
| 1 | `src/vNN.ts:162` | `EntityType.SCENERY` | `EntityType.OBJECT` + `SceneryTrait` | API |
| 2 | `src/vNN.ts:19-20` header banner | `./build.sh -s familyzoo` | `npm run build` + transcript-test | Docs |
| … | | | | |

### Comment / teaching gaps
- …

### Behavior audit
- Build: OK / failing at …
- Transcript (`vNN-*.transcript`): PASS (k/k) / FAILING at …
- Blank-output runner: clean / flagged at …
- Browser preview: looks right / issue at …

### Proposed changes
- … (bullet the diffs, grouped by artifact)

### Leakage check
- No concepts from v(N+1)+ detected / concept X sneaks in — see below.

### Forward propagation
- Changed X in vNN; propagated to v(N+1)–v17 / not present in later versions.
- Transcript regression sweep (`--all`): PASS / FAIL at …
- Files touched by propagation: `src/vNN+1.ts`, `src/vNN+2.ts`, …

### Follow-up tickets filed
- #… (spec change for …)
- #… (upstream guide gap — missing example for …)

### Known gaps in the checklist itself
- (anything I found worth adding to `modernization-checklist.md`)
```

---

## Worked example — v01 dry-run

Applying the checklist against `src/v01.ts` as-is (before any modernization PR).

### Scope
v01 teaches: `Story` interface, `createPlayer`, `initializeWorld`, one room with scenery, player placement. Scope unchanged by 0.9.111.

### Drift findings

| # | Where (file:line) | Current tutorial | Current Sharpee | Severity |
|---|---|---|---|---|
| 1 | [src/v01.ts:162](../src/v01.ts) | `world.createEntity('welcome sign', EntityType.SCENERY)` | `EntityType.OBJECT` + `SceneryTrait` (guide: "All objects are portable by default. Use `SceneryTrait` to make something non-portable.") | **API** |
| 2 | [src/v01.ts:182](../src/v01.ts) | `world.createEntity('ticket booth', EntityType.SCENERY)` | same as #1 | **API** |
| 3 | [src/v01.ts:19-20](../src/v01.ts) header banner | `./build.sh -s familyzoo` / `node dist/cli/sharpee.js --story tutorials/familyzoo --play` | `npm run build` + `./node_modules/.bin/transcript-test . tests/transcripts/v01-*.transcript` (or browser preview) | **Docs** |

All three drifts are very likely repeated across v02–v17 for the header banner (#3); the `EntityType.SCENERY` pattern (#1, #2) will recur in every file that introduces scenery.

### Comment / teaching gaps
- Header banner is otherwise complete (WHAT YOU'LL LEARN ✓, TRY IT ✓, BUILD & RUN **stale**).
- First-use commentary is present and good (the `SceneryTrait` explanation on lines 176–177 reads naturally).
- No dead code, no debug logs. Narrative flows top-to-bottom cleanly.
- `docs/v01-a-single-room.md` + `docs/tutorial.md` v01 section need a matching update when the `EntityType` change lands.

### Behavior audit (as of this dry-run)
Not executed — this is a checklist dry-run, not a remediation run. The remediation ticket (v01 modernization) will execute Phase 4 end-to-end.

### Proposed changes (preview for the actual v01 PR)
- `src/v01.ts`: swap `EntityType.SCENERY` → `EntityType.OBJECT` in both scenery creations (lines 162, 182).
- `src/v01.ts`: fix BUILD & RUN block in the header banner (lines 18–21) — single most-repeated fix across all 17 files.
- `src/v01-entry.ts`: re-audit against the current browser guide (not read in this dry-run — flag for the actual ticket).
- `tests/transcripts/v01-single-room.transcript`: confirm assertions still pass after the `EntityType` swap (they should — prose doesn't change).
- `docs/v01-a-single-room.md`: update any prose that mentions `EntityType.SCENERY`.
- `docs/tutorial.md`: same.
- `landing.json` / `ifhub.conf`: no change expected.

### Leakage check
No v02+ concepts detected in v01.

### Follow-up tickets surfaced by the dry-run
- **Cross-cutting ticket** — "Sweep stale `BUILD & RUN` banner across v01–v17 in a single mechanical pass." Likely worth doing as one PR since it's a pure comment change that doesn't affect the one-concept invariant.
- **Scenery-pattern ticket** — audit every file for `EntityType.SCENERY`; plan the rewrite as the first wave of per-version modernizations.

### Known gaps in the checklist itself (captured during the dry-run)
- The checklist would benefit from a **grep appendix** — a single set of commands that surface the most common drifts in one pass (`grep -rn 'EntityType.SCENERY' src/`, `grep -rn 'build.sh -s familyzoo' src/`, etc.). Add this as the checklist evolves.
- The per-version-build gotcha (default export loading) needs a one-line fix that can be scripted. Currently manual. Ticket candidate.

---

## Review / acceptance criteria for a modernization PR

A v`NN` modernization PR is ready to merge when:

1. **Report posted** — the Phase 7 report is a comment on the issue and addresses every drift found.
2. **Tests green** — `npm run build` passes, `vNN-*.transcript` passes, `transcript-runner.js` reports no blank output on the version's walkthrough.
3. **All artifacts updated** — every box in Phase 6 is either checked or explicitly marked N/A in the PR description.
4. **One-concept invariant intact** — Phase 5 leakage check posted and clean.
5. **Teaching bar met** — Phase 3 comment audit passed. Any comment the reviewer flags as unclear gets a rewrite in the same PR.
6. **No scope creep** — if the PR discovered a spec change is needed, the spec change is in a **separate** PR gated on a spec-change issue. Modernization PRs don't smuggle scope changes.
7. **Follow-up tickets filed** — any discovered gap not fixed here exists as an issue on the board, linked from the PR description.

---

## Evolving this checklist

This file is **living documentation**. Every modernization pass will surface things the checklist didn't anticipate. The rule:

- If you caught a drift that isn't listed, **add the check** before closing the ticket.
- If a check is redundant or confusing, rewrite it.
- If a whole new *category* of check emerges (say, accessibility of the browser shell), propose a new phase in an issue first.

The goal is that by the time all 17 versions have been modernized once, the checklist is tight enough that the **next** engine version bump is a 1–2 hour pass per version, not a 4-hour spike each.
