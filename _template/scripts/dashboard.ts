/**
 * ─── DSA Lab — Unified Dashboard ──────────────────────────────
 *
 * The single entry point: `npm start`
 *
 * Flow:
 *   1. Scan src/ for problem files
 *   2. Present interactive file picker (grouped by category)
 *   3. Show action menu: Run | Test | Benchmark | Notes
 *   4. Execute the selected action
 *   5. Watch the file for changes → auto re-run
 *   6. Press Enter → back to file picker
 */

import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { execSync } from 'child_process';
import prompts from 'prompts';
import chalk from 'chalk';
import chokidar from 'chokidar';
import Table from 'cli-table3';
import { config, discoverCategories, SRC_DIR } from './config.ts';
import { DsaLabError, ErrorCodes, handleError, warn } from './errors.ts';

// ─── Types ────────────────────────────────────────────────────
interface ProblemFile {
  name: string;
  category: string;
  categoryLabel: string;
  absolutePath: string;
  relativePath: string;
  testPath: string;
  hasTest: boolean;
}

interface ProblemMeta {
  name?: string;
  time?: string;
  space?: string;
  difficulty?: string;
  tags?: string[];
  sampleInput?: unknown[];
  sampleOutput?: unknown;
}

// ─── Scanner ──────────────────────────────────────────────────
function scanProblems(): ProblemFile[] {
  const categories = discoverCategories();
  const problems: ProblemFile[] = [];

  if (!fs.existsSync(SRC_DIR)) {
    throw new DsaLabError(
      'No src/ directory found.',
      'Make sure you are running this from the project root.',
      ErrorCodes.EMPTY_SRC
    );
  }

  for (const cat of categories) {
    const catDir = path.join(SRC_DIR, cat.folder);
    if (!fs.existsSync(catDir)) continue;

    try {
      const subDirs = fs.readdirSync(catDir, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.'));

      for (const sub of subDirs) {
        const tsFile = path.join(catDir, sub.name, `${sub.name}.ts`);
        if (!fs.existsSync(tsFile)) continue;
        if (sub.name.endsWith('.test') || sub.name.endsWith('.d')) continue;

        const testFile = path.join(catDir, sub.name, `${sub.name}.test.ts`);

        problems.push({
          name: sub.name,
          category: cat.folder,
          categoryLabel: cat.label,
          absolutePath: tsFile,
          relativePath: path.relative(process.cwd(), tsFile),
          testPath: testFile,
          hasTest: fs.existsSync(testFile),
        });
      }
    } catch { /* skip unreadable directories */ }
  }

  return problems;
}

// ─── File Picker ──────────────────────────────────────────────
async function pickProblem(problems: ProblemFile[]): Promise<ProblemFile | null> {
  if (problems.length === 0) {
    throw new DsaLabError(
      'No problem files found in src/.',
      'Run "npm run make lc twoSum_1" to create your first problem.',
      ErrorCodes.EMPTY_SRC
    );
  }

  const grouped = new Map<string, ProblemFile[]>();
  for (const p of problems) {
    const group = grouped.get(p.categoryLabel) || [];
    group.push(p);
    grouped.set(p.categoryLabel, group);
  }

  const choices: { title: string; value: number; description?: string }[] = [];
  let idx = 0;
  for (const [label, group] of grouped) {
    choices.push({ title: chalk.bold(`${label} (${group.length})`), value: -1, description: '' });
    for (const p of group) {
      choices.push({
        title: `  ${p.name}`,
        value: idx,
        description: p.hasTest ? chalk.green('✓ test') : chalk.dim('no test'),
      });
      idx++;
    }
  }

  const flatProblems = [...problems];

  const res = await prompts({
    type: 'autocomplete',
    name: 'index',
    message: 'Select a problem:',
    choices: choices.filter(c => c.value !== -1),
    suggest: (input, choices) => {
      const lower = input.toLowerCase();
      return Promise.resolve(choices.filter(c => c.title.toLowerCase().includes(lower)));
    },
  }, { onCancel: () => process.exit(0) });

  if (res.index === undefined) return null;
  return flatProblems[res.index];
}

// ─── Action Picker ────────────────────────────────────────────
async function pickAction(problem: ProblemFile): Promise<string> {
  const choices: { title: string; value: string }[] = [
    { title: '▶️  Run          — Execute with sample data', value: 'run' },
  ];

  if (config.features.testing) {
    choices.push({ title: '🧪 Test         — Run Jest tests', value: 'test' });
  }
  if (config.features.benchmarker) {
    choices.push({ title: '📊 Benchmark    — Measure performance', value: 'bench' });
  }
  if (config.features.notesServer) {
    choices.push({ title: '📝 View Notes   — Open in browser', value: 'notes' });
  }
  choices.push(
    { title: '🔙 Back         — Pick a different file', value: 'back' },
    { title: '❌ Exit', value: 'exit' },
  );

  const res = await prompts({
    type: 'select',
    name: 'action',
    message: `Action for ${chalk.cyan(problem.name)}:`,
    choices,
  }, { onCancel: () => process.exit(0) });

  return res.action || 'exit';
}

// ─── Run ──────────────────────────────────────────────────────
async function runProblem(problem: ProblemFile): Promise<void> {
  console.log(chalk.dim(`\n  ─── Executing ${problem.name} ──────────────────────`));

  try {
    const moduleUrl = `file://${problem.absolutePath}?t=${Date.now()}`;
    const mod = await import(moduleUrl);
    const fn = mod.default;
    const meta: ProblemMeta | undefined = mod.meta;

    if (typeof fn !== 'function') {
      throw new DsaLabError(
        `No default export function found in ${problem.name}.ts`,
        `Your file must export a function as: export default function ${problem.name}() { ... }`,
        ErrorCodes.NO_DEFAULT_EXPORT
      );
    }

    const input = meta?.sampleInput ?? [];
    const t0 = performance.now();
    let result: unknown;

    try {
      result = fn(...input);
    } catch (execErr) {
      throw new DsaLabError(
        `Runtime error in ${problem.name}: ${execErr instanceof Error ? execErr.message : String(execErr)}`,
        'Fix the error in your file and the dashboard will auto-reload.',
        ErrorCodes.EXECUTION_ERROR
      );
    }

    const t1 = performance.now();

    if (meta?.name) console.log(chalk.dim(`  Problem:  ${meta.name}`));
    if (input.length > 0) console.log(chalk.dim(`  Input:    ${formatValue(input)}`));
    console.log(`  ${chalk.bold('Output:')}  ${formatValue(result)}`);
    console.log(chalk.dim(`  Time:     ${(t1 - t0).toFixed(4)}ms`));

    if (meta && 'sampleOutput' in meta) {
      const expected = meta.sampleOutput;
      const pass = JSON.stringify(result) === JSON.stringify(expected);
      if (pass) {
        console.log(chalk.green(`  Expected: ${formatValue(expected)} ✅ PASS`));
      } else {
        console.log(chalk.red(`  Expected: ${formatValue(expected)} ❌ FAIL`));
      }
    }

    if (meta?.time) console.log(chalk.dim(`  Time O:   ${meta.time}`));
    if (meta?.space) console.log(chalk.dim(`  Space O:  ${meta.space}`));
    console.log(chalk.dim('  ────────────────────────────────────────────'));
  } catch (error) {
    if (error instanceof DsaLabError) throw error;
    throw new DsaLabError(
      `Failed to import ${problem.relativePath}: ${error instanceof Error ? error.message : String(error)}`,
      'Fix the error in the file and the dashboard will auto-reload.',
      ErrorCodes.IMPORT_FAILED
    );
  }
}

// ─── Test ─────────────────────────────────────────────────────
function testProblem(problem: ProblemFile): void {
  if (!problem.hasTest) {
    warn(`No test file found for ${problem.name}.`,
      `Create ${problem.name}.test.ts or run "npm run make" to regenerate with tests.`);
    return;
  }

  console.log(chalk.dim(`\n  ─── Testing ${problem.name} ────────────────────────\n`));
  try {
    execSync(
      `npx jest --testPathPattern="${problem.name}" --verbose --no-coverage`,
      { stdio: 'inherit', cwd: process.cwd() }
    );
  } catch {
    console.log(chalk.red(`\n  Tests failed for ${problem.name}.`));
  }
  console.log(chalk.dim('  ────────────────────────────────────────────'));
}

// ─── Benchmark ────────────────────────────────────────────────
async function benchProblem(problem: ProblemFile): Promise<void> {
  const iterations = config.benchmark.iterations;

  try {
    const moduleUrl = `file://${problem.absolutePath}?t=${Date.now()}`;
    const mod = await import(moduleUrl);
    const fn = mod.default;
    const meta: ProblemMeta | undefined = mod.meta;

    if (typeof fn !== 'function') {
      throw new DsaLabError(
        `No default export function found in ${problem.name}.ts`,
        'Export a function as default to benchmark it.',
        ErrorCodes.NO_DEFAULT_EXPORT
      );
    }

    const input = meta?.sampleInput ?? [];

    // Warm up
    for (let i = 0; i < 5; i++) fn(...input);

    // Measure
    const times: number[] = [];
    const memBefore = process.memoryUsage().heapUsed;

    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      fn(...input);
      times.push(performance.now() - t0);
    }

    const memAfter = process.memoryUsage().heapUsed;
    const result = fn(...input);

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const memDelta = memAfter - memBefore;

    const table = new Table({
      chars: { top: '─', 'top-mid': '┬', 'top-left': '┌', 'top-right': '┐', bottom: '─', 'bottom-mid': '┴', 'bottom-left': '└', 'bottom-right': '┘', left: '│', 'left-mid': '├', mid: '─', 'mid-mid': '┼', right: '│', 'right-mid': '┤', middle: '│' },
      style: { head: ['cyan'], border: ['dim'] },
    });

    table.push(
      [{ colSpan: 2, content: chalk.bold.cyan(`📊 Benchmark: ${meta?.name || problem.name}`), hAlign: 'center' }],
    );

    if (meta?.difficulty) table.push(['Difficulty', formatDifficulty(meta.difficulty)]);
    if (meta?.tags?.length) table.push(['Tags', meta.tags.join(', ')]);
    table.push(['', '']);
    table.push(['Time (Big O)', meta?.time || chalk.dim('Not specified')]);
    table.push(['Space (Big O)', meta?.space || chalk.dim('Not specified')]);
    table.push(['', '']);
    table.push(['Avg Time', `${avg.toFixed(4)}ms`]);
    table.push(['Min Time', `${min.toFixed(4)}ms`]);
    table.push(['Max Time', `${max.toFixed(4)}ms`]);
    table.push(['Memory Delta', formatBytes(memDelta)]);
    table.push(['Iterations', String(iterations)]);
    table.push(['', '']);
    if (input.length > 0) table.push(['Input', formatValue(input)]);
    table.push(['Output', formatValue(result)]);

    if (meta && 'sampleOutput' in meta) {
      const pass = JSON.stringify(result) === JSON.stringify(meta.sampleOutput);
      table.push(['Expected', `${formatValue(meta.sampleOutput)} ${pass ? chalk.green('✅ PASS') : chalk.red('❌ FAIL')}`]);
    }

    console.log('\n' + table.toString());
  } catch (error) {
    if (error instanceof DsaLabError) throw error;
    throw new DsaLabError(
      `Benchmark failed for ${problem.name}: ${error instanceof Error ? error.message : String(error)}`,
      'Fix the error in your file and try again.',
      ErrorCodes.EXECUTION_ERROR
    );
  }
}

