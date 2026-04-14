# File-by-File Reference

> What every file does, who imports it, and what to know before editing it.

---

## Repository Root

### `bin/cli.js`
**Purpose:** The npm binary entry point. This is what runs when a user types `npx create-dsa-lab`.

| Detail | Value |
|:--|:--|
| Language | JavaScript (ESM) |
| Run by | `npx` / `npm exec` |
| Dependencies | `commander`, `prompts`, `chalk`, `fs`, `path`, `child_process` |
| Lines | ~170 |

**What it does:**
1. Parses CLI arguments (optional project name)
2. Shows interactive prompts (name, author, categories, excalidraw)
3. Copies `_template/` → target directory via `fs.cpSync`
4. Customizes `dsa-lab.config.json` and `package.json` with user answers
5. Removes unselected category folders from `src/`
6. Runs `npm install` and `git init` automatically
7. Prints a getting-started guide

**Key functions:**
- `run(projectName)` — Main scaffolding orchestrator
- `runUpdate(dryRun)` — Smart update with file-level diffing
- `smartSync(srcRoot, destRoot, folderName, dryRun)` — File-level sync with .bak backups
- `walkDir(dir)` — Recursive file enumerator
- `printBanner()` — ASCII art header
- `printSuccess(name)` — Post-setup instructions

---

### `package.json` (root)
**Purpose:** Defines the npm package `create-dsa-lab`.

Key fields:
- `"bin": { "create-dsa-lab": "./bin/cli.js" }` — npm binary registration
- `"files": ["bin/", "_template/"]` — Only these directories are published to npm
- `"type": "module"` — ESM throughout
- Dependencies are minimal: `commander`, `prompts`, `chalk`

---

## `_template/` — Copied to User Projects

Everything in this directory becomes the user's project. Edit these files to change what users get.

---

### `_template/scripts/dashboard.ts`
**Purpose:** The unified interactive dashboard — the main thing users interact with daily.

| Detail | Value |
|:--|:--|
| Triggered by | `npm start` (via `tsx`) |
| Lines | ~474 |
| Imports from | `config.ts`, `errors.ts` |
| External deps | `prompts`, `chalk`, `chokidar`, `cli-table3` |

**Key functions:**
| Function | What it does |
|:--|:--|
| `scanProblems()` | Walks `src/` to find all `<name>/<name>.ts` files |
| `pickProblem()` | Autocomplete file picker with fuzzy search |
| `pickAction()` | Select menu: Run, Test, Benchmark, Notes, Back, Exit |
| `runProblem()` | Dynamic import → execute with `sampleInput` → show result |
| `testProblem()` | Shells out to `npx jest --testPathPattern=<name>` |
| `benchProblem()` | Warm-up (5 runs) + N measured iterations → stats table |
| `openNotes()` | Opens browser to notes server URL |
| `watchAndRerun()` | Uses chokidar to watch `.ts` file, re-runs action on change |
| `main()` | Infinite loop: pick → action → watch → repeat |

**Interfaces:**
- `ProblemFile` — Scanner result (name, paths, category, hasTest)
- `ProblemMeta` — The `meta` export shape (name, time, space, difficulty, tags, IO)

---

### `_template/scripts/generate.ts`
**Purpose:** Scaffolds new problem directories with boilerplate files.

| Detail | Value |
|:--|:--|
| Triggered by | `npm run make <type> <name>` |
| Lines | ~130 |
| Imports from | `config.ts`, `errors.ts` |

**What it creates:**
```
src/<category>/<name>/
├── <name>.ts         ← Default export function + meta object
├── <name>.test.ts    ← Jest test importing default + meta
└── <name>.md         ← Markdown notes template
```

**Validation:** Problem names must match `/^[a-zA-Z][a-zA-Z0-9_]*$/` — alphanumeric + underscores, starting with a letter.

---

### `_template/scripts/config.ts`
**Purpose:** Central config loader. Reads `dsa-lab.config.json` and merges with defaults.

| Detail | Value |
|:--|:--|
| Imported by | `dashboard.ts`, `generate.ts`, `serve-notes.ts` |
| Lines | ~100 |
| Exports | `config` (object), `discoverCategories()` (function), `SRC_DIR` (constant) |

