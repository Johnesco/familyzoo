# Family Zoo — a Chord tutorial

A sixteen-step tutorial for [Chord](https://sharpee.net/chord/), the authoring language
of the [Sharpee](https://sharpee.net) interactive fiction engine. It builds one game:
**v01 is a single room in about fifty lines; v16 is the whole zoo in eight hundred** —
animals with their own verbs, a zookeeper, timed events, scoring, and an after-hours
phase where the parrot stops being polite.

Play the whole trail on IF Hub: <https://johnesco.github.io/familyzoo/>

## The steps

Each step is one `.story` file — the step before it plus one idea — published as its own
repo so it can be played, read and tested on its own.

| Step | Teaches | Repo |
|---|---|---|
| v01 | A Single Room | [`familyzoo-v01`](https://github.com/Johnesco/familyzoo-v01) |
| v02 | Multiple Rooms & Navigation | [`familyzoo-v02`](https://github.com/Johnesco/familyzoo-v02) |
| v03 | Scenery | [`familyzoo-v03`](https://github.com/Johnesco/familyzoo-v03) |
| v04 | Portable Objects | [`familyzoo-v04`](https://github.com/Johnesco/familyzoo-v04) |
| v05 | Containers & Supporters | [`familyzoo-v05`](https://github.com/Johnesco/familyzoo-v05) |
| v06 | Openable Things | [`familyzoo-v06`](https://github.com/Johnesco/familyzoo-v06) |
| v07 | Locked Doors & Keys | [`familyzoo-v07`](https://github.com/Johnesco/familyzoo-v07) |
| v08 | Light & Dark | [`familyzoo-v08`](https://github.com/Johnesco/familyzoo-v08) |
| v09 | Readable Objects | [`familyzoo-v09`](https://github.com/Johnesco/familyzoo-v09) |
| v10 | Switchable Devices | [`familyzoo-v10`](https://github.com/Johnesco/familyzoo-v10) |
| v11 | Characters | [`familyzoo-v11`](https://github.com/Johnesco/familyzoo-v11) |
| v12 | Event Clauses | [`familyzoo-v12`](https://github.com/Johnesco/familyzoo-v12) |
| v13 | Custom Traits & Actions | [`familyzoo-v13`](https://github.com/Johnesco/familyzoo-v13) |
| v14 | Daemons & Sequences | [`familyzoo-v14`](https://github.com/Johnesco/familyzoo-v14) |
| v15 | Scoring & Endgame | [`familyzoo-v15`](https://github.com/Johnesco/familyzoo-v15) |
| v16 | After Hours & the TypeScript Hatch | [`familyzoo-v16`](https://github.com/Johnesco/familyzoo-v16) |
| — | **The finished zoo (Current)** | [`familyzoo`](https://github.com/Johnesco/familyzoo) |

## This repo

`familyzoo` is the **master story** and the hub's **Current** entry. `familyzoo.story` is
the finished zoo; the sixteen step repos are generated from it by slicing to the blocks
each step introduces. Change the master, then re-lay the steps — the step files are not
hand-edited.

The 0.9.x TypeScript edition this replaced is kept in [`legacy/`](./legacy).

## Playing and testing

```bash
npx sharpee play
npx sharpee test                           # replays familyzoo.tests.json
python ../tools/build.py familyzoo --force
python C:/code/ifhub/tools/ship.py familyzoo
```

The group landing page listing every step is generated from `landing.json`:

```bash
python C:/code/ifhub/tools/build_landing.py familyzoo --force
```

## Engine

Pinned to `@sharpee/*` **5.3.0** (Chord 3.6.0), held there by an `overrides` block in
`package.json`: 5.3.1 publishes broken subpath exports and breaks `sharpee test`.
