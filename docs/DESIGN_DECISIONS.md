# Design Decisions — Why Things Are The Way They Are

> Every non-obvious choice in `create-dsa-lab`, explained. This document is the "why" behind the "what".

---

## 1. Why a CLI Scaffolder Instead of a Template Repo?

**Alternative considered:** A GitHub template repository users click "Use this template" on.

**Why we chose CLI instead:**
- **Customization at creation time.** Users pick categories, features, and metadata interactively. A template repo would give everyone the same thing.
- **Post-copy automation.** The CLI runs `npm install` and `git init` automatically. Template repos can't do that.
- **Version distribution.** `npx create-dsa-lab` always runs the latest version. Template repos require users to manually check for updates.
- **Consistent naming.** The CLI injects the project name into `package.json` and `dsa-lab.config.json`. Template repos leave `{{PROJECT_NAME}}` placeholders.

---

## 2. Why Plain JavaScript for `bin/cli.js`?

**Alternative considered:** TypeScript CLI compiled with `tsc` or `tsup`.

**Why we chose plain JS:**
- **Zero build step.** `npx` downloads the package and runs it immediately. No compilation, no bundler, no delay.
- **Smaller package size.** No TypeScript compiler or build artifacts in the published package.
- **The CLI is simple.** It's ~170 lines of prompts + file copying. TypeScript's value is in the template scripts where there's complex logic, not in the straightforward CLI.
- **Template scripts ARE TypeScript.** The code users interact with daily (`dashboard.ts`, `generate.ts`, etc.) gets full TypeScript with strict mode via `tsx`.

---

## 3. Why `fs.cpSync` Instead of a Templating Engine?

**Alternative considered:** Using EJS, Handlebars, or mustache to template files.

**Why we chose raw copy + JSON manipulation:**
- **Files are real, working code.** Every `.ts` file in `_template/` is valid TypeScript you can open and read. No `<%%= %>` syntax polluting the source.
- **Customization is minimal.** We only need to change JSON config values and remove unwanted folders. A templating engine would be overkill.
- **Easier to maintain.** To update the dashboard, you edit `_template/scripts/dashboard.ts` directly. No template compilation step, no learning a templating DSL.

---

## 4. Why Hybrid Category Discovery?

**Alternatives considered:**
- Config-only (all categories must be declared in `dsa-lab.config.json`)
- Filesystem-only (scan `src/` and auto-generate labels)

**Why we chose hybrid:**
- **Zero-config default path.** Drop a folder in `src/` and it works. The dashboard picks it up automatically. No config edit needed.
- **Rich labels when you want them.** Config lets you set emoji-prefixed labels (`🏆 LeetCode`) and short prefixes (`lc`) for the generator. Pure filesystem discovery can't provide these.
- **No orphaned config.** If you delete a folder, the scanner just skips it. No config cleanup needed.

The merge logic in `discoverCategories()`:
1. Start with config-defined categories
2. Scan `src/` for any folders NOT in config
3. Auto-generate a label for those (capitalize the folder name)
4. Return the merged list

---

## 5. Why `meta` Exports Instead of Frontmatter or Separate Files?

**Alternatives considered:**
- YAML frontmatter in the `.ts` files
- Separate `meta.json` files alongside each problem
- Comments parsed with a custom extractor

**Why we chose exported `meta` objects:**
- **Type-safe.** TypeScript checks the shape of `meta` at compile time.
- **Co-located.** The metadata lives in the same file as the implementation. One file = one truth.
- **Dynamically importable.** The dashboard does `const { meta } = await import(file)` and gets a real JS object. No parsing, no deserialization.
- **Extensible.** Users can add any field they want to `meta` without breaking anything.

---

## 6. Why Property-Existence Check for `sampleOutput`?

```typescript
// We use this:
if (meta && 'sampleOutput' in meta) { ... }

// NOT this:
if (meta?.sampleOutput !== undefined) { ... }
```

**Why:** A valid expected output could be `undefined`, `null`, `0`, `false`, `""`, or any falsy value. The `in` operator checks if the property EXISTS on the object, regardless of its value. This means all of these work correctly:

