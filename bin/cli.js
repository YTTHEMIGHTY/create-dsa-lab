#!/usr/bin/env node

/**
 * ─── create-dsa-lab CLI ──────────────────────────────────────
 * Scaffolds a zero-config, test-driven DSA laboratory.
 *
 * Usage:
 *   npx create-dsa-lab my-practice
 *   npx create-dsa-lab (interactive mode)
 */

import { Command } from 'commander';
import prompts from 'prompts';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_DIR = path.join(__dirname, '..', '_template');
const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8'));

// ─── CLI Definition ───────────────────────────────────────────
const program = new Command();
program
  .name('create-dsa-lab')
  .description('Scaffold a zero-config, test-driven DSA laboratory')
  .version(pkg.version);

program
  .command('init', { isDefault: true })
  .description('Scaffold a new DSA lab')
  .argument('[project-name]', 'Name for your DSA lab')
  .action(async (projectName) => {
    try {
      await run(projectName);
    } catch (err) {
      if (err instanceof Error && err.message === 'PROMPT_CANCELLED') {
        console.log(chalk.dim('\n  Cancelled. No files were created.\n'));
        process.exit(0);
      }
      console.error(chalk.red(`\n  ✖ ${err instanceof Error ? err.message : String(err)}\n`));
      process.exit(1);
    }
  });

program
  .command('update')
  .description('Update an existing DSA lab to the latest core scripts')
  .option('--dry-run', 'Show what would change without writing any files')
  .action(async (options) => {
    try {
      await runUpdate(options.dryRun || false);
    } catch (err) {
      console.error(chalk.red(`\n  ✖ ${err instanceof Error ? err.message : String(err)}\n`));
      process.exit(1);
    }
  });

program.parse();

// ─── Main Flow ────────────────────────────────────────────────
async function run(projectName) {
  printBanner();

  const onCancel = () => { throw new Error('PROMPT_CANCELLED'); };

  if (!projectName) {
    const res = await prompts({ type: 'text', name: 'name', message: 'Project name:', initial: 'my-dsa-lab', validate: v => v.trim() ? true : 'Name is required' }, { onCancel });
    projectName = res.name;
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    const contents = fs.readdirSync(targetDir);
    if (contents.length > 0) {
      console.error(chalk.red(`\n  ✖ Directory "${projectName}" already exists and is not empty.`));
      console.error(chalk.dim(`    → Use a different name or delete the existing directory.\n`));
      process.exit(1);
    }
  }

  const answers = await prompts([
    { type: 'text', name: 'author', message: 'Your name:', initial: '' },
    { type: 'confirm', name: 'excalidraw', message: 'Enable Excalidraw diagrams?', initial: false },
    {
      type: 'multiselect', name: 'categories', message: 'Which categories do you want?',
      choices: [
        { title: '🧩 Patterns', value: 'patterns', selected: true },
        { title: '📦 Data Structures', value: 'dataStructures', selected: true },
        { title: '🔬 Algorithms', value: 'algorithms', selected: true },
        { title: '🤑 Blind', value: 'blind', selected: true },
        { title: '🏆 LeetCode', value: 'leetcode', selected: true },
        { title: '🎮 Playground', value: 'playground', selected: true },
      ],
      min: 1, hint: '- Space to toggle, Enter to confirm',
    },
  ], { onCancel });

  console.log('');
  console.log(chalk.dim('  Creating project...'));
  fs.cpSync(TEMPLATE_DIR, targetDir, { recursive: true });

  const allCategories = ['patterns', 'dataStructures', 'algorithms', 'blind', 'leetcode', 'playground'];
  const selectedCategories = answers.categories || allCategories;

  for (const cat of allCategories) {
    const catDir = path.join(targetDir, 'src', cat);
    if (!selectedCategories.includes(cat) && fs.existsSync(catDir)) {
      fs.rmSync(catDir, { recursive: true, force: true });
    } else if (!fs.existsSync(catDir)) {
      fs.mkdirSync(catDir, { recursive: true });
    }
    if (selectedCategories.includes(cat)) {
      const gitkeep = path.join(catDir, '.gitkeep');
      if (!fs.existsSync(gitkeep)) fs.writeFileSync(gitkeep, '');
    }
  }

  const configPath = path.join(targetDir, 'dsa-lab.config.json');
  const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  config.lab.name = projectName;
  config.lab.author = answers.author || '';
  config.features.excalidraw = answers.excalidraw || false;
  config.categories = config.categories.filter(c => selectedCategories.includes(c.folder));
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');

  const pkgPath = path.join(targetDir, 'package.json');
  const labPkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  labPkg.name = projectName;
  labPkg.author = answers.author || '';
  fs.writeFileSync(pkgPath, JSON.stringify(labPkg, null, 2) + '\n');

  console.log(chalk.green(`  ✔ Created project at ./${projectName}`));

  console.log(chalk.dim('  Installing dependencies...'));
  try {
    execSync('npm install', { cwd: targetDir, stdio: 'pipe' });
    console.log(chalk.green('  ✔ Dependencies installed'));
  } catch {
    console.warn(chalk.yellow('  ⚠ Failed to install dependencies automatically.'));
    console.warn(chalk.dim(`    → Run "cd ${projectName} && npm install" manually.`));
  }

  try {
    execSync('git init', { cwd: targetDir, stdio: 'pipe' });
    console.log(chalk.green('  ✔ Initialized git repository'));
  } catch { /* git not available */ }

  printSuccess(projectName);
}

