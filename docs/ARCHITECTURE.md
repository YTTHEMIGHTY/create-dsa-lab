# Architecture — create-dsa-lab

> **📖 Full Documentation Index:**
> - [HOW_IT_WORKS.md](./HOW_IT_WORKS.md) — End-to-end flow diagrams (scaffolding → daily usage)
> - [DESIGN_DECISIONS.md](./DESIGN_DECISIONS.md) — Why every non-obvious choice was made
> - [FILE_REFERENCE.md](./FILE_REFERENCE.md) — What every file does, who imports it
> - [DEVELOPMENT.md](./DEVELOPMENT.md) — Setup, testing, releasing, publishing
> - [CHANGELOG.md](./CHANGELOG.md) — Version history

## High-Level Overview

```
create-dsa-lab (npm package)
├── bin/cli.js          ← Entry point (npx create-dsa-lab runs this)
│   └── Prompts user → Copies _template/ → Customizes config
└── _template/          ← Copied to user's project
    ├── scripts/        ← Dashboard, generator, config, errors, notes server
    ├── src/            ← Empty category folders
    └── config files    ← package.json, tsconfig, jest, dsa-lab.config
```

## Two-Repo Strategy

| Repo | Purpose |
|:--|:--|
| `create-dsa-lab` | npm CLI tool — scaffolds new projects |
| `daily-dsa` | Your personal DSA lab — consumes the CLI |

## How It Works

1. User runs `npx create-dsa-lab my-lab`
2. `bin/cli.js` shows interactive prompts (name, categories, features)
3. `fs.cpSync` copies `_template/` → user's project
4. Config is customized with user's answers
5. `npm install` + `git init` runs automatically
6. Done — user has a working DSA lab

## Key Scripts (inside _template/)

| Script | Triggered By | What It Does |
|:--|:--|:--|
| `dashboard.ts` | `npm start` | Interactive menu → Run/Test/Benchmark/Notes + file watching |
| `generate.ts` | `npm run make` | Scaffolds problem folder with .ts, .test.ts, .md files |
| `config.ts` | imported by others | Loads dsa-lab.config.json + discovers folders in src/ |
| `errors.ts` | imported by others | DsaLabError class with message, suggestion, code |
| `serve-notes.ts` | `npm run notes` | Express server rendering markdown notes |

## Hybrid Discovery

Config categories + filesystem scan are merged:
- Folders listed in `dsa-lab.config.json` get their configured labels
- Any extra folder in `src/` is auto-discovered with a default label
- This means users never HAVE to touch config

## The meta Convention

Every problem exports a `meta` object powering the dashboard:
```typescript
export const meta = {
  name: 'Two Sum',
  time: 'O(n)', space: 'O(n)',
  difficulty: 'Easy',
  tags: ['hash-map'],
  sampleInput: [[2,7,11,15], 9],
  sampleOutput: [0, 1],  // optional — uses 'in' check
};
```

## Dependencies

| Package | Used By | Purpose |
|:--|:--|:--|
| commander | bin/cli.js | CLI argument parsing |
| prompts | cli.js, dashboard | Interactive prompts |
| chalk | all scripts | Terminal colors |
| chokidar | dashboard | File watching |
| cli-table3 | dashboard | Benchmark table |
| express | serve-notes | HTTP server |
| marked | serve-notes | Markdown rendering |
| tsx | template scripts | TypeScript execution |
| jest/ts-jest | testing | Test runner |
