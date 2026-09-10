# Family Zoo — a Sharpee tutorial

A progressive tutorial for the [Sharpee](https://sharpee.net) TypeScript interactive
fiction engine. It builds one game across **seventeen steps**: v01 is a single room,
v17 is a full multi-file story with NPCs, timed events, scoring and an endgame. Each
step adds one chapter of the zoo and one slice of the engine.

Play the whole trail on IF Hub: <https://johnesco.github.io/familyzoo/>

## The steps

Each step is published as its own repo so it can be played, read and tested on its own.

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
| v11 | Non-Player Characters | [`familyzoo-v11`](https://github.com/Johnesco/familyzoo-v11) |
| v12 | Event Handlers | [`familyzoo-v12`](https://github.com/Johnesco/familyzoo-v12) |
| v13 | Custom Actions | [`familyzoo-v13`](https://github.com/Johnesco/familyzoo-v13) |
| v14 | Capability Dispatch | [`familyzoo-v14`](https://github.com/Johnesco/familyzoo-v14) |
| v15 | Timed Events (Daemons & Fuses) | [`familyzoo-v15`](https://github.com/Johnesco/familyzoo-v15) |
| v16 | Scoring and Endgame | [`familyzoo-v16`](https://github.com/Johnesco/familyzoo-v16) |
| v17 | Current **(Current)** | [`familyzoo`](https://github.com/Johnesco/familyzoo) |

## This repo

`familyzoo` is both the **authoring tree** for all seventeen steps and the hub's
**Current** entry, which serves v17. The per-step source is in `src/` (`v01.ts` …
`v16.ts`, `v17/`), the built output for every step is in `browser/vNN/`, the tutorial
chapters are in `docs/`, and each step's transcript is in `tests/transcripts/`.

The frozen sibling repos `familyzoo-v01` … `familyzoo-v16` are generated from this tree.

## Playing locally

```bash
python -m http.server 8000 --directory familyzoo
```

## Building

Family Zoo is pinned to the **0.9.x TypeScript pipeline** — the API the tutorial exists
to explain. It is deliberately not translated to Chord. The built output in each folder
is the published artifact:

```bash
python ../tools/build.py familyzoo
python C:/code/ifhub/tools/ship.py familyzoo
```

The group landing page that lists every step is generated from `landing.json`:

```bash
python C:/code/ifhub/tools/build_landing.py familyzoo
```
