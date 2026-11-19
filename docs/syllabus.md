# Family Zoo syllabus and Chord coverage

*The guiding document for changing the Family Zoo stories and planning the tutorials
after it. Started 2026-11-14 against Chord 4.0.2 (Sharpee 5.6.1). Sources: each step's
README ("What this step adds"), each step's `.story`, the installed compiler's catalog,
and the guide at https://sharpee.net/chord/.*

## How this document works

The stories are learning examples, not just code. They are judged on how clearly they
teach, not only on whether they compile and pass their tests. So:

- **Every change to a story starts here as a Proposed item**, with an ID.
- **Nothing is changed in a story until John has reviewed the complete change**: the
  exact Chord, and the game output it produces. Only then does an item become Approved.
- An Approved item gets a ticket, is made, rebuilt and tested, and is marked Done with
  the ticket number.

| Status | Meaning |
|---|---|
| **Proposed** | An idea. No story has changed. |
| **Approved** | John has reviewed the full change and said yes. |
| **Done** | Made, built, tested and shipped (ticket noted). |
| **Declined** | Reviewed and not wanted (reason noted). |
| **On hold** | Waiting on an outside decision (named in the item). |

Two rules apply to every item:

1. **A step introduces one idea, in the simplest Chord that shows it.**
2. **When an idea needs more than that, it goes to a new tutorial, not into the zoo.**

## On hold

