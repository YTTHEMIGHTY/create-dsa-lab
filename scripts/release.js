import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import prompts from 'prompts';
import url from 'url';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CHANGELOG_DIR = path.join(ROOT_DIR, 'changelogs');
const UNRELEASED_FILE = path.join(CHANGELOG_DIR, 'unreleased.md');

async function run() {
  console.log('\n🚢  create-dsa-lab Release Helper\n');

  // 1. Check if git is clean
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });
    if (status.trim().length > 0) {
      console.warn('⚠️  Warning: You have uncommitted changes.');
      const res = await prompts({
        type: 'confirm',
        name: 'proceed',
        message: 'Are you sure you want to proceed with release anyway?',
        initial: false
      });
      if (!res.proceed) process.exit(0);
    }
  } catch (e) {
    console.error('Failed to check git status. Make sure you are in a git repository.');
    process.exit(1);
  }

  // 2. Unreleased notes check
  let unreleasedNotes = '';
  if (fs.existsSync(UNRELEASED_FILE)) {
    unreleasedNotes = fs.readFileSync(UNRELEASED_FILE, 'utf-8').trim();
  }

  if (unreleasedNotes.length === 0) {
    console.warn('⚠️  Warning: changelogs/unreleased.md is empty.');
    const res = await prompts({
        type: 'confirm',
        name: 'proceed',
        message: 'Do you want to release an empty changelog?',
        initial: false
    });
    if (!res.proceed) process.exit(0);
  }

  // 3. Select version bump
  const currentVersion = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8')).version;
  console.log(`Current version: v${currentVersion}`);

  const { bump } = await prompts({
    type: 'select',
    name: 'bump',
    message: 'Select release type (SemVer):',
    choices: [
      { title: 'Patch (Bug fixes)', value: 'patch' },
      { title: 'Minor (New features)', value: 'minor' },
      { title: 'Major (Breaking changes)', value: 'major' },
      { title: 'Cancel', value: 'cancel' }
    ]
  });

  if (bump === 'cancel' || !bump) {
    console.log('Cancelled.');
    process.exit(0);
  }

  // 4. Bump version via npm
  console.log(`\n📦 Bumping version...`);
  // using --no-git-tag-version so we can commit the changelog files simultaneously
  const newVersionString = execSync(`npm version ${bump} --no-git-tag-version`, { encoding: 'utf-8' }).trim();
  console.log(`✔ Version bumped to ${newVersionString}`);

  // 5. Structure changelog
  const today = new Date().toISOString().split('T')[0];
  const newChangelogName = `${newVersionString}_${today}.md`;
  const newChangelogPath = path.join(CHANGELOG_DIR, newChangelogName);

  const formattedNotes = `# ${newVersionString} — ${today}\n\n${unreleasedNotes}\n`;
  
  if (!fs.existsSync(CHANGELOG_DIR)) fs.mkdirSync(CHANGELOG_DIR);
  fs.writeFileSync(newChangelogPath, formattedNotes);
  
  // Wipe unreleased scratchpad
  fs.writeFileSync(UNRELEASED_FILE, '### ✨ Features\n- \n\n### 🐞 Bug Fixes\n- \n');
  console.log(`✔ Migrated changelog to: changelogs/${newChangelogName}`);

  // 6. Commit, Tag, Push
  const { action } = await prompts({
    type: 'select',
    name: 'action',
    message: 'What should we do with the new version?',
    choices: [
      { title: `Commit, tag (${newVersionString}), and push to GitHub`, value: 'push' },
      { title: `Commit and tag (${newVersionString}) only`, value: 'commit' },
      { title: 'Do not commit automatically (leave files staged)', value: 'skip' }
    ]
  });

  if (action === 'skip' || !action) {
    console.log(`\nFiles are modified. You can now commit them manually.`);
    process.exit(0);
  }

  try {
    execSync('git add package.json package-lock.json changelogs/*', { stdio: 'inherit' });
    execSync(`git commit -m "chore(release): ${newVersionString}"`, { stdio: 'inherit' });
    execSync(`git tag ${newVersionString}`, { stdio: 'inherit' });
    console.log(`✔ Committed and tagged as ${newVersionString}`);

    if (action === 'push') {
      console.log('Pushing to GitHub...');
      execSync('git push origin HEAD --tags', { stdio: 'inherit' });
      console.log(`✔ Pushed ${newVersionString} to GitHub!`);
      console.log(`\n🚀 NOW: Go to GitHub and "Draft a new release" using the tag ${newVersionString}.`);
      console.log('   The GitHub Action will automatically publish this to NPM!');
    } else {
      console.log(`\n🚀 Release is tagged locally. Don't forget to push: git push origin HEAD --tags`);
    }
  } catch (error) {
    console.error(`\n❌ Error performing git operations:`, error.message);
  }
}

run();