```typescript
export const meta = { sampleOutput: 0 };        // ✅ 0 is valid
export const meta = { sampleOutput: false };     // ✅ false is valid
export const meta = { sampleOutput: null };      // ✅ null is valid
export const meta = { sampleOutput: undefined }; // ✅ even this works
export const meta = {};                          // ✅ correctly skipped
```

---

## 7. Why Dynamic `import()` with Cache-Busting?

```typescript
const moduleUrl = `file://${problem.absolutePath}?t=${Date.now()}`;
const mod = await import(moduleUrl);
```

**The problem:** Node's ESM loader caches modules by URL. If a user edits their file and the watcher triggers a re-run, `import('./twoSum.ts')` returns the cached (old) version.

**The solution:** Append a unique query parameter (`?t=1712345678`) to make each import URL unique. Node treats it as a new module and re-evaluates the file.

**Why not `delete require.cache[...]`?** We use ESM, not CommonJS. ESM has no `require.cache`. The query parameter trick is the standard workaround.

---

## 8. Why Separated Template Files for the Notes Server?

**Previous design:** HTML, CSS, and JS were inline strings in `serve-notes.ts`.

**Why we refactored:**
- **IDE support.** Separate `.html`, `.css`, `.js` files get proper syntax highlighting, linting, and autocomplete. Inline strings get none of that.
- **Maintainability.** Editing a CSS rule in a JavaScript template literal is painful. Editing it in `styles.css` is natural.
- **Static serving.** Express serves `templates/` as a static directory. The HTML uses normal `<link>` and `<script>` tags — standard web development.

---

## 9. Why `tsx` Instead of `ts-node`?

**Alternative considered:** `ts-node` (the long-established TypeScript runner).

**Why we chose `tsx`:**
- **ESM support out of the box.** `ts-node` has historically painful ESM support requiring `--esm` flags and `--experimental-specifier-resolution`. `tsx` Just Works™.
- **Faster startup.** `tsx` uses `esbuild` under the hood for near-instant compilation versus `ts-node`'s `tsc`.
- **No `tsconfig` dependency for execution.** While we include a `tsconfig.json` for IDE support, `tsx` doesn't require one to run.

---

## 10. Why Feature Flags in Config?

```json
{
  "features": {
    "excalidraw": false,
    "notesServer": true,
    "benchmarker": true,
    "testing": true
  }
}
```

**Why not just include everything?**
- **Reduced noise.** If you're not using tests yet, you don't see "Test" in the action menu. Less cognitive load.
- **Opt-in complexity.** Excalidraw support adds `.excalidraw` files to every scaffolded problem. Most users don't want this.
- **Future extensibility.** Adding a new feature = add a flag + check it in the dashboard. Clean addition path.

---

## 11. Why 17 Error Codes?

Every `DsaLabError` has a string code like `CONFIG_NOT_FOUND` or `NO_DEFAULT_EXPORT`.

**Why not just error messages?**
- **Machine-readable.** Future tooling (VS Code extension, CI) can switch on error codes without parsing human text.
- **Stable.** Error messages might be reworded. Error codes stay the same across versions.
- **Debuggable.** When a user reports "I got `IMPORT_FAILED`", we know exactly which code path triggered.

---

## 12. Two-Repo Strategy: Why Separate `create-dsa-lab` and `daily-dsa`?

| | `create-dsa-lab` | `daily-dsa` |
|:--|:--|:--|
| **Purpose** | npm package that generates labs | A specific DSA lab instance |
| **Published?** | Yes, to npm | No, it's personal |
| **Users see** | The scaffolding experience | Their daily practice |
| **Changes** | New features for all users | Personal problem solutions |

**Why not a monorepo?**
- **Clean separation of concerns.** The CLI is a product. The lab is a consumer. They have different lifecycles.
- **npm publishing.** Publishing from a monorepo adds complexity (workspaces, lerna, etc.). A standalone package is straightforward.
- **Dogfooding.** `daily-dsa` is the real-world test of `create-dsa-lab`. It catches issues that unit tests miss.