function printBanner() {
  console.log('');
  console.log(chalk.bold('  ╔══════════════════════════════════════════════╗'));
  console.log(chalk.bold('  ║') + chalk.cyan.bold('   🧪 create-dsa-lab                          ') + chalk.bold('║'));
  console.log(chalk.bold('  ║') + chalk.dim('   Scaffold a zero-config DSA laboratory       ') + chalk.bold('║'));
  console.log(chalk.bold('  ╚══════════════════════════════════════════════╝'));
  console.log('');
}

function printSuccess(name) {
  console.log('');
  console.log(chalk.bold.green('  🚀 Your DSA Lab is ready!'));
  console.log('');
  console.log(chalk.dim('  Getting Started:'));
  console.log(`     ${chalk.cyan(`cd ${name}`)}`);
  console.log(`     ${chalk.cyan('npm start')}                   ${chalk.dim('# launch the dashboard (sample included!)')}`);
  console.log(`     ${chalk.cyan('npm run make lc twoSum_1')}    ${chalk.dim('# scaffold a new problem')}`);
  console.log(`     ${chalk.cyan('npm run notes')}               ${chalk.dim('# start the notes server')}`);
  console.log('');
  console.log(chalk.dim('  A sample problem (Container With Most Water) is included to get you started! 🎯'));
  console.log('');
}

// ─── Smart Sync ───────────────────────────────────────────────
function walkDir(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath));
    } else {
      results.push(fullPath);
    }
  }
  return results;
}

function smartSync(srcRoot, destRoot, folderName, dryRun) {
  if (!fs.existsSync(srcRoot)) return;

  const srcFiles = walkDir(srcRoot);
  let updated = 0;
  let skipped = 0;
  let added = 0;

  for (const srcFile of srcFiles) {
    const relativePath = path.relative(srcRoot, srcFile);
    const destFile = path.join(destRoot, relativePath);
    const srcContent = fs.readFileSync(srcFile, 'utf-8');

    if (fs.existsSync(destFile)) {
      const destContent = fs.readFileSync(destFile, 'utf-8');
      if (srcContent === destContent) {
        skipped++;
        console.log(chalk.dim(`  ⊘ Unchanged: ${folderName}/${relativePath}`));
        continue;
      }

      if (dryRun) {
        console.log(chalk.yellow(`  ~ Would update: ${folderName}/${relativePath}`));
        updated++;
        continue;
      }

      // Create .bak backup before overwriting
      const bakPath = destFile + '.bak';
      fs.copyFileSync(destFile, bakPath);
      console.log(chalk.dim(`  📋 Backed up: ${folderName}/${relativePath} → .bak`));

      fs.writeFileSync(destFile, srcContent);
      console.log(chalk.green(`  ✔ Updated: ${folderName}/${relativePath}`));
      updated++;
    } else {
      if (dryRun) {
        console.log(chalk.blue(`  + Would add: ${folderName}/${relativePath}`));
        added++;
        continue;
      }

      fs.mkdirSync(path.dirname(destFile), { recursive: true });
      fs.writeFileSync(destFile, srcContent);
      console.log(chalk.green(`  ✔ Added: ${folderName}/${relativePath}`));
      added++;
    }
  }

  if (updated === 0 && added === 0) {
    console.log(chalk.dim(`  ✔ ${folderName}/ is already up to date (${skipped} files)`));
  } else {
    console.log(chalk.dim(`  → ${folderName}/: ${updated} updated, ${added} new, ${skipped} unchanged`));
  }
}

