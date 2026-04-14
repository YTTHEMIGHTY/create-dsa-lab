# Project Overview — create-dsa-lab

> Everything an AI agent needs to understand this project without reading source code.

## What Is This?

`create-dsa-lab` is an **npm CLI package** that scaffolds a zero-config, test-driven DSA (Data Structures & Algorithms) practice laboratory. Users run `npx create-dsa-lab my-lab` and get a complete project with an interactive dashboard, test runner, benchmarker, and notes server.

**npm package:** https://www.npmjs.com/package/create-dsa-lab
**Repository:** https://github.com/YTTHEMIGHTY/create-dsa-lab

## Two-Repo Strategy

| Repo | Purpose | Published? |
|:--|:--|:--|
| `create-dsa-lab` | npm CLI scaffolder (THIS repo) | Yes, to npm |
| `daily-dsa` | Personal DSA lab instance (consumes the CLI) | No |

## Architecture

```
create-dsa-lab (npm package)
│
├── bin/cli.js              ← Entry point (npx create-dsa-lab runs this)
│   ├── init command        → Copies _template/ to user's project
│   └── update command      → Smart-syncs scripts/ with .bak backups
│
├── _template/              ← Copied to user's project at init
│   ├── scripts/
│   │   ├── dashboard.ts    ← Interactive menu: Run/Test/Benchmark/Notes
│   │   ├── generate.ts     ← Problem scaffolder (npm run make)
│   │   ├── config.ts       ← Config loader + category discovery
│   │   ├── errors.ts       ← Centralized error handling (17 codes)
│   │   ├── serve-notes.ts  ← Express markdown server (port 3030)
│   │   └── templates/      ← HTML/CSS/JS for notes server
│   ├── src/
│   │   ├── leetcode/containerWithMostWater_11/  ← Bundled sample problem
│   │   ├── algorithms/     ← Empty category directories
│   │   ├── dataStructures/
│   │   ├── patterns/
│   │   ├── blind/
│   │   └── playground/
│   ├── dsa-lab.config.json ← Feature flags, categories, settings
│   ├── package.json        ← Template project's package.json
│   ├── tsconfig.json
│   └── jest.config.ts
│
├── __tests__/              ← Jest test suite for the CLI
├── __fixtures__/           ← Test data (generated during tests)
├── docs/                   ← Detailed documentation
├── .agents/                ← AI agent knowledge (you are here!)
├── .github/                ← CI/CD, issue templates, PR template
└── changelogs/
```

## Key Design Patterns

### 1. The `meta` Convention

Every problem file exports a `meta` object that powers the dashboard:

```typescript
export const meta = {
  name: 'Two Sum',
  difficulty: 'Easy' as const,   // 'Easy' | 'Medium' | 'Hard'
  tags: ['hash-map', 'array'],
  time: 'O(n)',                   // Big O annotation
  space: 'O(n)',
  sampleInput: [[2,7,11,15], 9], // spread as fn(...sampleInput)
  sampleOutput: [0, 1],          // checked with 'in' operator
};

export default function twoSum(nums: number[], target: number): number[] {
  // implementation
}
```

**Important:** `sampleOutput` is checked with `'sampleOutput' in meta` (property existence), NOT `meta.sampleOutput !== undefined`. This correctly handles falsy values like `0`, `false`, `null`.

### 2. Hybrid Category Discovery

Categories are merged from config + filesystem:
- Config-defined categories get their emoji labels and prefixes
- Extra folders in `src/` are auto-discovered with default labels
- Users never HAVE to touch config to add categories

### 3. Smart Update (v1.2.0+)

The `update` command uses file-level diffing, NOT folder replacement:
- Walks each file in the template's `scripts/`
- Compares content with the user's version
- Only overwrites if content differs
- Creates `.bak` backup before overwriting
- Supports `--dry-run` flag for previewing changes

### 4. Version Stamps

All template scripts have `// @version X.Y.Z` on line 1 for tracking changes.

### 5. Error Handling

All scripts use `DsaLabError` with:
- `message` — what went wrong
- `suggestion` — how to fix it (shown with → arrow)
- `code` — machine-readable error code (17 codes defined)

## Config Schema

```json
{
  "lab": { "name": "string", "author": "string" },
  "features": {
    "excalidraw": false,
    "notesServer": true,
    "benchmarker": true,
    "testing": true
  },
  "categories": [
    { "prefix": "lc", "folder": "leetcode", "label": "🏆 LeetCode" }
  ],
  "notesServer": { "port": 3030 },
  "benchmark": { "iterations": 100 }
}
```

Config uses deep-merge defaults — missing fields get sensible fallbacks.

## Dependencies

| Package | Used By | Purpose |
|:--|:--|:--|
| commander | bin/cli.js | CLI argument parsing |
| prompts | cli.js, dashboard | Interactive prompts |
| chalk | all scripts | Terminal colors |
| chokidar | dashboard | File watching |
| cli-table3 | dashboard | Benchmark table formatting |
| express | serve-notes | HTTP server for notes |
| marked | serve-notes | Markdown → HTML |
| tsx | template scripts | TypeScript execution (zero-config) |
| jest / ts-jest | testing | Test runner |

## CI/CD Pipeline

| Workflow | Trigger | What it does |
|:--|:--|:--|
| `test.yml` | Push / PR to main | Runs `npm test` on Node 20 |
| `publish.yml` | GitHub Release created | Publishes to npm using `NPM_TOKEN` secret |

## Release Workflow

1. Develop on feature branch → PR → merge to `main`
2. Run `npm run release` on main (bumps version, migrates changelog, tags, pushes)
3. Create GitHub Release from the tag → auto-publishes to npm

## Test Suite

| Test File | What It Tests |
|:--|:--|
| `cli.test.js` | E2E scaffolding, file structure, sample problem, --dry-run flag |
| `config.test.js` | Config loading, deep merge, defaults |
| `errors.test.js` | DsaLabError class, handleError output |
| `generator.test.js` | File generation, validation, name regex |
| `scanner.test.js` | Problem scanning, directory traversal |
| `sample-problem.test.js` | Bundled sample problem structure, content, @version stamps |

Run with: `npm test` (Jest + `--experimental-vm-modules` for ESM).
