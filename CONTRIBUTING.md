# Contributing to create-dsa-lab

First off, thank you for considering contributing! 🎉 Every contribution makes this tool better for engineers preparing for technical interviews.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting a Pull Request](#submitting-a-pull-request)
- [Conventions](#conventions)

---

## Development Setup

```bash
# 1. Fork and clone
git clone git@github.com:YOUR_USERNAME/create-dsa-lab.git
cd create-dsa-lab

# 2. Install dependencies
npm install

# 3. Run the test suite
npm test

# 4. (Optional) Link globally for local testing
npm link
create-dsa-lab test-project
```

**Requirements:** Node.js 18+ and npm 9+.

---

## Project Structure

```
create-dsa-lab/
├── bin/cli.js              ← CLI entry point (plain JavaScript, ESM)
├── _template/              ← Everything copied to user's project
│   ├── scripts/            ← Dashboard, generator, config, errors, notes server
│   ├── src/                ← Category dirs + bundled sample problem
│   └── config files        ← package.json, tsconfig, jest, dsa-lab.config
├── __tests__/              ← Jest test suite for the CLI
├── __fixtures__/           ← Test data (generated during tests)
├── docs/                   ← Architecture, design decisions, file reference
├── .agents/                ← AI agent knowledge and rules
├── .github/                ← CI/CD workflows, issue/PR templates
└── changelogs/             ← Version history
```

> 📖 For a deep dive, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/FILE_REFERENCE.md](docs/FILE_REFERENCE.md).

---

## Making Changes

### Adding a Feature to the Template

Template scripts (what users get) live in `_template/scripts/`:

1. Edit the relevant script in `_template/scripts/`
2. Add the `// @version X.Y.Z` stamp if you modify a template script
3. Add tests in `__tests__/`
4. Smoke test by scaffolding a project (see [Testing](#smoke-testing))

### Adding a CLI Command or Flag

The CLI is `bin/cli.js` — plain JavaScript with `commander`:

1. Add your command/flag to `bin/cli.js`
2. Add tests in `__tests__/cli.test.js`
3. Update `README.md` and `docs/` as needed

### Adding a New Error Code

1. Edit `_template/scripts/errors.ts` → add to the `ErrorCodes` object
2. Use: `throw new DsaLabError(message, suggestion, ErrorCodes.YOUR_CODE)`
3. Add a test in `__tests__/errors.test.js`

---

## Testing

### Running Tests

```bash
npm test                              # Full suite + coverage
npx jest --watch                      # Watch mode
npx jest __tests__/cli.test.js        # Single file
```

### Smoke Testing

For template changes, always scaffold a real project to verify:

```bash
# Scaffold a test lab
mkdir _smoke_test && cp -r _template/* _smoke_test/
cd _smoke_test && npm install

# Test the dashboard
npm start

# Test the notes server
npm run notes

# Test problem generation
npm run make lc twoSum_1

# Clean up
cd .. && rm -rf _smoke_test
```

> ⚠️ `_smoke_test/` is in `.gitignore` — don't commit it.

### What to Test

| Change type | What to verify |
|:--|:--|
| Template script | `npm test` + smoke test (scaffold + `npm start`) |
| CLI command | `npm test` + manual run with `node bin/cli.js` |
| Config changes | `npm test` (config tests cover schema) |
| Documentation | Links resolve, no broken references |

---

## Submitting a Pull Request

### Process

1. **Fork** the repo and create a branch from `main`
2. **Name your branch** descriptively: `feat/spaced-repetition`, `fix/emoji-rendering`, `docs/update-readme`
3. **Make your changes** (see conventions below)
4. **Run tests**: `npm test` must pass
5. **Open the PR** — fill in the PR template
6. **Request review** — a maintainer will review and merge

### PR Checklist

- [ ] All existing tests pass (`npm test`)
- [ ] New code has corresponding tests
- [ ] Documentation is updated if behavior changes
- [ ] No personal information (emails, phone numbers) in commits
- [ ] Commit messages follow conventions (see below)

---

## Conventions

### Code Style

- **ESM everywhere** — `import`/`export`, no `require()`
- **CLI is plain JavaScript** — no TypeScript in `bin/` (zero build step)
- **Template scripts are TypeScript** — strict mode, `.ts` extensions
- **Error handling** — always use `DsaLabError` with a code and suggestion

### Commit Messages

We use conventional commits:

```
feat: add spaced repetition reminders
fix: resolve emoji rendering in config labels
docs: update README with smart update section
test: add smoke test for dashboard
chore: bump dependencies
```

### Version Stamps

All template scripts have a `// @version X.Y.Z` comment on line 1. Update this when you modify a template script.

---

## Questions?

- 💬 [Start a discussion](https://github.com/YTTHEMIGHTY/create-dsa-lab/discussions)
- 🐛 [Report a bug](https://github.com/YTTHEMIGHTY/create-dsa-lab/issues/new?template=bug_report.md)
- 💡 [Request a feature](https://github.com/YTTHEMIGHTY/create-dsa-lab/issues/new?template=feature_request.md)

Thank you for helping make DSA practice better for everyone! 🚀
