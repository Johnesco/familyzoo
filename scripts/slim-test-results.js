#!/usr/bin/env node
/**
 * slim-test-results.js
 *
 * Transforms full transcript-test JSON output into a slim version
 * for the browser tests.html viewer.
 *
 * The full JSON includes massive actualEvents arrays and redundant
 * nesting that bloats the file. This script strips events, flattens
 * assertion results, maps comments to their nearest following command,
 * and writes a compact JSON suitable for browser display.
 *
 * Usage:
 *   node scripts/slim-test-results.js <input-json> <output-json> [--version v01]
 *
 * If --version is omitted, the version is inferred from transcript
 * file paths (e.g. "v01-single-room.transcript" -> "v01").
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2); // skip node + script path
  let inputPath = null;
  let outputPath = null;
  let version = null;
  let storyId = null;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--version' && i + 1 < args.length) {
      version = args[++i];
    } else if (args[i] === '--story-id' && i + 1 < args.length) {
      storyId = args[++i];
    } else if (!inputPath) {
      inputPath = args[i];
    } else if (!outputPath) {
      outputPath = args[i];
    }
  }

  if (!inputPath || !outputPath) {
    console.error(
      'Usage: node scripts/slim-test-results.js <input-json> <output-json> [--version v01] [--story-id familyzoo-01]'
    );
    process.exit(1);
  }

  return { inputPath, outputPath, version, storyId };
}

// ---------------------------------------------------------------------------
// Version extraction helpers
// ---------------------------------------------------------------------------

/**
 * Extract a version tag (e.g. "v01") from a transcript file path.
 * Looks for "vNN" at the start of the filename.
 */
function extractVersionFromFilePath(filePath) {
  const basename = path.basename(filePath, '.transcript');
  const match = basename.match(/^(v\d+)/);
  return match ? match[1] : null;
}

/**
 * Build a storyId from a version tag: "v01" -> "familyzoo-01".
 * Only used as a fallback for familyzoo multi-version layout.
 * For other games, pass --story-id explicitly.
 */
function versionToStoryId(version) {
  const num = version.replace(/^v/, '');
  return `familyzoo-${num}`;
}

/**
 * Infer the version from the transcript file paths in the full JSON.
 * If all transcripts share a common version prefix, use that.
 * Otherwise return null.
 */
function inferVersion(fullJson) {
  const versions = new Set();
  for (const t of fullJson.transcripts) {
    const filePath = t.transcript?.filePath || '';
    const v = extractVersionFromFilePath(filePath);
    if (v) versions.add(v);
  }
  // If exactly one version found, use it unambiguously
  if (versions.size === 1) {
    return [...versions][0];
  }
  // Multiple versions: return the lowest (first alphabetically)
  if (versions.size > 1) {
    const sorted = [...versions].sort();
    return sorted[0];
  }
  return null;
}

// ---------------------------------------------------------------------------
// Comment mapping
// ---------------------------------------------------------------------------

/**
 * Build a map from command lineNumber to the nearest preceding comment.
 *
 * The transcript.items array interleaves comments and commands, but its
 * ordering may not match source-line order (the parser can batch comments).
 * We use line numbers to do a correct nearest-preceding-comment match:
 * for each command at line N, find the comment whose lineNumber is the
 * largest value still < N.
 */
function buildCommentMap(items) {
  const map = new Map(); // command lineNumber -> comment text

  if (!items || !Array.isArray(items)) return map;

  // Collect all comments and commands with their line numbers
  const comments = [];
  const commands = [];
  for (const item of items) {
    if (item.type === 'comment' && item.comment) {
      comments.push({ line: item.comment.lineNumber, text: item.comment.text || '' });
    } else if (item.type === 'command' && item.command) {
      commands.push({ line: item.command.lineNumber });
    }
  }

  // Sort both by line number ascending
  comments.sort((a, b) => a.line - b.line);
  commands.sort((a, b) => a.line - b.line);

  // For each command, find the nearest preceding comment by line number.
  // Once a comment is used, remove it so it doesn't attach to a later command.
  for (const cmd of commands) {
    let best = null;
    let bestIdx = -1;
    for (let i = 0; i < comments.length; i++) {
      if (comments[i].line < cmd.line) {
        best = comments[i];
        bestIdx = i;
      } else {
        break; // comments are sorted, no point continuing
      }
    }
    if (best) {
      map.set(cmd.line, best.text);
      comments.splice(bestIdx, 1);
    }
  }

  return map;
}

