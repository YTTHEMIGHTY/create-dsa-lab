import { describe, test, expect } from '@jest/globals';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.join(__dirname, '..', '__fixtures__');

describe('Config Parsing', () => {
  test('valid config should be valid JSON', () => {
    const configPath = path.join(FIXTURES_DIR, 'valid-config.json');
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    expect(parsed).toHaveProperty('lab');
    expect(parsed).toHaveProperty('features');
    expect(parsed).toHaveProperty('categories');
    expect(parsed.features).toHaveProperty('excalidraw');
    expect(parsed.features).toHaveProperty('notesServer');
    expect(parsed.features).toHaveProperty('benchmarker');
    expect(parsed.features).toHaveProperty('testing');
  });

  test('invalid config should fail to parse', () => {
    const configPath = path.join(FIXTURES_DIR, 'invalid-config.json');
    const raw = fs.readFileSync(configPath, 'utf-8');
    expect(() => JSON.parse(raw)).toThrow(SyntaxError);
  });

  test('config categories should have required fields', () => {
    const configPath = path.join(FIXTURES_DIR, 'valid-config.json');
    const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    for (const cat of parsed.categories) {
      expect(cat).toHaveProperty('prefix');
      expect(cat).toHaveProperty('folder');
      expect(cat).toHaveProperty('label');
    }
  });

  test('default template config should be valid', () => {
    const configPath = path.join(__dirname, '..', '_template', 'dsa-lab.config.json');
    const raw = fs.readFileSync(configPath, 'utf-8');
    const parsed = JSON.parse(raw);
    expect(parsed.categories.length).toBeGreaterThan(0);
    expect(parsed.notesServer.port).toBe(3030);
    expect(parsed.benchmark.iterations).toBe(100);
  });
});
