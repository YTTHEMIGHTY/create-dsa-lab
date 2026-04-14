# 🧪 My DSA Lab

> Built with [`create-dsa-lab`](https://www.npmjs.com/package/create-dsa-lab) — a zero-config, test-driven DSA laboratory.

## ⚡ Quick Start

```bash
# Launch the interactive dashboard (a sample problem is included!)
npm start

# Scaffold a new problem
npm run make lc twoSum_1

# Start the notes server
npm run notes
```

> 💡 **Tip:** A sample problem (Container With Most Water, LeetCode #11) is pre-installed.
> Run `npm start` right away to see the dashboard in action!

## 📋 Commands

| Command | Description |
| :--- | :--- |
| `npm start` | Launch the interactive dashboard (Run / Test / Benchmark) |
| `npm run make <type> <name>` | Scaffold a new problem with template |
| `npm run notes` | Start the markdown notes server at localhost:3030 |

### Problem Types

| Type | Directory | Example |
| :--- | :--- | :--- |
| `lc` | `src/leetcode` | `npm run make lc twoSum_1` |
| `ds` | `src/dataStructures` | `npm run make ds linkedList` |
| `p` | `src/patterns` | `npm run make p frequencyCounters` |
| `algo` | `src/algorithms` | `npm run make algo radixSort` |
| `b` | `src/blind` | `npm run make b arrayProduct` |
| `pg` | `src/playground` | `npm run make pg myExperiment` |

## ⚙️ Configuration

Edit `dsa-lab.config.json` to customize:

- **Feature flags**: Toggle excalidraw, notes server, benchmarker, testing
- **Categories**: Add/remove/reorder problem categories
- **Settings**: Benchmark iterations, notes server port

New folders added to `src/` are automatically discovered by the dashboard.

## 📁 Structure

```
src/
├── algorithms/       ← Sorting, searching, etc.
│   └── <name>/
│       ├── <name>.ts           ← Implementation + metadata
│       ├── <name>.test.ts      ← Co-located tests
│       └── <name>.md           ← Notes
├── dataStructures/   ← Linked lists, trees, etc.
├── leetcode/         ← LeetCode problems (includes sample!)
│   └── containerWithMostWater_11/
├── patterns/         ← Problem-solving patterns
├── blind/            ← Curated blind list
└── playground/       ← Experiments & practice
```