**Key exports:**
- `config` — Deep-merged config object (user's config + defaults)
- `discoverCategories()` — Merges config categories with filesystem-discovered folders
- `SRC_DIR` — Absolute path to `src/` directory

**Deep merge behavior:** If the user deletes a field from their config, the default kicks in. The system never crashes from missing config fields.

---

### `_template/scripts/errors.ts`
**Purpose:** Centralized error handling shared by all scripts.

| Detail | Value |
|:--|:--|
| Imported by | All scripts |
| Lines | ~75 |
| Exports | `DsaLabError` (class), `ErrorCodes` (const), `handleError()`, `warn()` |

**Error codes (17 total):**

| Code | Used When |
|:--|:--|
| `CONFIG_NOT_FOUND` | dsa-lab.config.json missing |
| `CONFIG_PARSE_ERROR` | Invalid JSON in config |
| `CONFIG_INVALID_FIELD` | Wrong type for config field |
| `FILE_NOT_FOUND` | Expected file doesn't exist |
| `DIR_ALREADY_EXISTS` | Generator target already exists |
| `PERMISSION_DENIED` | Can't write to directory |
| `EMPTY_SRC` | No problems found in src/ |
| `IMPORT_FAILED` | Dynamic import threw |
| `NO_DEFAULT_EXPORT` | File doesn't export default function |
| `EXECUTION_ERROR` | User's function threw at runtime |
| `INVALID_NAME` | Bad problem name format |
| `UNKNOWN_TYPE` | Unrecognized category prefix |
| `MISSING_ARGS` | Generator called without required args |
| `TEST_FILE_NOT_FOUND` | No .test.ts for problem |
| `TEST_RUN_FAILED` | Jest returned non-zero |
| `NOTES_SERVER_ERROR` | Express server error |
| `PORT_IN_USE` | Notes server port conflict |

---

### `_template/scripts/serve-notes.ts`
**Purpose:** Express server that renders markdown notes as beautiful HTML pages.

| Detail | Value |
|:--|:--|
| Triggered by | `npm run notes` |
| Lines | ~180 |
| Imports from | `config.ts` |
| External deps | `express`, `marked`, `highlight.js`, `katex` |
| Port | Configurable (default: 3030) |

**Routes:**
| Route | Response |
|:--|:--|
| `GET /` | Sidebar listing all `.md` files in src/ |
| `GET /view?path=<relative>` | Rendered markdown page |
| Static files | `templates/styles.css`, `templates/client.js` |

**Markdown pipeline:** Raw `.md` → `marked` (markdown→HTML) → `highlight.js` (code blocks) → `KaTeX` (math) → injected into `page.html` template.

---

### `_template/scripts/templates/`
**Purpose:** Static assets for the notes server.

| File | Purpose |
|:--|:--|
| `page.html` | HTML shell with placeholders for title, sidebar, content |
| `styles.css` | Dark theme, responsive layout, syntax highlighting colors |
| `client.js` | Client-side search filtering for the sidebar |

---

### `_template/dsa-lab.config.json`
**Purpose:** The user's project configuration. Customized by the CLI during scaffolding.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full schema.

---

### `_template/package.json`
**Purpose:** The scaffolded project's package.json.

Key scripts:
| Script | Command |
|:--|:--|
| `start` | `tsx scripts/dashboard.ts` |
| `make` | `tsx scripts/generate.ts` |
| `test` | `npx jest` |
| `notes` | `tsx scripts/serve-notes.ts` |

---

### `_template/tsconfig.json`
**Purpose:** TypeScript config for the scaffolded project. Strict mode, ESM, Node 18+ target.

### `_template/jest.config.ts`
**Purpose:** Jest config using `ts-jest` with ESM support.

---

## `__tests__/` — CLI Test Suite

| File | What it tests |
|:--|:--|
| `cli.test.js` | End-to-end: scaffolds a project, verifies file structure, sample problem, --dry-run flag |
| `config.test.js` | Config loading, deep merge, defaults |
| `errors.test.js` | DsaLabError class, handleError output, warn output |
| `generator.test.js` | File generation, validation, name regex |
| `scanner.test.js` | Problem scanning, directory traversal, filtering |
| `sample-problem.test.js` | Bundled sample problem structure, content quality, @version stamps |

Run with: `npm test` (uses Jest with `--experimental-vm-modules` for ESM).

---

## `.github/workflows/`

| File | Trigger | What it does |
|:--|:--|:--|
| `test.yml` | Push / PR to main | Runs `npm test` on Node 20 |
| `publish.yml` | GitHub Release created | Publishes to npm using `NPM_TOKEN` secret |
