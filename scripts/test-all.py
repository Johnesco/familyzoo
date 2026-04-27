#!/usr/bin/env python3
"""Run every transcript under tests/transcripts/ via npx transcript-test.

Worked around: `transcript-test --all` looks in tests/, not tests/transcripts/,
and npm scripts can't expand globs portably. This wrapper does both.
"""
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
TESTS = REPO / "tests" / "transcripts"

files = sorted(TESTS.glob("*.transcript"))
if not files:
    print(f"No transcripts under {TESTS}", file=sys.stderr)
    sys.exit(1)

cmd = ["npx", "transcript-test", ".", *[str(f) for f in files]]
sys.exit(subprocess.call(cmd, cwd=str(REPO), shell=False))
