# Family Zoo — Functional Specification

> This is the authoritative record of what the Family Zoo tutorial delivers, how it is organized, and what each version teaches. It is the single source of truth for this tutorial series.
>
> **Maintenance rule:** Every change that affects reader-visible behavior — what a version demonstrates, how versions are built and published, what the walkthroughs assert — must be reflected in this document. A change without a corresponding spec update is incomplete.

---

## 1. Overview

### 1.1 Purpose

Family Zoo is a **progressive tutorial** for the [Sharpee](https://github.com/Johnesco/npmsharpee) TypeScript interactive fiction engine. Readers work through 17 self-contained story files — `v01`–`v17` — each of which adds exactly one new Sharpee concept on top of the previous version. By the end, a reader has seen the whole engine surface through a single evolving game.

### 1.2 Target Users

- Developers new to Sharpee who want a guided tour of the engine
- Developers familiar with other IF systems (Inform, TADS, Ink) who want to map their mental model onto Sharpee
- Maintainers of the Sharpee engine who use Family Zoo as a regression/demo surface for engine changes

### 1.3 Key Goals

1. **One concept per version.** Each version adds exactly one new idea; nothing more. A reader can isolate any concept to a single diff.
2. **Self-contained files.** `v01` through `v16` live in a single `.ts` file each, so a reader never has to chase imports to understand a version. `v17` deliberately breaks this to demonstrate multi-file organization.
3. **Independently playable and testable.** Every version has a browser bundle and a transcript walkthrough; a reader can play any version without building the others.
4. **Faithful to the current Sharpee API.** If the upstream guide says X, the tutorial says X. When they diverge, the tutorial is the thing that needs updating.
5. **Beginner-friendly prose.** Heavy inline comments, narrative walkthrough docs, and "Try" / "Common mistake" callouts.

---

## 2. Architecture

### 2.1 System Overview

Family Zoo is a **multi-target TypeScript project**. A single `package.json` + `tsconfig.json` produces 17 playable story bundles plus a group landing page.

```
                        ┌─────────────────────────────────┐
                        │  ifhub.conf (17 build targets)  │
                        └───────────────┬─────────────────┘
                                        │
        ┌───────────────────────────────┼───────────────────────────────┐
        ▼                               ▼                               ▼
  src/v01.ts                      src/v02.ts   …             src/v17/index.ts
  src/v01-entry.ts                src/v02-entry.ts            src/v17/*.ts
        │                               │                               │
        ▼                               ▼                               ▼
  esbuild / ifhub                  (same)                           (same)
        │                               │                               │
        ▼                               ▼                               ▼
  browser/v01/*.js                browser/v02/*.js              browser/v17/*.js
  browser/v01/play.html           browser/v02/play.html         browser/v17/play.html
                                        │
                                        ▼
                          browser/index.html  ← landing.json drives per-version blurbs
                                        │
                                        ▼
                             .github/workflows/*.yml
                                        │
                                        ▼
                                GitHub Pages deploy
```

`src/index.ts` re-exports the current default version (today: `v17`). That re-export is what `src/browser-entry.ts` and any top-level `play.html` consume.

### 2.2 Technology Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Engine | `@sharpee/*` 0.9.111 | The IF engine being taught; pinned across every package to avoid version skew |
| Language | TypeScript 5.3+ | Matches Sharpee's authoring language; `strict` on |
| Build | `tsc` for types/dist; `esbuild` for browser bundles; `ifhub` for multi-target orchestration | Per-version bundles without a monorepo |
| Browser client | `@sharpee/platform-browser` `BrowserClient` | Shared shell (themes, save/restore, menu) across all versions |
| Publishing | GitHub Pages via `.github/workflows/` | Zero-infra static hosting; per-version subpaths |
| Testing | `@sharpee/transcript-tester` (0.9.111) | Walkthrough transcripts with assertions |

### 2.3 Key Design Decisions

1. **Decision:** Version files are self-contained (v01–v16), not a shared library.
   **Rationale:** A reader learning from v07 should not need to read five other files to understand it. The teaching contract beats DRY here.

2. **Decision:** `v17` deliberately splits into multiple files.
   **Rationale:** The final concept of the tutorial is "how do I organize a real project?" — breaking the self-contained invariant is itself the lesson.

3. **Decision:** One concept per version, strictly enforced.
   **Rationale:** The progression is the teaching tool. If v04 also introduces containers, the reader loses the clean "what changed?" signal.

4. **Decision:** `ifhub.conf` drives everything multi-target (build, per-version subpath, walkthrough path, landing metadata).
   **Rationale:** A single declarative source for the 17 targets prevents `package.json` scripts and landing JSON from drifting out of sync.

5. **Decision:** Each version has its own browser storage prefix (`familyzoo-NN-`).
   **Rationale:** Saves from v03 shouldn't appear in v04's load dialog; per-version namespaces keep them isolated.

6. **Decision:** `src/index.ts` re-exports the current default version.
   **Rationale:** A plain `./build.sh -s familyzoo` always builds the "latest completed" version without needing to know what N is today.

7. **Decision:** The Sharpee guide (`C:/code/npmsharpee/docs/guides/`) is the upstream source of truth for engine behavior.
   **Rationale:** Tutorials drift; guides are the current contract. If they disagree, the tutorial is what updates.

---

## 3. Data Model

The "entities" of this project are not in-game objects — they are **version metadata**, **landing metadata**, and **transcript walkthroughs**. Each has a canonical shape.

### 3.1 Version (`ifhub.conf` target)

```ini
[target.familyzoo-NN]
hub             = yes                            # Appears on the group landing page
entry           = src/vNN-entry.ts               # Browser bootstrap file (required)
binary          = familyzoo-NN.js                # Output bundle name
subpath         = vNN                            # Deploy path (browser/vNN/ and /vNN/ in production)
title           = Family Zoo vNN: <Concept>      # Shown on landing + play shell
description     = Sharpee tutorial step NN — <Concept>.
walkthrough     = tests/transcripts/vNN-<slug>.transcript   # Primary walkthrough for this version
versionOf       = familyzoo                      # Groups variants under one landing
versionLabel    = vNN — <Concept>                # Short variant label
# Only on the current default version:
versionPrimary      = yes
versionPrimaryLabel = Current
```

**Invariants:**
- `subpath` must be `vNN` where `NN` is zero-padded to two digits.
- `entry` must exist as a file.
- `walkthrough` must exist for v01–v16; v17 walkthrough is a known gap (see §13).
- Exactly **one** target in the file carries `versionPrimary = yes`.

### 3.2 Version Blurb (`landing.json`)

```json
{
  "familyzoo-NN": {
    "summary": "2–3 sentence overview of what this version demonstrates.",
    "features": [
      "Feature or API introduced",
      "Engine primitive wired up",
      "Teaching callout",
      "3–5 bullets total"
    ]
  }
}
```

Keys correspond 1:1 to `ifhub.conf` target IDs (`familyzoo-01` through `familyzoo-17`).

### 3.3 Per-Version Source (`src/vNN.ts`)

```typescript
// Header comment: WHAT YOU'LL LEARN / TRY IT / BUILD & RUN
import { Story, StoryConfig } from '@sharpee/engine';
import { WorldModel, IFEntity, EntityType, Direction /*, ... */ } from '@sharpee/world-model';

const config: StoryConfig = {
  id: 'familyzoo-vNN',
  title: 'Family Zoo',
  author: 'Sharpee Tutorial',
  version: '0.1.0',
  description: 'A small family zoo — learn Sharpee one concept at a time.',
};

class FamilyZooStory implements Story {
  config = config;
  createPlayer(world: WorldModel): IFEntity { /* ... */ }
  initializeWorld(world: WorldModel): void { /* ... */ }
  // Optional, appears only when the version's concept requires it:
  //   onEngineReady(engine), extendParser(parser), extendLanguage(language), getCustomActions()
}

export const story = new FamilyZooStory();
export default story;
```

**Invariants:**
- Exactly one `Story` class per file.
- Both `export const story` and `export default story`.
- `config.id` is `familyzoo-vNN` (keeps save namespaces distinct).
- Narrative comments are not stripped when editing.

### 3.4 Per-Version Browser Bootstrap (`src/vNN-entry.ts`)

Each is a near-clone of `src/browser-entry.ts` with three changes:

| Field | Value |
|-------|-------|
| `import { story } from …` | `'./vNN.js'` |
| `THEME_STORAGE_KEY` | `'familyzoo-NN-theme'` |
| `storagePrefix` | `'familyzoo-NN-'` |

Everything else (themes, help text, about text, event handling) stays aligned. When `src/browser-entry.ts` changes, every `src/vNN-entry.ts` must be updated to match unless there is a version-specific reason not to.

### 3.5 Transcript Walkthrough (`tests/transcripts/vNN-<slug>.transcript`)

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

Assertion syntax is defined by `@sharpee/transcript-tester`; see `C:/code/npmsharpee/docs/guides/transcript-testing.md`.

**Invariants:**
- Every version v01–v16 has at least one walkthrough.
- The walkthrough declared in `ifhub.conf` exists.
- Walkthroughs reference the per-version story ID (`familyzoo-NN`), not the shared `familyzoo` id.

### 3.6 Per-Version Narrative Doc (`docs/vNN-<slug>.md`)

Reader-facing deep dive: what concept is added, annotated snippets, "try this", common mistakes. Written in prose, not reference style.

### 3.7 Relationships

```
ifhub.conf target           ←→   src/vNN.ts           (1:1 via entry + binary)
ifhub.conf target           ←→   src/vNN-entry.ts     (1:1 via entry)
ifhub.conf target           ←→   landing.json key     (1:1 via target id)
ifhub.conf target           ←→   tests/transcripts/*  (1:N — at least one walkthrough)
ifhub.conf target           ←→   docs/vNN-*.md        (1:1 for v01–v16; v17 pending)
src/index.ts                ──→  src/vNN.ts           (re-exports the current default)
```

---

## 4. Features (Versions)

Each version is one feature of this project. The full progression is also summarized reader-facing in `docs/tutorial.md`; this section is the authoritative scope declaration.

### 4.1 v01 — A Single Room

**Concept:** The minimum viable Sharpee story.

**Teaches:** `Story` interface (`config`, `createPlayer`, `initializeWorld`); `WorldModel`; `IdentityTrait`, `RoomTrait`, `ActorTrait`, `ContainerTrait`, `SceneryTrait`; `world.createEntity`, `world.moveEntity`; placing the player.

**Content:** One room (Zoo Entrance) with a welcome sign and ticket booth (both scenery).

**Walkthrough must verify:** `look` describes the entrance; `examine sign` reads the sign text; `take sign` is refused because of `SceneryTrait`.

### 4.2 v02 — Multiple Rooms and Navigation

**Concept:** Room exits and the stdlib `going` action.

**Teaches:** `Direction` enum; `RoomTrait.exits`; the two-step create-then-connect pattern; retrieving traits with `entity.get(Trait)`.

**Content:** Entrance connects south to Main Path; Main Path connects east to Petting Zoo and further to Aviary.

**Walkthrough must verify:** Each cardinal move succeeds; reverse exits work.

### 4.3 v03 — Scenery

**Concept:** Non-portable environmental detail.

**Teaches:** `SceneryTrait` vs. `EntityType.SCENERY`; generous alias lists.

**Content:** Every room gets scenery objects (fences, flowers, hay bales, waterfalls).

**Walkthrough must verify:** All scenery is examinable; none of it is portable.

### 4.4 v04 — Portable Objects

**Concept:** Items the player can pick up, carry, and drop.

**Teaches:** `EntityType.ITEM`; built-in `taking`, `dropping`, `inventory`, `take all` actions; portable-by-default philosophy.

**Content:** Zoo map (at entrance), feed bag (petting zoo), souvenir penny (aviary).

**Walkthrough must verify:** Pick up, inventory, move between rooms carrying an item, drop.

### 4.5 v05 — Containers and Supporters

**Concept:** Items held inside vs. on top.

**Teaches:** `ContainerTrait`, `SupporterTrait`; preposition-sensitive parsing (`put in` vs `put on`); `capacity.maxItems`; composing `SupporterTrait` + `SceneryTrait`.

**Content:** Backpack (container, portable), park bench (supporter, scenery).

**Walkthrough must verify:** Put into container; put onto supporter; capacity rejection.

### 4.6 v06 — Openable Things

**Concept:** Open/close state machine for containers and doors.

**Teaches:** `OpenableTrait` (`isOpen`, `canClose`, `revealsContents`); closed containers hide contents; temporary-open pattern for seeding items during `initializeWorld`.

**Content:** Lunchbox (openable container) with food inside; openable feed dispenser.

**Walkthrough must verify:** Open, close, look in (closed vs open), put in (blocked when closed).

### 4.7 v07 — Locked Doors and Keys

**Concept:** Locked passage gated by a key.

**Teaches:** `LockableTrait` with `keyId`; `DoorTrait` bridging two rooms; `via` property on `RoomTrait.exits`; any item can act as a key.

**Content:** Staff gate south of main path, keycard at entrance, supply room beyond.

**Walkthrough must verify:** Unlocked blocks movement; with keycard, unlock → open → go.

### 4.8 v08 — Light and Dark

**Concept:** Dark rooms require a light source.

**Teaches:** `RoomTrait.isDark`; `LightSourceTrait` (`brightness`, `isLit`); `SwitchableTrait`; combining three traits on the flashlight.

**Content:** Pitch-black nocturnal exhibit reached through the supply room; flashlight in supply room.

**Walkthrough must verify:** Dark exhibit blocks examine until light source is on; switch on flashlight; re-enter.

### 4.9 v09 — Readable Objects

**Concept:** Text content separate from the examine description.

**Teaches:** `ReadableTrait` (`text`); split between `examine` and `read`; scenery plaques vs portable brochures.

**Content:** Plaques around the zoo, a warning sign, a take-away brochure.

**Walkthrough must verify:** `read` vs `examine` produce different output; brochure is portable.

### 4.10 v10 — Switchable Devices

**Concept:** `SwitchableTrait` on its own (not a light source).

**Teaches:** `switch on/off`, `turn on/off` aliases; semantic distinction between switch (devices) and open (barriers); combining `SwitchableTrait` + `SceneryTrait` for fixed appliances.

**Content:** Radio bolted to a supply room shelf.

**Walkthrough must verify:** Switch on, switch off, can't take.

### 4.11 v11 — Non-Player Characters

**Concept:** Autonomous characters with behaviors.

**Teaches:** `NpcTrait`, `ActorTrait` (with `isPlayer: false`), `NpcPlugin`; built-in behaviors (`patrol`, `wanderer`, `follower`, `guard`, `passive`); custom `NpcBehavior` with `onTurn` and `onPlayerEnters`; `NpcAction` union (`move | speak | emote | wait | take | drop`); `NpcContext`.

**Content:** Patrolling zookeeper, chatty parrot.

**Walkthrough must verify:** NPCs observable via `examine`; `wait` advances their behavior; speech/emote events land in the transcript.

### 4.12 v12 — Event Handlers

**Concept:** Reacting to stdlib action events.

**Teaches:** `world.registerEventHandler` (silent state changes) vs `world.chainEvent` (narrated reactions); `if.event.*` catalog; item-transformation pattern; unique handler keys.

**Content:** Dropping feed triggers goats reacting; penny dropped in press becomes pressed souvenir.

**Walkthrough must verify:** Handler-driven text appears at the right moment; state flag set after event.

### 4.13 v13 — Custom Story Actions

**Concept:** Adding new verbs stdlib doesn't have.

**Teaches:** Four-phase `Action` (`validate` → `execute` → `report` / `blocked`); `getCustomActions`; `extendParser` with `grammar.define(...).mapsTo(...)`; `extendLanguage` for message IDs; `context.sharedData`.

**Content:** `feed <animal>`, `photograph <subject>`, `snap <subject>` as aliases.

**Walkthrough must verify:** New verbs are recognized; validation failures show the right message; success emits the right event.

### 4.14 v14 — Capability Dispatch

**Concept:** One verb, different behavior per entity.

**Teaches:** Custom traits declaring static `capabilities`; `registerCapabilityBehavior` with optional conditions; `createCapabilityDispatchAction` factory; per-entity dispatch via trait data (e.g. `animalKind`).

**Content:** Pet goats (affectionate), rabbits (fuzzy), parrot (bites!).

**Walkthrough must verify:** Same verb produces three distinct outcomes based on target.

### 4.15 v15 — Timed Events (Daemons and Fuses)

**Concept:** Background processes and countdown timers.

**Teaches:** `SchedulerPlugin`; daemons with `condition()` + `run()`; fuses with `turns`, `repeat`, `originalTurns`; `game.message` with `narrate: true`; turn-offset gotchas.

**Content:** PA announcements daemon, feeding-time fuse, bleating-goats loop.

**Walkthrough must verify:** Daemon output appears on scheduled turns; fuse fires and re-arms; `wait` advances the clock.

### 4.16 v16 — Scoring and Endgame

**Concept:** Score ledger and victory condition.

**Teaches:** `world.setMaxScore`; `world.awardScore` idempotency via unique IDs; `world.getScore`; built-in `score` command; victory daemon with priority; endgame state flag.

**Content:** 75-point scoring table across exploration and action; victory at 75/75.

**Walkthrough must verify:** Points award once per unique ID; `score` reports state; reaching the threshold triggers victory.

### 4.17 v17 — After Hours and Multi-File Organization

**Concept:** Organizing a real-size Sharpee project, plus runtime NPC behavior swap.

**Teaches:** Multi-file story split (`zoo-map`, `zoo-items`, `characters`, `events`, `scoring`, `language`, `index`); `npcService.removeBehavior` + `registerBehavior` to swap at runtime; daemon gated on world state flag (`zoo.after_hours`); 25-point after-hours bonus (new max 100); `getRunnerState` / `restoreRunnerState` for save compatibility across the swap.

**Content:** Closing time transitions the zoo; zookeeper leaves; parrot talks candidly.

**Walkthrough must verify:** _(pending — see §13)_ after-hours trigger, behavior swap takes effect, bonus points award.

---

## 5. User Interface

The tutorial has two user-facing surfaces: the **play shell** (per-version) and the **group landing page**.

### 5.1 Play Shell

Each `browser/vNN/play.html` is generated from `browser/play-template.html` and hosts the `@sharpee/platform-browser` `BrowserClient` against the version's bundle.

Shared UI elements across every version:

- Status bar (location name, score/turns)
- Main text window
- Command input
- Menu bar with Save / Restore / Restart / About / Help
- Modal overlay (save/restore dialogs)
- Startup dialog with autosave hint (when present)

Per-version differences: title, description, author, storage namespace, save keys, theme key.

### 5.2 Themes

Every version offers the same four themes:

| id | Name |
|----|------|
| `modern-dark` | Modern Dark (default) |
| `dos-classic` | DOS Classic |
| `retro-terminal` | Retro Terminal |
| `paper` | Paper |

Theme selection persists per version via `<storagePrefix>-theme`.

### 5.3 Group Landing Page

`browser/index.html` renders from `landing.json`:

- Top blurb (`title`, `meta`, `subtitle`, `description`, `introHtml`)
- Primary CTA → the `versionPrimary` target
- Per-version card list (one per `versions["familyzoo-NN"]` entry)

### 5.4 Navigation

- Landing page → per-version play page
- Per-version play page → Save/Restore dialogs, About, Help, Restart confirm
- No cross-version navigation inside the play shell (each version is an island by design)

---

## 6. States and Interactions

### 6.1 Version Lifecycle

| State | When |
|-------|------|
| **Draft** | Source file exists but is not yet wired into `ifhub.conf` |
| **Building** | Target in `ifhub.conf`, but `walkthrough`, `landing.json` entry, or `docs/vNN-*.md` missing |
| **Published** | All artifacts present; browser bundle deploys to GH Pages |
| **Current Default** | The single version carrying `versionPrimary = yes` and re-exported by `src/index.ts` |

Today v01–v16 are Published and v17 is Published-with-Gaps (missing transcript walkthrough and per-version doc — see §13).

### 6.2 Modernization Procedure

Every version will need to be revisited when the pinned Sharpee release changes. The canonical procedure for that pass is [`docs/modernization-checklist.md`](modernization-checklist.md), which defines seven phases (Scope → Source audit → Comment/teaching audit → Behavior audit → One-concept-per-version guard → Artifact audit → Report).

**Invariants the procedure protects:**
- The guide wins when tutorial and guide disagree (§2.3 decision #7).
- One concept per version (§2.3 decision #3) — modernization is never cover for scope creep.
- Every artifact listed in §3 stays in sync with the source version file.

The checklist is living — each pass adds any checks it discovers to the document before closing the ticket.

### 6.3 Reader Progression

A reader is expected to:

1. Open the landing page.
2. Read or skim `docs/tutorial.md` for the narrative overview.
3. Pick a version to study.
4. Read the per-version `docs/vNN-*.md`.
5. Open `src/vNN.ts` alongside.
6. Play the version in the browser, trying the "Try" commands.
7. Optionally run the transcript test to confirm expected behavior.
8. Move to `v(N+1)` and repeat.

---

## 7. Search and Filtering

Not applicable. The landing page lists all versions in order; there is no runtime search.

---

## 8. Error Handling

### 8.1 Reader-Facing Errors in the Play Shell

| Scenario | Message | Recovery |
|----------|---------|----------|
| Unknown verb | "I don't know that word." | Re-type with a known verb |
| Entity not found in scope | "You don't see that here." | Examine surroundings, move closer |
| Generic parse failure | "I don't understand that." | Rephrase |
| Action rejected | Per-action message from language layer | Per-action guidance |

Handled by `handleStoryEvent` in the browser entry (`command.failed` branch).

### 8.2 Build-Time Errors

- TypeScript `strict` errors → block build.
- Missing `ifhub.conf` artifacts (`entry`, `walkthrough`) → flagged at build time by the ifhub tool.
- Transcript assertion failures → reported per version; block merge.

### 8.3 Runtime Errors

Uncaught engine exceptions surface to the browser console. The shell does not attempt to recover; the player restarts via the Restart menu.

---

## 9. Security

Family Zoo is a read-only static site with no backend.

- No network calls at runtime.
- No secrets in source.
- Player input is parsed entirely inside the Sharpee engine — no `eval`, no dynamic `import()` from user input.
- Save data lives in `localStorage` under per-version prefixes; it is never transmitted.
- GitHub Pages workflow copies read-only files; no user-supplied code runs in CI.

---

## 10. Performance

| Metric | Target |
|--------|--------|
| Initial bundle size (per version) | < 500 KB minified+gzipped (indicative — verify with bundle analyzer) |
| Cold-start to playable prompt | < 1 s on a modern desktop browser |
| Command → response latency | Perceptually instant (< 50 ms typical) |
| Save / Restore | < 200 ms for a single slot |

These are soft targets; there is no performance CI today.

---

## 11. Accessibility

The play shell is built on `@sharpee/platform-browser`, which provides:

- Keyboard-first interaction (command input is the primary control)
- Semantic structure for the status bar, text window, menu bar
- Theming for visual contrast preference

Specific WCAG conformance is not currently claimed. Improvements belong as `area:browser` tickets.

---

## 12. External Integrations

### 12.1 Sharpee Engine

- **Purpose:** The thing being taught. Every version is a consumer of `@sharpee/*` packages.
- **API:** npm packages `@sharpee/core`, `@sharpee/engine`, `@sharpee/world-model`, `@sharpee/stdlib`, `@sharpee/lang-en-us`, `@sharpee/parser-en-us`, `@sharpee/platform-browser`, `@sharpee/plugin-npc`, `@sharpee/plugin-scheduler`, `@sharpee/text-service`, `@sharpee/media`, `@sharpee/helpers`, `@sharpee/sharpee`. All pinned to **0.9.111**.
- **Upstream docs:** `C:/code/npmsharpee/docs/guides/` is the authoritative reference.

### 12.2 ifhub

- **Purpose:** Multi-target build / publish tool reading `ifhub.conf`.
- **Contract:** Produces per-target browser bundles and per-version subpaths; drives the landing manifest.

### 12.3 GitHub Pages

- **Purpose:** Static hosting for the landing page and every version.
- **Workflow:** `.github/workflows/*.yml` assembles `_site/` from `web/`, `browser/`, `lib/`, `assets/`, `audio/`, `sfx/`, `src/`, and top-level `*.html`, `*.txt`, `*.ni`, `*.ink`, `*.json`.

### 12.4 Transcript Tester

- **Purpose:** Runs `tests/transcripts/*.transcript` against a version's story module and asserts outputs.
- **Package:** `@sharpee/transcript-tester` 0.9.111.

---

## 13. Future Considerations

Tracked as backlog items once the GitHub Projects board is live.

- [ ] **API-currency pass against `@sharpee/*` 0.9.111** — Read every version against the matching guide in `C:/code/npmsharpee/docs/guides/`; flag and update any drift. This is the first initiative after SDLC setup.
- [ ] **v17 per-version doc** — `docs/v17-after-hours-multifile.md` (or similar) to match the v01–v16 pattern.
- [ ] **v17 transcript walkthrough** — Exercise the after-hours transition, behavior swap, and bonus scoring.
- [ ] **Top-level `README.md`** — Short public-facing overview + build/play instructions.
- [ ] **GitHub Projects board** — Create, wire up 5 columns, set automation rules. Then fill the `Project Board` link in CLAUDE.md.
- [ ] **Labels via `scripts/setup-labels.sh`** — Import from sdlc-baseline, plus the repo-specific `area:*` labels listed in CLAUDE.md → Development Workflow.
- [ ] **Milestones** — Suggested initial set: `Update to 0.9.111`, `v17 docs & tests`, `Publish & Landing Polish`.
- [ ] **Performance baseline** — Measure actual bundle sizes and cold-start; capture into §10.
- [ ] **Accessibility pass** — WCAG-informed audit of the play shell.
- [ ] **Cross-version "what's new" diff view** — Possibly a generated diff highlight between `vN` and `v(N+1)` on the landing page.

---

## Appendix

### A. Glossary

| Term | Definition |
|------|-----------|
| **Version** | One of `v01`–`v17`; a self-contained Sharpee story file plus its browser entry, landing blurb, transcript, and doc. |
| **Current default** | The version carrying `versionPrimary = yes` in `ifhub.conf` and re-exported by `src/index.ts`. |
| **Concept** | The single new Sharpee idea a version adds on top of its predecessor. |
| **Play shell** | The browser UI around the engine: status bar, text window, input, menu. |
| **Trait** | A Sharpee component attached to an entity to give it a capability (e.g. `ContainerTrait`, `OpenableTrait`). |
| **Daemon / Fuse** | Scheduler primitives (per-turn loop / countdown timer) from `@sharpee/plugin-scheduler`. |
| **Walkthrough / Transcript** | A `.transcript` file asserting a sequence of commands and expected outputs for one version. |

### B. Revision History

| Date | Change | Author |
|------|--------|--------|
| 2026-04-16 | Initial draft — establishes authoritative scope for v01–v17 against sdlc-baseline workflow | John + Claude |

---

*Last updated: 2026-04-16*
