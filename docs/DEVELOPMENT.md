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

## Smoke Testing Template Changes

For changes to `_template/`, always verify with a real scaffolded project:

```bash
# 1. Create a smoke test lab
mkdir _smoke_test && cp -r _template/* _smoke_test/
cd _smoke_test && npm install

# 2. Verify everything works
npm start           # dashboard should show sample problem
npm run notes       # notes server at localhost:3030
npm run make lc twoSum_1   # scaffold a new problem

# 3. Clean up (_smoke_test/ is gitignored)
cd .. && rm -rf _smoke_test
```

## Version Control & Releases

We use a custom, automated release script (`scripts/release.js`) that manages `package.json` bumping, extracting Unreleased changelog notes into timestamped files, and automatically tagging/pushing to Git. 

### The Perfect Release Workflow

To ensure that the tagged release perfectly targets your `main` branch, follow this sequence:

#### 1. Develop your feature
```bash
git checkout -b feat/my-new-feature
# ... make your code changes ...
git add .
git commit -m "feat: my new feature"
git push -u origin feat/my-new-feature
```

#### 2. Merge to Main
- Open a Pull Request from your branch to `main` on GitHub.
- Review and **Merge** the PR.

#### 3. Trigger the Release (Local)
Pull down the updated `main` branch locally, and explicitly run our release helper.
```bash
git checkout main
git pull origin main

# Run the automated release tool
npm run release
```
*The script will ask you for the bump type (patch, minor, major), migrate your `unreleased.md` notes to a timestamped file, bump your version, tag the commit, and push it to GitHub automatically!*

#### 4. Trigger NPM Publish (GitHub)
- Go to [Releases on GitHub](https://github.com/YTTHEMIGHTY/create-dsa-lab/releases)
- Click **Draft a new release**
- Select the `vX.Y.Z` tag that our script just pushed.
- Publish! The `publish.yml` GitHub Action will automatically grab the new tagged code and blast it to NPM.

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
