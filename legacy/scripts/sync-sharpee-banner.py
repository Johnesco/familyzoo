#!/usr/bin/env python3
"""Sync the @sharpee/sharpee version banner across all family zoo version files.

Each v01..v17 has a first-room "Zoo Entrance" description containing
"Willowbrook". This script appends "[Built for @sharpee/sharpee vX.Y.Z]"
to that description, where X.Y.Z is whatever's installed in node_modules.

Run after bumping @sharpee/* deps so the player-visible banner stays in
sync with the engine version.

Idempotent: re-running with the same version does nothing; running with a
different version replaces the previous banner.

Usage:
    python scripts/sync-sharpee-banner.py
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
SRC = REPO / "src"
SHARPEE_PKG = REPO / "node_modules" / "@sharpee" / "sharpee" / "package.json"

# Existing banner regex — stripped before adding the new one (idempotency).
BANNER_RE = re.compile(r" \[Built for @sharpee/sharpee v[\d.]+(?:-[\w.]+)?\]")


def get_sharpee_version() -> str:
    if not SHARPEE_PKG.is_file():
        print(f"ERROR: {SHARPEE_PKG} not found. Run 'npm install' first.",
              file=sys.stderr)
        sys.exit(1)
    return json.loads(SHARPEE_PKG.read_text(encoding="utf-8"))["version"]


def find_description_end(text: str, start: int) -> int:
    """From `start` (inside a single-quoted string), scan forward to the
    closing quote of the LAST string in this description value. Description
    values may be one quoted string, or several joined by `+` (possibly across
    newlines and whitespace). Returns the index of the closing quote, or -1.
    """
    pos = start
    while True:
        # Find the next single quote — that ends the current string segment.
        end = text.find("'", pos)
        if end == -1:
            return -1
        # See what follows: whitespace then `+` means a continuation.
        i = end + 1
        while i < len(text) and text[i] in " \t\r\n":
            i += 1
        if i < len(text) and text[i] == "+":
            # Skip the +, then any whitespace, then expect an opening quote.
            i += 1
            while i < len(text) and text[i] in " \t\r\n":
                i += 1
            if i < len(text) and text[i] == "'":
                pos = i + 1
                continue
        # Not a continuation — `end` is the closing quote we want.
        return end


def update_first_room(path: Path, version: str) -> bool:
    """Strip any existing banner, then append a new one inside the first room
    description (the entrance — uniquely identified by 'Willowbrook').
    Returns True if the file changed.
    """
    text = path.read_text(encoding="utf-8")
    original = text
    text = BANNER_RE.sub("", text)

    willow = text.find("Willowbrook")
    if willow == -1:
        print(f"  WARN: no 'Willowbrook' in {path.name}", file=sys.stderr)
        return False

    end_quote = find_description_end(text, willow)
    if end_quote == -1:
        print(f"  WARN: no closing quote after Willowbrook in {path.name}",
              file=sys.stderr)
        return False

    banner = f" [Built for @sharpee/sharpee v{version}]"
    new_text = text[:end_quote] + banner + text[end_quote:]

    if new_text == original:
        return False
    path.write_text(new_text, encoding="utf-8")
    return True


def main() -> int:
    version = get_sharpee_version()
    print(f"=== Sync banner -> @sharpee/sharpee v{version} ===\n")

    targets: list[Path] = sorted(SRC.glob("v??.ts"))
    v17_map = SRC / "v17" / "zoo-map.ts"
    if v17_map.is_file():
        targets.append(v17_map)

    changed = 0
    for path in targets:
        rel = path.relative_to(REPO)
        if update_first_room(path, version):
            print(f"  updated   {rel}")
            changed += 1
        else:
            print(f"  unchanged {rel}")

    print(f"\n{changed} file(s) updated for v{version}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