| ID | Item | Waiting on | Status |
|---|---|---|---|
| H1 | The `emit petted` / `emit fed` removal (shipped 2026-11-14, #14). Upstream filed the double message as an engine bug: an `emit` whose name is also a phrase key prints the trait's default phrase. The zoo now uses `phrase` alone, which prints one correct line under any likely fix. Pending: the wording in `docs/stroke-fix.md` (it calls the removal a fix; it is a workaround), and whether to post that the bug predates 5.6.1 (the 5.5.0 master's walkthrough already doubled it, commit `227a45b`). | [ChicagoDave/sharpee#724](https://github.com/ChicagoDave/sharpee/issues/724) | **On hold** |
| H2 | T4.13 (Events): how Chord teaches events depends on #724. If `emit` is meant to narrate, the lesson is an event that prints itself, not `emit` plus a listener. | [ChicagoDave/sharpee#724](https://github.com/ChicagoDave/sharpee/issues/724) | **On hold** |

---

## 1. Syllabus: what the zoo teaches today

This section describes the zoo as it stands. It has no status, and it changes only when
an item below is Done.

| Step | Title | The idea | Chord it introduces |
|---|---|---|---|
| v01 | A Single Room | The smallest story that runs | `story` header (`title`, `authors`, `id`, `description`); `create the <Room>` / `a room`; description paragraph; `scenery`; `in the <Room>`; `before the game starts` naming the player |
| v02 | Multiple Rooms & Navigation | Rooms joined by exits | `south to the <Room>`; one-way declaration, automatic return trip; `aka` |
| v03 | Scenery | Things that make a room a place | `scenery` on several things; `aka` on scenery |
| v04 | Portable Objects | Things the player carries | takeable by default; TAKE/DROP/INVENTORY from the stdlib; `readable` + `on the player reading`; `define phrase …, verbatim` |
| v05 | Containers & Supporters | In versus on | `a container`; `a supporter`; placing a thing in another at creation |
| v06 | Openable Things | Open and closed | `openable`; an openable container |
| v07 | Locked Doors & Keys | A barrier and its key | `lockable with the <key>`; `<dir> is blocked while …: <key>`; `define phrases en-US` refusal catalog |
| v08 | Light & Dark | Seeing needs light | `dark` on a room; `light-source` |
| v09 | Readable Objects | READ is not EXAMINE | `readable` + `scenery`; `on the player reading`; a multi-paragraph `phrase` |
| v10 | Switchable Devices | On and off | `switchable`; `on` clauses on devices; `define phrase …, cycling`; `{phrase}` in a description |
| v11 | Characters | A person in the world | `a person`; describing someone doing something |
| v12 | Event Clauses | Interrupting the engine | `on the player <verb>ing`; `after the player entering`; where a clause belongs |
| v13 | Custom Traits & Actions | Customizing verbs | `define trait`; `define action` with `grammar`; `remove from action`; finding a target by trait |
| v14 | Daemons & Sequences | The world moves on its own | `on every turn`; `define sequence` |
| v15 | Scoring & Endgame | Points | `use scoring`; `score <name> worth N`; `award` |
| v16 | After Hours & Story States | The whole story changes state | `states:` in the header; `while <state>`; conditions with `and`; `, once`; `define phrase …, first-time` |

---

## 2. Proposed fixes to the zoo: where steps drift from one idea

Places where a step's code and README disagree, or a step teaches another step's idea.
None needs renumbering. "Kind" says whether the item touches only the README or also
the story.

| ID | Step | Problem | Proposed fix | Kind | Status |
|---|---|---|---|---|---|
| Z1 | v01 | Uses `first time` (first-visit room prose) without saying so. | Name it in the README, or move it to v02, where rooms are revisited. | README, or story | **Proposed** |
| Z2 | v04 / v09 | Both introduce `readable` and `on the player reading`, so v09's idea is used up in v04. | Give the brochure its text through its description, not READ, so `readable` first appears in v09. | Story, v04 onward | **Proposed** |
| Z3 | v07 | Titled "Locked Doors", but the staff gate is `a thing … openable, lockable` blocking an exit. Chord has a `door` kind (`north to X through the <door>`). | Either retitle it "Locked Gates & Keys" (blocked exits stay the lesson), or make the gate `a door`. | Title, or story v07 onward | **Proposed** |
| Z4 | v11 | The README promises `on the player talking to`. The code has no conversation. | Add a one-topic `define topics for the zookeeper` table (Chord's way of doing conversation), or drop the bullet. | Story v11 onward, or README | **Proposed** |
| Z5 | v12 | The README promises a `before` clause. Chord has none: `on` is where a story refuses, `after` reacts. | Correct the README: `on` replaces or refuses, `after` reacts. | README | **Proposed** |
| Z6 | v13 | Overloaded: 177 new lines, 4 traits, 3 actions. It also uses `on every turn` (v14's idea), `one chance in 2`, trait `data` fields, `states, reversible` and requirements (`must be reachable`). | Move the `chatty` and `restless` traits (both daemons) from v13 to v14, where `on every turn` is the lesson. v13 keeps `pettable` and `feedable` with their actions. | Story v13, v14 | **Proposed** |
| Z7 | v15 | Titled "Endgame", but nothing in the zoo can be won or ended (`win` is never used). | Either add one `win` and the ending-and-restart test branch (`reference/tests-document.md`), or retitle it "Scoring". | Story v15 onward, or title | **Proposed** |
| Z8 | v16 | Also introduces `move the zookeeper to …` and `proper` without naming them. | Name them in the README. | README | **Proposed** |
| Z9 | master (steps not checked) | The welcome sign's description says it "reads: WELCOME TO WILLOWBROOK FAMILY ZOO", but READ SIGN answers "There's nothing written on the welcome sign." Seen 2026-11-18 while checking the 5.6.3 build; the sign is not `readable` in the master, so this is not an engine change. | Make the sign `readable` where v04 teaches reading, or reword the description so it does not say "reads". | Story, v04–v16 and master (or v01–v16 for the rewording) | **Proposed** |

A retitle (Z3, Z7) touches the six places a step's title lives (`CLAUDE.md`, "A step's
title lives in six places").

### Proposed engine moves

| ID | Move | What it changes for the player | What it touches | Status |
|---|---|---|---|---|
| E1 | Sharpee 5.6.1 → 5.6.3 (Chord 4.0.2 → 4.0.3; 5.6.2 published 2026-11-17, 5.6.3 on 2026-11-18) | Nothing in play. 5.6.2 was tried on a scratch copy of the master on 2026-11-17: gate-clean, 8/8 cards and 15/15 assertions, and the 197-command walkthrough replays identically apart from the parrot's random lines. 5.6.3 keeps Chord 4.0.3 and only changes the browser page: a reloaded page restores the room name in the status line and any channel panels. Re-checked 2026-11-18: gate-clean, 8/8 and 15/15. Neither release fixes #724 (see H1). | All 17 repos: the `@sharpee/*` pins, `npm install` in each (`build.py` will not reinstall), rebuild, ship. The walkthrough re-capture must strip the title banner `sharpee play` now prints first. The workspace toolchain line names 5.6.1 as latest. | **Done** (#15). Merged and shipped in all 17 repos 2026-11-19. |
| E2 | Sharpee 5.6.3 → 5.7.0 (Chord 4.0.3 → 4.1.0, 2026-11-19; upstream ADR-404) | The opening (banner and first look) is no longer turn 1: the first typed command is. Every `at turn N` therefore fires one command later. Unchanged stories: feeding time's first announcement comes on the 11th command instead of the 10th (v14–v16, master) and closing time's on the 5th instead of the 4th (v16, master); every later step follows by the same one-command shift. The parrot's `one chance in 2` lines come out in a different order (the opening no longer uses a random roll). Score, the keeper's exit and every test assertion are unchanged. Tried on a scratch master 2026-11-19. | All 17 repos: pins, `npm install`, and each tests tree's `boot` card folded into its `opening` card (`tools/fold_boot_cards.mjs`; the card count drops by one, assertions unchanged). Workspace `build.py` keeps the opening's first look in `walkthrough_output.txt`. **Story choice, see E2a.** | **Approved** (#16) for the engine move. In progress on `engine-5.7.0`. |
| E2a | Keep the announcements on the same command as today | With the change below, the 197-command master walkthrough announces closing and feeding time on exactly the same commands as on 5.6.3 (checked on a scratch master); only the parrot's random lines differ. Without it, the announcements arrive one command later and the step text is otherwise identical. | Story, v14, v15, v16 and master. v14 and v15: `define sequence feeding time` `at turn 11` → `at turn 10`. v16 and master: the same, plus `define sequence closing time` `at turn 5` → `at turn 4`. The `N turns later` steps are relative and stay. No README or comment names a turn number. Alternative: leave the numbers, accept the later moment, and note in v14's README that turn 1 is the first command. | **Proposed** |

---

## 3. Coverage: Chord 4.0.2 against the zoo

**Covered** (taught somewhere in v01–v16): the story header, `create`, kinds `thing`,
`room`, `person`, `container`, `supporter`; traits `scenery`, `readable`, `openable`,
`lockable`, `switchable`, `light-source`, `dark`, `plural`; exits and blocked exits;
`aka`; description prose and `{phrase}` markers; `on` / `after` clauses; `while`, `and`,
`, once`; `on every turn`; `define phrase` with `verbatim`, `cycling`, `randomly`,
`first-time`; `define phrases en-US`; `define trait` (with `data` and `states`);
`define action`; `remove from action`; `define sequence`; story `states:`; `change`,
`move`; `use scoring`, `score … worth`, `award`; the `when` suffix on a statement.

**Not covered**, grouped the way the guide groups them:

- **World**
  - Kinds: `a door` (with `through the <door>`), `a region` (`containing …`), `a vehicle`.
  - Placement and people: `carries`, `wears`, `starts in` (used for the player but not taught), `pronouns`.
  - Passages: `passage to …`, including `deadly:`.
  - Expanses and sailing.
  - Media: `define sound | image | music`.
- **Traits a thing can have**
  - Food and drink: `edible`, `drinkable`, `servings <n>` (5.6.0).
  - Clothing: `wearable`, `wearable on the <part>` (5.6.1).
  - Pushing and pulling: `pushable`, `pullable`.
  - Getting in or up: `enterable`, `climbable`.
  - Senses: `smelly`, `loud`, `listener` (5.6.1).
  - Hidden things: `concealed`, `hiding-spot`, `transparent`.
  - Fixtures: `attached`, `detachable`, `breakable`, `fragile`.
  - Tools: `cuttable`, `diggable`, `flammable`.
  - Devices: `settable` (dials), `powered by`, `opens when unlocked` (5.6.1).
  - Other: `costs` (buying), `night-vision`, `open-inventory`, `unlisted`.
- **Behavior**
  - `define condition`.
  - `select randomly … or …`, and `select` on a value.
  - `each … end each`.
  - Ordinal clauses (`first time`, `third time`).
  - Requirements and refusals taught on their own.
  - `remove <thing>`.
  - A character performing an action (`Sam opens the gate`).
  - `emit` with a listener (an event that something reacts to).
- **Characters and conversation**
  - `define topics for …`, `define conversation`, `define greetings`.
  - Goals (`goal … seek / acquire / move to`).
  - Personality, temperament, mood and manner.
  - Initiative and exchanges.
- **Flow and progression**
  - `define timer`, `define counter`, `define flag`.
  - Endings: `win`, `lose`, death.
  - Ranks: `rank "<name>" at <n>`.
  - `define chapters` (`use chapters`).
  - `define machine` (state machines).
  - `use hunger` and `use combat`.
- **Vocabulary and text**
  - `extend action` (new wording for a standard verb).
  - Phrase strategies `stopping` and `sticky`, and `or` variants.
  - `define pronouns`, `define phrasebook`.
  - `##` comments.
- **Project**
  - Multi-file stories.
  - The tests document as a lesson in itself.

---

## 4. Proposed placements for uncovered features

### 4a. Inside the zoo, only where a step already promises it

Everything else stays out of the zoo. The juice box, for example, stays a plain thing, so
the food traits wait for their own tutorial.

| ID | Feature | Step | Why it fits | Cost | Status |
|---|---|---|---|---|---|
| P1 | `define topics for` | v11 Characters | The step promises conversation and has none (same as Z4) | One short topics table on Sam | **Proposed** |
| P2 | `win` (endings) | v15 Scoring & Endgame | The title promises an ending (same as Z7) | One `win` line plus a test branch | **Proposed** |
| P3 | `a door` + `through the` | v07 Locked Doors & Keys | The title says doors (same as Z3) | Change the gate's kind and exit line | **Proposed** |
| P4 | Ranks: `rank … at` | v15 | Natural beside scoring | Only if v15 keeps "Endgame"; otherwise leave it out | **Proposed** |

### 4b. New tutorials

Each is a new series in the same style as the zoo: one setting, cumulative steps, one
idea per step. The titles are working names, and every tutorial and every step is
**Proposed**.

**T2: Things and Senses** (the physical stdlib traits). A picnic or a kitchen gives every
trait a natural home. **Proposed.**

| ID | Step idea | Chord |
|---|---|---|
| T2.1 | Food and drink | `edible`, `drinkable` |
| T2.2 | Portions | `servings <n>`, a finished thing leaving the world |
| T2.3 | Clothing | `wearable`, `wears` |
| T2.4 | Where it's worn | `wearable on the <part>` |
| T2.5 | Pushing and pulling | `pushable`, `pullable` |
| T2.6 | Getting in and up | `enterable`, `climbable` |
| T2.7 | Smell and sound | `smelly`, `loud` |
| T2.8 | Hidden things | `concealed`, searching |
| T2.9 | Hiding places | `hiding-spot` |
| T2.10 | Seeing through | `transparent` |
| T2.11 | Fixtures | `attached`, `detachable` |
| T2.12 | Breaking | `breakable`, `fragile` |
| T2.13 | Tools | `cuttable`, `diggable` |
| T2.14 | Fire | `flammable` |
| T2.15 | Dials and power | `settable`, `powered by` |
| T2.16 | Doors that act alone | `opens when unlocked` |
| T2.17 | Buying | `costs` |

**T3: Places and Journeys** (map and movement). **Proposed.**

| ID | Step idea | Chord |
|---|---|---|
| T3.1 | Real doors | `a door`, `through the` |
| T3.2 | Regions | `a region`, `containing` |
| T3.3 | Passages | `passage to` |
| T3.4 | Deadly passages | `deadly:` |
| T3.5 | Vehicles | `a vehicle`, boarding |
| T3.6 | Routes and stops | `stops`, `pace`, `send` |
| T3.7 | Expanses and sailing (advanced) | expanses, sailing |

**T4: Logic and Time** (behavior and flow). **Proposed.**

| ID | Step idea | Chord |
|---|---|---|
| T4.1 | Named conditions | `define condition` |
| T4.2 | Choosing a line | `select randomly` |
| T4.3 | Choosing on a value | `select` on a value |
| T4.4 | Repeating over things | `each` |
| T4.5 | Counting visits | ordinal clauses (`third time`) |
| T4.6 | Countdowns | `define timer` |
| T4.7 | Tallies | `define counter` |
| T4.8 | Switches in the story | `define flag` |
| T4.9 | Machines | `define machine` |
| T4.10 | Chapters | `define chapters` |
| T4.11 | Endings | `win`, `lose`, death and restart |
| T4.12 | Ranks | `rank … at` |
| T4.13 | Events (**on hold**, see H2) | `emit` and something that listens |

**T5: People** (characters and conversation). **Proposed.**

| ID | Step idea | Chord |
|---|---|---|
| T5.1 | Topics | `define topics for` |
| T5.2 | Greetings | `define greetings` |
| T5.3 | Conversations | `define conversation` |
| T5.4 | People who act | a character performing an action |
| T5.5 | Goals | `goal … seek / acquire` |
| T5.6 | Pronouns | `pronouns`, `define pronouns` |
| T5.7 | Personality and temperament | `define personality`, `define temperament` |
| T5.8 | Mood and manner | `define mood`, `define manner` |
| T5.9 | Initiative and exchanges | `define initiative`, `define exchange` |

**T6: Your Own Words** (vocabulary and project, a short add-on). **Proposed.**

| ID | Step idea | Chord |
|---|---|---|
| T6.1 | New wording for an old verb | `extend action` |
| T6.2 | Phrase strategies | `stopping`, `sticky`, `or` variants |
| T6.3 | Comments | `##` |
| T6.4 | Phrasebooks | `define phrasebook` |
| T6.5 | Sound and images | `define sound`, `define image`, `define music` |
| T6.6 | Splitting a story | multi-file stories |
| T6.7 | Testing your story | the tests document |

`use hunger` and `use combat` are full systems rather than single ideas. They would each
make a short tutorial of their own, after the ones above (**Proposed**).

---

## 5. Proposed order of work

| ID | Work | Status |
|---|---|---|
| O1 | The zoo's README-only fixes: Z5, Z8, and Z1 if done as a README note | **Proposed** |
| O2 | The zoo's story decisions: Z2, Z3/P3, Z4/P1, Z6, Z7/P2 (each reviewed in full, then a ticket, a rebuild of that step onward, and the master) | **Proposed** |
| O3 | T2, Things and Senses: covers the most uncovered features with the least machinery, and picks up 5.6.0's `servings` and 5.6.1's new trait words | **Proposed** |
