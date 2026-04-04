# Development Guide — create-dsa-lab

## Setup

```bash
git clone git@github.com:YTTHEMIGHTY/create-dsa-lab.git
cd create-dsa-lab
npm install
npm test
```

## Project Structure

```
create-dsa-lab/
├── bin/cli.js              ← CLI entry point
├── _template/              ← Copied to user's project
│   ├── scripts/            ← Dashboard, generator, config, errors, notes
│   ├── src/                ← Empty category directories
│   └── config files
├── __tests__/              ← Test suite
├── __fixtures__/           ← Test data
├── docs/                   ← Documentation
├── .github/workflows/      ← CI/CD
└── package.json            ← CLI package (published to npm)
```

## Testing

```bash
npm test                     # all tests + coverage
npx jest --watch             # watch mode
npx jest __tests__/cli.test.js  # single file
```

## Local Testing with npm link

```bash
# 1. Create global symlink
npm link

# 2. Test like a real user
create-dsa-lab test-project
cd test-project && npm install && npm start

# 3. Changes are instant (symlink!)
#    Edit source → re-test, no reinstall needed

# 4. Clean up
npm unlink -g create-dsa-lab
rm -rf test-project
```

## Version Control & Releases

### Semantic Versioning

| Change | Command | Example |
|:--|:--|:--|
| Bug fix | `npm version patch` | 1.0.0 → 1.0.1 |
| New feature | `npm version minor` | 1.0.0 → 1.1.0 |
| Breaking change | `npm version major` | 1.0.0 → 2.0.0 |

`npm version` automatically: updates package.json, creates git commit, creates git tag.

### Release Workflow

```bash
# 1. Make changes + commit
git add . && git commit -m "feat: add new feature"

# 2. Bump version
npm version minor

# 3. Push code + tags
git push origin main && git push --tags

# 4. Create GitHub Release
#    → github.com/YTTHEMIGHTY/create-dsa-lab/releases
#    → Draft new release → pick tag → Publish
#    → GitHub Actions auto-publishes to npm!
```

### Manual publish (alternative)
```bash
npm version patch
npm publish --access public
```

## Publishing to npm

### First Time
```bash
npm login          # login to npmjs.com
npm whoami         # verify
npm publish --access public   # 🚀 live!
```

Package page: https://www.npmjs.com/package/create-dsa-lab

### Set Up Automated Publishing
1. npmjs.com → Access Tokens → Generate (Automation type)
2. GitHub repo → Settings → Secrets → Actions → New: `NPM_TOKEN`
3. Now GitHub Releases auto-publish to npm!

### How Users Get Updates
- **New users:** `npx create-dsa-lab` always gets latest
- **Existing projects:** Don't auto-update (already scaffolded)

## Git Branching (Recommended)

```bash
# Feature branch
git checkout -b feature/my-feature
# ... make changes ...
git push -u origin feature/my-feature
# Create PR → Merge → Bump version on main
```

## Common Tasks

### Add a feature to template
1. Edit `_template/scripts/*.ts`
2. Test with `npm link` + `create-dsa-lab test-project`
3. Add tests in `__tests__/`
4. Run `npm test`
5. Bump version + publish

### Add a new CLI prompt
1. Edit `bin/cli.js` → add to `prompts([...])` array
2. Use answer in template customization section
3. Test with `npm link`

### Add a new error code
1. Edit `_template/scripts/errors.ts` → add to `ErrorCodes`
2. Use: `throw new DsaLabError(msg, suggestion, ErrorCodes.YOUR_CODE)`
