# How It Works — End-to-End Flow

> From `npx create-dsa-lab` to solving your 100th problem — this is everything that happens under the hood.

---

## 1. Scaffolding Flow (`npx create-dsa-lab my-lab`)

```
User runs npx create-dsa-lab my-lab
          │
          ▼
┌─────────────────────────────────┐
│  bin/cli.js (Commander + ESM)   │
│  ─────────────────────────────  │
│  1. Parse CLI args              │
│  2. Show interactive prompts    │
│     • Project name              │
│     • Author                    │
│     • Excalidraw? (y/n)         │
│     • Categories (multiselect)  │
│  3. Validate target directory   │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Template Copy                  │
│  ─────────────────────────────  │
│  fs.cpSync(_template/ → target) │
│  • Entire _template/ is copied  │
│  • This includes scripts/,     │
│    src/, config files           │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Customization                  │
│  ─────────────────────────────  │
│  1. Remove unselected category  │
│     folders from src/           │
│  2. Update dsa-lab.config.json  │
│     with user's choices         │
│  3. Update package.json with    │
│     project name + author       │
└─────────────┬───────────────────┘
              │
              ▼
┌─────────────────────────────────┐
│  Post-Setup                     │
│  ─────────────────────────────  │
│  1. npm install (auto)          │
│  2. git init (auto)             │
│  3. Print getting-started guide │
└─────────────────────────────────┘
```

**Key design decision:** The CLI is plain JavaScript (`bin/cli.js`), not TypeScript. This ensures zero compilation step — `npx` downloads and runs it immediately with no build tooling required.

---

## 2. Daily Workflow: The Dashboard (`npm start`)

The dashboard is the central hub. One command does everything.

```
npm start
  → tsx scripts/dashboard.ts
          │
          ▼
    ┌──────────────┐
    │  scanProblems │  ← Reads src/ filesystem
    │  (Scanner)    │     + config categories
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  pickProblem  │  ← Autocomplete fuzzy search
    │  (File Picker)│     grouped by category
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  pickAction   │  ← Run | Test | Bench | Notes
    │  (Action Menu)│
    └──────┬───────┘
           │
           ├──── Run ──────→ Dynamic import → execute fn(sampleInput)
           │                  → show output, time, pass/fail
           │
           ├──── Test ─────→ execSync('npx jest --testPathPattern=...')
           │
           ├──── Bench ────→ Warm-up(5) → Measure(N iterations)
           │                  → avg/min/max time + memory delta
           │                  → formatted cli-table3 output
           │
           └──── Notes ────→ Open browser to notes server URL
                              (http://localhost:3030/view?path=...)
                     │
                     ▼
              ┌──────────────┐
              │  watchAndRerun│  ← chokidar watches the .ts file
              │  (File Watch) │     auto re-runs on save
              │               │     Press Enter → back to picker
              └──────────────┘
```

### The Scanner: Hybrid Discovery

The scanner merges **config-defined categories** with **filesystem discovery**:

```
dsa-lab.config.json               src/ directory
┌─────────────────────┐          ┌──────────────────┐
│ categories: [       │          │ algorithms/      │
│   { folder: "lc",   │          │ leetcode/        │
│     label: "🏆 LC"} │    +     │ myCustomFolder/  │ ← auto-discovered!
│   ...               │          │ playground/      │
│ ]                   │          └──────────────────┘
└─────────────────────┘
              │
              ▼
     Merged category list:
     - Config folders get their configured label + prefix
     - Extra folders get auto-generated labels (capitalized name)
     - Users NEVER have to touch config to add categories
```

This lives in `config.ts` → `discoverCategories()`.

---

## 3. Problem Generation (`npm run make <type> <name>`)

```
npm run make lc twoSum_1
           │
           ▼
    ┌──────────────────┐
    │  generate.ts      │
    │  ────────────────  │
    │  1. Validate args │
    │  2. Map prefix →  │
    │     category folder│
    │  3. Create dir    │
    │  4. Write files:  │
    └──────┬───────────┘
           │
           ▼
    src/leetcode/twoSum_1/
    ├── twoSum_1.ts          ← Solution template + meta export
    ├── twoSum_1.test.ts     ← Jest test skeleton
    └── twoSum_1.md          ← Notes template
```