async function runUpdate(dryRun = false) {
  printBanner();

  const cwd = process.cwd();
  const configPath = path.join(cwd, 'dsa-lab.config.json');
  
  if (!fs.existsSync(configPath)) {
    throw new Error('Not inside a valid DSA Lab. Make sure you are in the project root containing dsa-lab.config.json');
  }

  if (dryRun) {
    console.log(chalk.yellow('  🔍 Dry run mode — no files will be modified\n'));
  } else {
    console.log(chalk.cyan('  Updating core scripts...\n'));
  }

  // 1. Smart-sync folders (only update changed files, with .bak backups)
  const foldersToUpdate = ['scripts'];
  // Also sync templates subfolder within scripts
  const scriptsTemplatesDir = path.join(TEMPLATE_DIR, 'scripts', 'templates');
  
  for (const folder of foldersToUpdate) {
    const srcPath = path.join(TEMPLATE_DIR, folder);
    const destPath = path.join(cwd, folder);
    smartSync(srcPath, destPath, folder, dryRun);
  }

  // 2. Merge dependencies
  if (!dryRun) {
    const userPkgPath = path.join(cwd, 'package.json');
    const templatePkgPath = path.join(TEMPLATE_DIR, 'package.json');
    
    let depsMerged = false;
    if (fs.existsSync(userPkgPath) && fs.existsSync(templatePkgPath)) {
      const userPkg = JSON.parse(fs.readFileSync(userPkgPath, 'utf-8'));
      const tempPkg = JSON.parse(fs.readFileSync(templatePkgPath, 'utf-8'));
      
      if (tempPkg.dependencies) {
        userPkg.dependencies = userPkg.dependencies || {};
        for (const [dep, ver] of Object.entries(tempPkg.dependencies)) {
          if (!userPkg.dependencies[dep]) {
            userPkg.dependencies[dep] = ver;
            depsMerged = true;
            console.log(chalk.dim(`  ✔ Added build dependency: ${dep}`));
          }
        }
      }
      
      if (tempPkg.devDependencies) {
        userPkg.devDependencies = userPkg.devDependencies || {};
        for (const [dep, ver] of Object.entries(tempPkg.devDependencies)) {
          if (!userPkg.devDependencies[dep]) {
            userPkg.devDependencies[dep] = ver;
            depsMerged = true;
            console.log(chalk.dim(`  ✔ Added devDependency: ${dep}`));
          }
        }
      }
      
      if (depsMerged) {
        fs.writeFileSync(userPkgPath, JSON.stringify(userPkg, null, 2) + '\n');
      }
    }

    console.log('');
    console.log(chalk.bold.green('  🚀 Successfully updated DSA Lab core scripts!'));
    if (depsMerged) {
      console.log(chalk.yellow('  ⚠ New dependencies were added. Please run:'));
      console.log(`     ${chalk.cyan('npm install')}`);
    }
    console.log(chalk.dim('  💡 Tip: .bak files were created for overwritten files. You can safely delete them.'));
    console.log('');
  } else {
    console.log('');
    console.log(chalk.bold.yellow('  🔍 Dry run complete — no files were modified.'));
    console.log(chalk.dim('  Run without --dry-run to apply changes.'));
    console.log('');
  }
}
