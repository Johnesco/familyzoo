#!/usr/bin/env bash
# build-test-results.sh
#
# Runs transcript tests for each version (v01..v16) and generates slim
# test-results.json files in browser/vNN/ for the IF Hub "Tests" frame.
#
# How it works:
#   1. For each version, swap src/index.ts to re-export that version
#   2. Rebuild with npm run build
#   3. Run transcript-test with -o to generate full JSON
#   4. Use slim-test-results.js to produce browser/vNN/test-results.json
#   5. Restore src/index.ts to the default (v17)
#
# Usage:
#   ./scripts/build-test-results.sh          # all versions v01..v16
#   ./scripts/build-test-results.sh v04      # single version
#   ./scripts/build-test-results.sh v01 v05  # specific versions
#
# Prerequisites:
#   npm install && npm run build (at least once)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
INDEX_TS="$PROJECT_DIR/src/index.ts"
TMP_DIR=$(mktemp -d)

# Cleanup: always restore index.ts and remove temp files
cleanup() {
  echo "export { story, story as default } from './v17/index.js';" > "$INDEX_TS"
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

cd "$PROJECT_DIR"

# Determine which versions to process
if [ $# -gt 0 ]; then
  VERSIONS=("$@")
else
  VERSIONS=(v01 v02 v03 v04 v05 v06 v07 v08 v09 v10 v11 v12 v13 v14 v15 v16)
fi

PASSED=0
FAILED=0
TOTAL=${#VERSIONS[@]}

echo "=== Building test results for ${TOTAL} version(s) ==="
echo ""

for VER in "${VERSIONS[@]}"; do
  NUM="${VER#v}"  # e.g., "01"
  TRANSCRIPT="tests/transcripts/${VER}-*.transcript"

  # Find matching transcript file(s)
  TRANSCRIPT_FILES=( $TRANSCRIPT )
  if [ ! -f "${TRANSCRIPT_FILES[0]}" ]; then
    echo "  SKIP $VER — no transcript found matching $TRANSCRIPT"
    continue
  fi

  echo -n "  $VER: "

  # Step 1: Swap index.ts to re-export this version
  if [ "$VER" = "v17" ]; then
    echo "export { story, story as default } from './v17/index.js';" > "$INDEX_TS"
  else
    echo "export { story, story as default } from './${VER}.js';" > "$INDEX_TS"
  fi

  # Step 2: Rebuild
  if ! npm run build --silent 2>/dev/null; then
    echo "BUILD FAILED"
    FAILED=$((FAILED + 1))
    continue
  fi

  # Step 3: Run transcript-test with JSON output
  RESULT_DIR="$TMP_DIR/$VER"
  mkdir -p "$RESULT_DIR"

  if ! npx transcript-test . "${TRANSCRIPT_FILES[@]}" -o "$RESULT_DIR" 2>/dev/null; then
    echo "TEST RUN FAILED"
    FAILED=$((FAILED + 1))
    continue
  fi

  # Find the generated JSON file (timestamped)
  RESULT_JSON=$(ls "$RESULT_DIR"/results_*.json 2>/dev/null | head -1)
  if [ -z "$RESULT_JSON" ]; then
    echo "NO JSON OUTPUT"
    FAILED=$((FAILED + 1))
    continue
  fi

  # Step 4: Slim the JSON and write to browser/vNN/
  BROWSER_DIR="$PROJECT_DIR/browser/$VER"
  mkdir -p "$BROWSER_DIR"
  OUTPUT_JSON="$BROWSER_DIR/test-results.json"

  if ! node "$SCRIPT_DIR/slim-test-results.js" "$RESULT_JSON" "$OUTPUT_JSON" --version "$VER" 2>/dev/null; then
    echo "SLIM FAILED"
    FAILED=$((FAILED + 1))
    continue
  fi

  # Step 5: Copy tests-template.html as tests.html if not already present
  TESTS_HTML="$BROWSER_DIR/tests.html"
  TEMPLATE="$PROJECT_DIR/browser/tests-template.html"
  if [ -f "$TEMPLATE" ]; then
    cp "$TEMPLATE" "$TESTS_HTML"
  fi

  PASSED=$((PASSED + 1))
done

echo ""
echo "=== Done: $PASSED passed, $FAILED failed out of $TOTAL ==="

# Exit with failure if any version failed
[ "$FAILED" -eq 0 ] || exit 1