### The `meta` Convention

Every problem file exports a `meta` object. This is the secret sauce that powers the entire dashboard:

```typescript
// What the user fills in:
export const meta = {
  name: 'Two Sum',              // Display name
  difficulty: 'Easy',           // Used in benchmark table
  tags: ['hash-map', 'array'], // Used in benchmark table
  time: 'O(n)',                 // Big O annotation
  space: 'O(n)',                // Big O annotation
  sampleInput: [[2,7,11,15], 9], // Spread as fn(...sampleInput)
  sampleOutput: [0, 1],         // Optional — checked with 'in' operator
};

export default function twoSum(nums: number[], target: number): number[] {
  // implementation
}
```

**Why `'sampleOutput' in meta` instead of `meta.sampleOutput !== undefined`?**
Because a valid expected output could legitimately be `undefined`, `null`, `0`, `false`, or any other falsy value. The property-existence check (`in`) handles all these correctly.

---

## 4. Notes Server (`npm run notes`)

```
npm run notes
  → tsx scripts/serve-notes.ts
          │
          ▼
    Express server on port 3030
    ├── GET /              → Sidebar listing all .md files in src/
    ├── GET /view?path=... → Rendered markdown page
    └── Static files       → templates/styles.css, templates/client.js

    Markdown pipeline:
    ┌─────────┐    ┌──────────┐    ┌───────────┐
    │ .md file │ →  │  marked   │ →  │  HTML page │
    │          │    │ + hljs    │    │  + KaTeX   │
    │          │    │ + KaTeX   │    │  + search  │
    └─────────┘    └──────────┘    └───────────┘
```

The notes server uses a **separated template architecture**:
- `templates/page.html` — HTML shell with slots for content
- `templates/styles.css` — Dark theme, responsive, syntax colors
- `templates/client.js` — Client-side search + interactivity

---

## 5. Error Handling System

All scripts share a centralized error system (`errors.ts`):

```
DsaLabError
├── message     → What went wrong
├── suggestion  → How to fix it (shown with → arrow)
└── code        → Machine-readable error code (17 codes)

handleError(error)
├── DsaLabError   → Pretty message + suggestion + code
├── SyntaxError   → "Syntax error in your code:" + details
├── Error         → Message + first 3 stack frames
└── unknown       → "An unexpected error occurred:" + string
```

Every error a user might encounter has a **human-readable suggestion** telling them exactly what to do. No stack traces unless debugging.

---

## 6. Config System (`dsa-lab.config.json`)

```json
{
  "lab": {
    "name": "my-dsa-lab",
    "author": "Your Name"
  },
  "features": {
    "excalidraw": false,      // Scaffold .excalidraw files
    "notesServer": true,      // Show "Notes" action in dashboard
    "benchmarker": true,      // Show "Benchmark" action
    "testing": true           // Show "Test" action
  },
  "categories": [
    { "prefix": "lc", "folder": "leetcode", "label": "🏆 LeetCode" }
  ],
  "notesServer": { "port": 3030 },
  "benchmark": { "iterations": 100 }
}
```

`config.ts` applies **deep-merge defaults** — if a user deletes a field, the system still works with sensible fallbacks. Feature flags control what appears in the dashboard action menu.

---

## 7. The Complete Data Flow

```
                           dsa-lab.config.json
                                  │
                    ┌─────────────┼─────────────┐
                    ▼             ▼              ▼
              config.ts      generate.ts    dashboard.ts
              (shared)       (scaffolder)   (runner)
                    │             │              │
                    │             ▼              │
                    │        src/leetcode/       │
                    │        └── twoSum_1/       │
                    │            ├── .ts    ◄────┤ dynamic import
                    │            ├── .test.ts ◄──┤ jest
                    │            └── .md    ◄────┤ notes server
                    │                            │
                    └──── errors.ts ─────────────┘
                          (shared error handling)
```

Every script imports from `config.ts` and `errors.ts`. This means:
- **One config file** controls everything
- **One error format** across all commands
- **One discovery system** for finding categories and problems
