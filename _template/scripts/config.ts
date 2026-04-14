// @version 1.2.0
import fs from 'fs';
import path from 'path';
import { DsaLabError, ErrorCodes, warn } from './errors.ts';

export interface CategoryConfig {
  prefix: string;
  folder: string;
  label: string;
}

export interface DsaLabConfig {
  lab: { name: string; author: string };
  features: { excalidraw: boolean; notesServer: boolean; benchmarker: boolean; testing: boolean };
  categories: CategoryConfig[];
  notesServer: { port: number };
  benchmark: { iterations: number };
}

const DEFAULTS: DsaLabConfig = {
  lab: { name: 'my-dsa-lab', author: '' },
  features: { excalidraw: false, notesServer: true, benchmarker: true, testing: true },
  categories: [
    { prefix: 'p', folder: 'patterns', label: '🧩 Patterns' },
    { prefix: 'ds', folder: 'dataStructures', label: '📦 Data Structures' },
    { prefix: 'algo', folder: 'algorithms', label: '🔬 Algorithms' },
    { prefix: 'b', folder: 'blind', label: '🤑 Blind' },
    { prefix: 'lc', folder: 'leetcode', label: '🏆 LeetCode' },
    { prefix: 'pg', folder: 'playground', label: '🎮 Playground' },
  ],
  notesServer: { port: 3030 },
  benchmark: { iterations: 100 },
};

const PROJECT_ROOT = process.cwd();
const CONFIG_PATH = path.join(PROJECT_ROOT, 'dsa-lab.config.json');
const SRC_DIR = path.join(PROJECT_ROOT, 'src');

function deepMerge(defaults: DsaLabConfig, overrides: Record<string, unknown>): DsaLabConfig {
  const result = { ...defaults } as Record<string, unknown>;
  for (const key of Object.keys(overrides)) {
    const val = overrides[key];
    const def = result[key];
    if (val && typeof val === 'object' && !Array.isArray(val) &&
        def && typeof def === 'object' && !Array.isArray(def)) {
      result[key] = { ...(def as Record<string, unknown>), ...(val as Record<string, unknown>) };
    } else if (val !== undefined) {
      result[key] = val;
    }
  }
  return result as unknown as DsaLabConfig;
}

export function loadConfig(): DsaLabConfig {
  if (!fs.existsSync(CONFIG_PATH)) {
    warn('dsa-lab.config.json not found — using defaults.');
    return { ...DEFAULTS };
  }
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return deepMerge(DEFAULTS, JSON.parse(raw));
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new DsaLabError(
        `dsa-lab.config.json has invalid JSON: ${error.message}`,
        'Fix the syntax error and try again.',
        ErrorCodes.CONFIG_PARSE_ERROR
      );
    }
    throw error;
  }
}

export function discoverCategories(cfg?: DsaLabConfig): CategoryConfig[] {
  const config = cfg ?? loadConfig();
  const result: CategoryConfig[] = [];
  const configuredFolders = new Set(config.categories.map(c => c.folder));

  for (const cat of config.categories) {
    if (fs.existsSync(path.join(SRC_DIR, cat.folder))) result.push(cat);
  }

  if (fs.existsSync(SRC_DIR)) {
    try {
      const dirs = fs.readdirSync(SRC_DIR, { withFileTypes: true })
        .filter(d => d.isDirectory() && !d.name.startsWith('.'));
      for (const dir of dirs) {
        if (!configuredFolders.has(dir.name)) {
          result.push({ prefix: dir.name.slice(0, 2).toLowerCase(), folder: dir.name, label: `📁 ${dir.name}` });
        }
      }
    } catch { /* ignore */ }
  }
  return result;
}

export const config = loadConfig();
export const CATEGORIES = discoverCategories(config);
export { SRC_DIR, PROJECT_ROOT };
