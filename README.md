# 🧪 create-dsa-lab

> Scaffold a zero-config, test-driven DSA laboratory in seconds.
> Built by engineers, for engineers who take DSA seriously.

[![npm version](https://img.shields.io/npm/v/create-dsa-lab.svg?style=flat-square)](https://www.npmjs.com/package/create-dsa-lab)
[![license](https://img.shields.io/npm/l/create-dsa-lab.svg?style=flat-square)](LICENSE)

---

## ⚡ Quick Start (30 seconds)

```bash
npx create-dsa-lab my-practice
cd my-practice
npm start
```

## ✨ What You Get

| Feature | Description |
| :--- | :--- |
| 🎯 **Interactive Dashboard** | Run, Test, Benchmark — all from `npm start` |
| 🧪 **TDD Built-In** | Co-located `.test.ts` files generated automatically |
| 📊 **Benchmarker** | Real execution time + memory + your Big O annotations |
| 📚 **Notes Server** | Markdown → beautiful docs with syntax highlighting + KaTeX |
| ⚙️ **Configurable** | Feature flags, custom categories, extensible config |
| 🔥 **Hot Reload** | Edit a file → dashboard auto-re-runs your last action |

---

## 🚀 Usage Guide

### Create Your Lab

```bash
npx create-dsa-lab my-practice
```

The CLI will ask you:
- **Project name** and **author**
- Whether to enable **Excalidraw** diagram scaffolding
- Which **categories** to include (algorithms, leetcode, patterns, etc.)

### Scaffold a Problem

```bash
npm run make lc twoSum_1        # LeetCode problem
npm run make algo mergeSort     # Algorithm
npm run make ds linkedList      # Data Structure
npm run make p slidingWindow    # Pattern
npm run make b arrayProduct     # Blind list
npm run make pg myExperiment    # Playground
```

Each problem gets auto-generated files:

```
src/leetcode/twoSum_1/
├── twoSum_1.ts           ← Implementation + metadata
├── twoSum_1.test.ts      ← Co-located test (TDD ready)
└── twoSum_1.md           ← Notes template
```

### The Dashboard (`npm start`)

One command to rule them all:

```
$ npm start

  ╔══════════════════════════════════════════════╗
  ║   🧪 DSA Lab — Dashboard                     ║
  ╚══════════════════════════════════════════════╝

  ? Select a problem:
    🔬 Algorithms (6)
      ▸ bubbleSort
      ▸ mergeSort
    🏆 LeetCode (30)
      ▸ twoSum_1
      ▸ threeSum_15

  ? Action for twoSum_1:
    ▶️  Run          — Execute with sample data
    🧪 Test         — Run Jest tests
    📊 Benchmark    — Measure performance
    📝 View Notes   — Open in browser
```

After running, the dashboard **watches your file for changes** and auto-re-runs on save.

### The Benchmarker

```
┌────────────────────────────────────────────────────┐
│            📊 Benchmark: Two Sum                    │
├──────────────┬─────────────────────────────────────┤
│ Difficulty   │ 🟢 Easy                              │
│ Tags         │ hash-map, array                      │
├──────────────┼─────────────────────────────────────┤
│ Time (Big O) │ O(n)                                 │
│ Space(Big O) │ O(n)                                 │
├──────────────┼─────────────────────────────────────┤
│ Avg Time     │ 0.0042ms                             │
│ Min Time     │ 0.0038ms                             │
│ Max Time     │ 0.0051ms                             │
│ Memory Delta │ +1.2 KB                              │
│ Iterations   │ 100                                  │
├──────────────┼─────────────────────────────────────┤
│ Output       │ [0, 1]                               │
│ Expected     │ [0, 1]              ✅ PASS           │
└──────────────┴─────────────────────────────────────┘
```

### Configuration (`dsa-lab.config.json`)

```json
{
  "features": {
    "excalidraw": false,
    "notesServer": true,
    "benchmarker": true,
    "testing": true
  },
  "categories": [
    { "prefix": "lc", "folder": "leetcode", "label": "🏆 LeetCode" }
  ],
  "benchmark": { "iterations": 100 }
}
```

**Auto-discovery:** Add any folder to `src/` and it appears in the dashboard automatically — no config change needed.

### The Notes Server

```bash
npm run notes
# → http://localhost:3030
```

Renders your `.md` notes with syntax highlighting, KaTeX math, and a searchable sidebar.

---

## 📁 What Gets Generated

```
my-practice/
├── src/
│   ├── algorithms/
│   ├── dataStructures/
│   ├── leetcode/
│   ├── patterns/
│   ├── blind/
│   └── playground/
├── scripts/
│   ├── dashboard.ts           ← Interactive runner/tester/benchmarker
│   ├── generate.ts            ← Problem scaffolder
│   ├── config.ts              ← Config reader
│   ├── errors.ts              ← Error handling
│   └── serve-notes.ts         ← Notes server
├── dsa-lab.config.json        ← Feature flags & settings
├── jest.config.ts
├── tsconfig.json
└── package.json
```

---

## 🗺 Roadmap

We're building this in the open. Here's what's coming:

- [ ] `dsa-lab add` — install community problem packs
- [ ] Spaced repetition reminders for revisiting solved problems
- [ ] LeetCode problem auto-importer (fetch title, difficulty, tags)
- [ ] VS Code extension for inline benchmarking

Have an idea? [Open a discussion →](https://github.com/YTTHEMIGHTY/create-dsa-lab/discussions)

---

## 🤝 Contributing

Contributions are welcome! Whether it's:

- 🐛 **Bug reports** — [Open an issue](https://github.com/YTTHEMIGHTY/create-dsa-lab/issues)
- 💡 **Feature ideas** — [Start a discussion](https://github.com/YTTHEMIGHTY/create-dsa-lab/discussions)
- 🔧 **Code contributions** — Fork → Branch → PR
- 📖 **Documentation** — Typo fixes, better explanations

---

## 🌟 Who's Using This?

Built something with `create-dsa-lab`? Add yourself:

| Lab | Author | Focus |
| :--- | :--- | :--- |
| [daily-dsa](https://github.com/YTTHEMIGHTY/daily-dsa) | @YTTHEMIGHTY | Full DSA curriculum (90+ problems) |
| *Your lab here* | *You* | *Open a PR!* |

---

## 📄 License

MIT — use it, fork it, learn from it.
