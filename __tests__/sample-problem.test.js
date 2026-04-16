import { describe, test, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMPLATE_DIR = path.join(__dirname, '..', '_template');
const SAMPLE_DIR = path.join(TEMPLATE_DIR, 'src', 'leetcode', 'containerWithMostWater_11');

describe('Bundled Sample Problem', () => {
  test('containerWithMostWater_11.ts should exist in template', () => {
    const tsFile = path.join(SAMPLE_DIR, 'containerWithMostWater_11.ts');
    expect(fs.existsSync(tsFile)).toBe(true);
  });

  test('containerWithMostWater_11.test.ts should exist in template', () => {
    const testFile = path.join(SAMPLE_DIR, 'containerWithMostWater_11.test.ts');
    expect(fs.existsSync(testFile)).toBe(true);
  });

  test('containerWithMostWater_11.md should exist in template', () => {
    const mdFile = path.join(SAMPLE_DIR, 'containerWithMostWater_11.md');
    expect(fs.existsSync(mdFile)).toBe(true);
  });

  test('leetcode/.gitkeep should NOT exist (replaced by sample problem)', () => {
    const gitkeep = path.join(TEMPLATE_DIR, 'src', 'leetcode', '.gitkeep');
    expect(fs.existsSync(gitkeep)).toBe(false);
  });

  test('sample solution file should contain meta export', () => {
    const tsFile = path.join(SAMPLE_DIR, 'containerWithMostWater_11.ts');
    const content = fs.readFileSync(tsFile, 'utf-8');
    expect(content).toContain('export const meta');
    expect(content).toContain('export default containerWithMostWater_11');
    expect(content).toContain("difficulty: 'Medium'");
    expect(content).toContain('sampleOutput: 49');
  });

  test('sample test file should have real assertions', () => {
    const testFile = path.join(SAMPLE_DIR, 'containerWithMostWater_11.test.ts');
    const content = fs.readFileSync(testFile, 'utf-8');
    expect(content).toContain("import containerWithMostWater_11");
    expect(content).toContain('expect(');
    expect(content).toContain('.toBe(49)');
    // Should NOT contain TODO placeholders — these are real tests
    expect(content).not.toContain('TODO');
  });

  test('sample notes file should have explanation content', () => {
    const mdFile = path.join(SAMPLE_DIR, 'containerWithMostWater_11.md');
    const content = fs.readFileSync(mdFile, 'utf-8');
    expect(content).toContain('Container With Most Water');
    expect(content).toContain('O(n)');
    expect(content).toContain('Two Pointer');
  });

  test('all template scripts should have @version stamps', () => {
    const scripts = ['config.ts', 'dashboard.ts', 'errors.ts', 'generate.ts', 'serve-notes.ts'];
    for (const script of scripts) {
      const content = fs.readFileSync(path.join(TEMPLATE_DIR, 'scripts', script), 'utf-8');
      expect(content).toContain('// @version');
    }
  });

  test('no unicode escape sequences in template files', () => {
    const textExtensions = ['.ts', '.html', '.json', '.css', '.js', '.md'];

    function walkDir(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const files = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
        if (entry.isDirectory()) {
          files.push(...walkDir(fullPath));
        } else if (textExtensions.some(ext => entry.name.endsWith(ext))) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const files = walkDir(TEMPLATE_DIR);
    const unicodeEscapePattern = /\\u[0-9a-fA-F]{4}/;

    for (const filePath of files) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(TEMPLATE_DIR, filePath);
      expect(unicodeEscapePattern.test(content)).toBe(false);
    }
  });

  test('dashboard jest command uses --experimental-vm-modules and --testPathPatterns', () => {
    const dashboardPath = path.join(TEMPLATE_DIR, 'scripts', 'dashboard.ts');
    const content = fs.readFileSync(dashboardPath, 'utf-8');

    // Must use --experimental-vm-modules for ESM support
    expect(content).toContain('--experimental-vm-modules');

    // Must use --testPathPatterns (plural) — Jest 30 removed the singular form
    expect(content).toContain('--testPathPatterns');
    expect(content).not.toMatch(/--testPathPattern[^s]/);
  });
});
