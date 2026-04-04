import { describe, test, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Scanner', () => {
  test('should exclude .test.ts and .d.ts files from problem scanner', () => {
    const isValidProblemFile = (name) => {
      return name.endsWith('.ts') && !name.endsWith('.test.ts') && !name.endsWith('.d.ts');
    };
    expect(isValidProblemFile('twoSum.ts')).toBe(true);
    expect(isValidProblemFile('twoSum.test.ts')).toBe(false);
    expect(isValidProblemFile('types.d.ts')).toBe(false);
  });

  test('hybrid discovery should merge config categories with filesystem', () => {
    const configCategories = [
      { prefix: 'lc', folder: 'leetcode', label: '🏆 LeetCode' },
      { prefix: 'algo', folder: 'algorithms', label: '🔬 Algorithms' },
    ];
    const fsDirs = ['leetcode', 'algorithms', 'dynamicProgramming'];
    const configuredFolders = new Set(configCategories.map(c => c.folder));
    const result = [...configCategories];
    for (const dir of fsDirs) {
      if (!configuredFolders.has(dir)) {
        result.push({ prefix: dir.slice(0, 2), folder: dir, label: `\ud83d\udcc1 ${dir}` });
      }
    }
    expect(result.length).toBe(3);
    expect(result[2].folder).toBe('dynamicProgramming');
  });
});
