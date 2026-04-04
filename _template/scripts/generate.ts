/**
 * ─── DSA Lab — Problem Scaffolder ─────────────────────────────
 *
 * Usage: npm run make <type> <name>
 * Example: npm run make lc twoSum_1
 */

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { config, CATEGORIES, SRC_DIR } from './config.ts';
import { DsaLabError, ErrorCodes, handleError } from './errors.ts';

const isValidName = (str: string): boolean => /^[a-zA-Z]+(_\d+)?$/.test(str);

const type = process.argv[2];
const name = process.argv[3];

if (!type || !name) {
  handleError(new DsaLabError(
    'Missing arguments.',
    `Usage: npm run make <type> <name>\n    Available types: ${CATEGORIES.map(c => c.prefix).join(', ')}`,
    ErrorCodes.MISSING_ARGS
  ));
}

if (!isValidName(name)) {
  handleError(new DsaLabError(
    `Invalid name: "${name}"`,
    'Name must contain only letters (A-Z, a-z), optionally ending with _<number> (e.g., twoSum_1).',
    ErrorCodes.INVALID_NAME
  ));
}

const resolvedType = type === 'pattern' ? 'p' : type;
const category = CATEGORIES.find(c => c.prefix === resolvedType);

if (!category) {
  handleError(new DsaLabError(
    `Unknown type: "${type}"`,
    `Available types: ${CATEGORIES.map(c => `${c.prefix} (${c.folder})`).join(', ')}`,
    ErrorCodes.UNKNOWN_TYPE
  ));
}

const { folder } = category!;
const targetDir = path.join(SRC_DIR, folder, name);
const tsFile = path.join(targetDir, `${name}.ts`);
const testFile = path.join(targetDir, `${name}.test.ts`);
const noteFile = path.join(targetDir, `${name}.md`);
const drawingFile = path.join(targetDir, `${name}.excalidraw`);

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(chalk.green(`  ✔ Created folder: ${folder}/${name}/`));
}

if (!fs.existsSync(tsFile)) {
  const commentPrefix: Record<string, string> = {
    lc: 'LeetCode', algo: 'Algorithm', ds: 'Data Structure',
    p: 'Pattern', pg: 'Playground', b: 'Blind',
  };
  const prefix = commentPrefix[resolvedType] || 'Problem';

  const content = `// ${prefix}: ${name}
// ────────────────────────────────────────

function ${name}() {
  // Your code here
}

// ── Metadata (powers the dashboard) ──────────
export const meta = {
  name: '${name}',
  time: 'O(?)',
  space: 'O(?)',
  difficulty: 'Medium' as const,
  tags: [] as string[],
  sampleInput: [] as unknown[],
  // sampleOutput: undefined,  // ← uncomment & set when ready
};

export default ${name};
`;

  fs.writeFileSync(tsFile, content);
  console.log(chalk.green(`  ✔ Created: ${name}.ts`));
} else {
  console.log(chalk.dim(`  ⊘ Skipped: ${name}.ts (already exists)`));
}

if (config.features.testing && !fs.existsSync(testFile)) {
  const testContent = `import ${name} from './${name}.ts';

describe('${name}', () => {
  test('should return correct result for basic input', () => {
    // TODO: Replace with actual test cases
    // expect(${name}(input)).toBe(expected);
  });

  test('should handle edge cases', () => {
    // TODO: Add edge case tests
  });
});
`;

  fs.writeFileSync(testFile, testContent);
  console.log(chalk.green(`  ✔ Created: ${name}.test.ts`));
}

if (!fs.existsSync(noteFile)) {
  const noteContent = `# ${folder}: ${name}

${config.features.excalidraw ? `![Diagram](./${name}.excalidraw)\n` : ''}
## Understanding the Problem

## Concrete Examples

## Approach

## Complexity
- Time: O()
- Space: O()
`;

  fs.writeFileSync(noteFile, noteContent);
  console.log(chalk.green(`  ✔ Created: ${name}.md`));
}

if (config.features.excalidraw && !fs.existsSync(drawingFile)) {
  const blankCanvas = {
    type: 'excalidraw', version: 2, source: 'dsa-lab',
    elements: [], appState: { gridSize: null, viewBackgroundColor: '#ffffff' }, files: {},
  };
  fs.writeFileSync(drawingFile, JSON.stringify(blankCanvas, null, 2));
  console.log(chalk.green(`  ✔ Created: ${name}.excalidraw`));
}

console.log('');
console.log(chalk.bold.green(`  🎯 Problem scaffolded! Open: src/${folder}/${name}/${name}.ts`));
console.log(chalk.dim(`     Run "npm start" to execute it from the dashboard.`));
console.log('');