// ─── Notes ────────────────────────────────────────────────────
function openNotes(problem: ProblemFile): void {
  const port = config.notesServer.port;
  const mdPath = path.join(path.dirname(problem.absolutePath), `${problem.name}.md`);
  const relativeMd = path.relative(SRC_DIR, mdPath);

  if (!fs.existsSync(mdPath)) {
    warn(`No notes file found for ${problem.name}.`, `Create ${problem.name}.md alongside the .ts file.`);
    return;
  }

  const url = `http://localhost:${port}/view?path=${encodeURIComponent(relativeMd)}`;
  console.log(chalk.dim(`\n  Opening: ${url}`));
  console.log(chalk.dim(`  Make sure the notes server is running: npm run notes\n`));

  try {
    execSync(`open "${url}"`, { stdio: 'pipe' });
  } catch {
    try {
      execSync(`xdg-open "${url}"`, { stdio: 'pipe' });
    } catch {
      console.log(chalk.yellow(`  ⚠ Could not open browser. Visit: ${url}`));
    }
  }
}

// ─── File Watcher ─────────────────────────────────────────────
async function watchAndRerun(problem: ProblemFile, action: string): Promise<void> {
  console.log(chalk.dim(`\n  👀 Watching ${problem.name}.ts for changes...`));
  console.log(chalk.dim('     Press Enter to go back to menu\n'));

  const watcher = chokidar.watch(problem.absolutePath, { ignoreInitial: true });

  return new Promise<void>((resolve) => {
    watcher.on('change', async () => {
      console.clear();
      console.log(chalk.yellow('  🔄 File changed, re-running...\n'));
      try {
        await executeAction(action, problem);
      } catch (error) {
        handleError(error, false);
      }
      console.log(chalk.dim(`\n  👀 Still watching ${problem.name}.ts...`));
      console.log(chalk.dim('     Press Enter to go back\n'));
    });

    const onData = () => {
      watcher.close();
      process.stdin.removeListener('data', onData);
      process.stdin.pause();
      resolve();
    };

    process.stdin.resume();
    process.stdin.setEncoding('utf-8');
    process.stdin.on('data', onData);
  });
}