// ---------------------------------------------------------------------------
// Output trimming
// ---------------------------------------------------------------------------

/**
 * Trim trailing prompt strings from actualOutput.
 * The engine appends "\n> " at the end of each turn; strip that.
 */
function trimOutput(output) {
  if (typeof output !== 'string') return '';
  // Strip trailing "> " prompts (possibly preceded by newlines)
  return output.replace(/(\n> )+$/g, '').replace(/\n>$/g, '');
}

// ---------------------------------------------------------------------------
// Main transformation
// ---------------------------------------------------------------------------

function transform(fullJson, explicitVersion, explicitStoryId) {
  const version = explicitVersion || inferVersion(fullJson);
  const storyId = explicitStoryId || (version ? versionToStoryId(version) : null);
  const timestamp = new Date().toISOString();

  const slimTranscripts = fullJson.transcripts.map((t) => {
    const filePath = t.transcript?.filePath || '';
    const file = path.basename(filePath);
    const title = t.transcript?.header?.title || '';
    const description = t.transcript?.header?.description || '';

    // Build comment map from the interleaved items array
    const commentMap = buildCommentMap(t.transcript?.items);

    // Transform each command result
    const commands = (t.commands || []).map((cmdResult) => {
      const cmd = cmdResult.command || {};
      const lineNumber = cmd.lineNumber || 0;
      const input = cmd.input || '';
      const output = trimOutput(cmdResult.actualOutput);
      const passed = !!cmdResult.passed;
      const skipped = !!cmdResult.skipped;

      // Flatten assertion results: merge the assertion definition
      // with its pass/fail result into a single object
      const assertions = (cmdResult.assertionResults || []).map((ar) => {
        const a = ar.assertion || {};
        const result = { type: a.type, passed: !!ar.passed };
        // Include the value field if present (ok-contains, ok-matches, etc.)
        if (a.value !== undefined) result.value = a.value;
        // Include other assertion-specific fields
        if (a.path !== undefined) result.path = a.path;
        if (a.expected !== undefined) result.expected = a.expected;
        if (a.event !== undefined) result.event = a.event;
        if (a.property !== undefined) result.property = a.property;
        return result;
      });

      const slim = { lineNumber, input, output, passed, skipped, assertions };

      // Attach the nearest preceding comment, if any
      const comment = commentMap.get(lineNumber);
      if (comment) slim.comment = comment;

      return slim;
    });

    return {
      file,
      title,
      description,
      commands,
      summary: {
        passed: t.passed || 0,
        failed: t.failed || 0,
        skipped: t.skipped || 0,
        duration: t.duration || 0,
      },
    };
  });

  const result = {
    timestamp,
    transcripts: slimTranscripts,
    summary: {
      totalPassed: fullJson.totalPassed || 0,
      totalFailed: fullJson.totalFailed || 0,
      totalSkipped: fullJson.totalSkipped || 0,
      totalDuration: fullJson.totalDuration || 0,
    },
  };

  // Include version/storyId at the top level if we could determine them
  if (version) result.version = version;
  if (storyId) result.storyId = storyId;

  // Reorder keys so version/storyId come first for readability
  return {
    ...(version ? { version } : {}),
    ...(storyId ? { storyId } : {}),
    timestamp: result.timestamp,
    transcripts: result.transcripts,
    summary: result.summary,
  };
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

function main() {
  const { inputPath, outputPath, version, storyId: explicitStoryId } = parseArgs(process.argv);

  // Read input
  let raw;
  try {
    raw = fs.readFileSync(inputPath, 'utf-8');
  } catch (err) {
    console.error(`Error reading input file: ${inputPath}`);
    console.error(err.message);
    process.exit(1);
  }

  let fullJson;
  try {
    fullJson = JSON.parse(raw);
  } catch (err) {
    console.error(`Error parsing JSON from: ${inputPath}`);
    console.error(err.message);
    process.exit(1);
  }

  // Transform
  const slim = transform(fullJson, version, explicitStoryId);

  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (outputDir && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write output
  try {
    fs.writeFileSync(outputPath, JSON.stringify(slim, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing output file: ${outputPath}`);
    console.error(err.message);
    process.exit(1);
  }

  // Print summary
  const v = slim.version || '??';
  const { totalPassed, totalFailed, totalSkipped } = slim.summary;
  const relOutput = path.relative(process.cwd(), outputPath) || outputPath;
  console.log(
    `${v}: ${totalPassed} passed, ${totalFailed} failed, ${totalSkipped} skipped -> ${relOutput}`
  );
}

main();
