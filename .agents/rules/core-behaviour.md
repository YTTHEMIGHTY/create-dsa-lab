# Core Behaviour Rules — AI Agent Guidelines

> Rules for AI agents working on this repository. Follow these to work efficiently and use credits economically.

---

## 🔍 BEFORE ANY TASK

1. **Read `.agents/knowledge/project-overview.md` FIRST** — it explains the full architecture without needing to read code.
2. **Check `.agents/knowledge/conventions.md`** — coding patterns specific to this repo.
3. **Check `docs/` folder** — 5 detailed docs exist (ARCHITECTURE, HOW_IT_WORKS, DESIGN_DECISIONS, FILE_REFERENCE, DEVELOPMENT). Don't re-discover what's documented.
4. **Check `changelogs/unreleased.md`** — see what's changed recently.

> ⚡ **Credit saver:** If the answer is in `.agents/knowledge/`, you just saved 10+ tool calls of file reading.

---

## 💰 CREDIT-SAVING PATTERNS

### Search Before Reading
```
✅ grep_search for a function name → read only the relevant 20 lines
❌ view_file on a 475-line file to find one function
```

### Batch Edits
```
✅ Use multi_replace_file_content for non-contiguous edits in one file
❌ Make 4 separate replace_file_content calls to the same file
```

### Read Line Ranges
```
✅ view_file with StartLine=90 EndLine=140 (50 lines)
❌ view_file on the entire 475-line dashboard.ts
```

### Use Tests, Not Manual Checks
```
✅ Run `npm test` to verify everything works (27 tests, <1 second)
❌ Manually read 6 files to check if your edit broke something
```

### Don't Re-verify Unchanged Things
```
✅ Changed errors.ts → run `npm test` → check errors.test.js results
❌ Changed errors.ts → re-read config.ts, dashboard.ts to "check compatibility"
```

---

## 🗺️ COMMON TASKS — Fast Paths

### Fix a template script bug
1. Read the relevant file in `_template/scripts/`
2. Make the fix
3. Run `npm test`
4. If it involves UI/UX: smoke test in a subfolder

### Add a CLI flag or command
1. Edit `bin/cli.js` (plain JS, uses `commander`)
2. Add test in `__tests__/cli.test.js`
3. Update README.md + CONTRIBUTING.md

### Add a new error code
1. Edit `_template/scripts/errors.ts` → add to `ErrorCodes` object
2. Use: `throw new DsaLabError(msg, suggestion, ErrorCodes.YOUR_CODE)`
3. Add test in `__tests__/errors.test.js`

### Add a test
1. Add to `__tests__/<corresponding_module>.test.js`
2. Tests use `@jest/globals` imports and ESM
3. Run `npm test` to verify

### Update documentation
1. Check which files need updating: README.md, CONTRIBUTING.md, docs/*.md
2. Update `changelogs/unreleased.md` with changes
3. Don't forget to update `.agents/knowledge/` if architecture changes

### Smoke test template changes
```bash
mkdir _smoke_test && cp -r _template/* _smoke_test/
cd _smoke_test && npm install
npm start       # dashboard
npm run notes   # notes server
cd .. && rm -rf _smoke_test
```

---

## 🧪 TESTING REQUIREMENTS

- **Always** run `npm test` after code changes
- **For template changes:** scaffold in `_smoke_test/` subfolder to verify
- **Never** commit with failing tests
- **Test file location:** `__tests__/<module>.test.js` (JavaScript, not TypeScript)
- **Template tests** are excluded from root Jest (`testPathIgnorePatterns: ["/_template/"]`)

---

## 📁 FILE MAP — Where to Make Changes

| Task | File(s) to Edit |
|:--|:--|
| CLI command/flag | `bin/cli.js` |
| Dashboard behavior | `_template/scripts/dashboard.ts` |
| Problem scaffolding | `_template/scripts/generate.ts` |
| Config loading/defaults | `_template/scripts/config.ts` |
| Error messages/codes | `_template/scripts/errors.ts` |
| Notes server | `_template/scripts/serve-notes.ts` |
| Notes UI | `_template/scripts/templates/{page.html,styles.css,client.js}` |
| Project config | `_template/dsa-lab.config.json` |
| Bundled sample problem | `_template/src/leetcode/containerWithMostWater_11/` |
| CI/CD | `.github/workflows/{test.yml,publish.yml}` |
| Agent knowledge | `.agents/knowledge/` |

---

## ⚠️ GOTCHAS

1. **The CLI is JavaScript, not TypeScript.** Don't add TypeScript syntax to `bin/cli.js`. It must execute without compilation.
2. **ESM only.** No `require()` anywhere. The project uses `"type": "module"`.
3. **Template files ARE what users get.** Changes to `_template/` directly affect scaffolded projects.
4. **`tsx` handles TypeScript.** Don't try to compile template scripts — they're executed directly by `tsx`.
5. **`_smoke_test/` is gitignored.** Use it freely for testing, but clean up after.
6. **No personal info.** Never add emails, phone numbers, or other PII to any file.

---

## 🏷️ COMMIT & PR CONVENTIONS

- **Branch from main:** `feat/feature-name`, `fix/bug-name`, `docs/update-area`
- **Commit messages:** `feat: ...`, `fix: ...`, `docs: ...`, `test: ...`, `chore: ...`
- **Never push directly to main** — always use PRs
- **Update version stamps** in modified template scripts (`// @version X.Y.Z`)
- **Update changelog** in `changelogs/unreleased.md`
