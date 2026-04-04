import { jest, describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI_PATH = path.join(__dirname, '..', 'bin', 'cli.js');
const FIXTURES_DIR = path.join(__dirname, '..', '__fixtures__');
const TEST_OUTPUT_DIR = path.join(FIXTURES_DIR, 'test-output');

describe('CLI Scaffolder', () => {
  beforeEach(() => {
    if (fs.existsSync(TEST_OUTPUT_DIR)) {
      fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
    }
  });
  afterEach(() => {
    if (fs.existsSync(TEST_OUTPUT_DIR)) {
      fs.rmSync(TEST_OUTPUT_DIR, { recursive: true, force: true });
    }
  });

  test('should display help when --help flag is used', () => {
    const result = execSync(`node ${CLI_PATH} --help`, { encoding: 'utf-8' });
    expect(result).toContain('create-dsa-lab');
    expect(result).toContain('Scaffold');
  });

  test('should display version when --version flag is used', () => {
    const result = execSync(`node ${CLI_PATH} --version`, { encoding: 'utf-8' });
    expect(result.trim()).toMatch(/^\d+\.\d+\.\d+$/);
  });

  test('template directory should exist and contain required files', () => {
    const templateDir = path.join(__dirname, '..', '_template');
    expect(fs.existsSync(templateDir)).toBe(true);
    expect(fs.existsSync(path.join(templateDir, 'package.json'))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, 'tsconfig.json'))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, 'jest.config.ts'))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, 'dsa-lab.config.json'))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, 'scripts', 'config.ts'))).toBe(true);
    expect(fs.existsSync(path.join(templateDir, 'scripts', 'errors.ts'))).toBe(true);
  });

  test('template package.json should have required scripts', () => {
    const pkgPath = path.join(__dirname, '..', '_template', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    expect(pkg.scripts.start).toContain('dashboard');
    expect(pkg.scripts.make).toContain('generate');
    expect(pkg.scripts.notes).toContain('serve-notes');
    expect(pkg.type).toBe('module');
  });
});