// ─── Action Dispatcher ───────────────────────────────────────
async function executeAction(action: string, problem: ProblemFile): Promise<void> {
  switch (action) {
    case 'run': await runProblem(problem); break;
    case 'test': testProblem(problem); break;
    case 'bench': await benchProblem(problem); break;
    case 'notes': openNotes(problem); break;
  }
}

// ─── Formatting Helpers ───────────────────────────────────────
function formatValue(val: unknown): string {
  if (val === undefined) return chalk.dim('undefined');
  if (val === null) return chalk.dim('null');
  if (typeof val === 'function') return chalk.magenta(`[Function: ${val.name || 'anonymous'}]`);
  try {
    const str = JSON.stringify(val, (_key, v) =>
      typeof v === 'function' ? `[Function: ${v.name || 'anonymous'}]` : v
    );
    return str.length > 80 ? str.slice(0, 77) + '...' : str;
  } catch {
    return String(val);
  }
}

function formatBytes(bytes: number): string {
  const abs = Math.abs(bytes);
  const sign = bytes >= 0 ? '+' : '-';
  if (abs < 1024) return `${sign}${abs} B`;
  if (abs < 1024 * 1024) return `${sign}${(abs / 1024).toFixed(1)} KB`;
  return `${sign}${(abs / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDifficulty(d: string): string {
  const lower = d.toLowerCase();
  if (lower === 'easy') return chalk.green('🟢 Easy');
  if (lower === 'medium') return chalk.yellow('🟡 Medium');
  if (lower === 'hard') return chalk.red('🔴 Hard');
  return d;
}

// ─── Main Loop ────────────────────────────────────────────────
async function main() {
  console.clear();
  console.log('');
  console.log(chalk.bold('  ╔══════════════════════════════════════════════╗'));
  console.log(chalk.bold('  ║') + chalk.cyan.bold('   🧪 DSA Lab — Dashboard                     ') + chalk.bold('║'));
  console.log(chalk.bold('  ║') + chalk.dim('   Watching for changes...                     ') + chalk.bold('║'));
  console.log(chalk.bold('  ╚══════════════════════════════════════════════╝'));
  console.log('');

  while (true) {
    try {
      const problems = scanProblems();
      const problem = await pickProblem(problems);
      if (!problem) continue;

      const action = await pickAction(problem);
      if (action === 'exit') {
        console.log(chalk.dim('\n  Goodbye! 👋\n'));
        process.exit(0);
      }
      if (action === 'back') continue;

      await executeAction(action, problem);
      await watchAndRerun(problem, action);
      console.clear();
    } catch (error) {
      handleError(error, false);
      const res = await prompts({
        type: 'confirm',
        name: 'retry',
        message: 'Return to menu?',
        initial: true,
      });
      if (!res.retry) {
        process.exit(0);
      }
    }
  }
}

main().catch((error) => handleError(error));
