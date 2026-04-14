# Coding Conventions — create-dsa-lab

> Follow these conventions when making changes to this codebase.

## Language & Module System

- **ESM everywhere** — `import`/`export`, no `require()`. The root `package.json` has `"type": "module"`.
- **CLI is plain JavaScript** — `bin/cli.js` has no TypeScript. This ensures zero compilation step for `npx` execution.
- **Template scripts are TypeScript** — Everything in `_template/scripts/` is `.ts` with strict mode. Executed via `tsx`.

## File Organization

### Problem Structure
Every problem lives in `src/<category>/<problemName>/` with exactly 3 files:
```
src/leetcode/twoSum_1/
├── twoSum_1.ts           ← Default export function + named meta export
├── twoSum_1.test.ts      ← Jest test importing default + meta
└── twoSum_1.md           ← Markdown notes
```

### Naming
- Problem names: `camelCase` with optional `_number` suffix (e.g., `twoSum_1`, `mergeSort`)
- Must match: `/^[a-zA-Z][a-zA-Z0-9_]*$/`
- Folder name = file name (no suffix variation)

## Template Script Conventions

### Version Stamps
Every template script MUST have `// @version X.Y.Z` as the first line:
```typescript
// @version 1.2.0
/**
 * ─── DSA Lab — Dashboard ──────────────────────────
 */
```

### Error Handling
Always use `DsaLabError` with all three fields:
```typescript
throw new DsaLabError(
  'What went wrong',
  'How to fix it (shown with → arrow)',
  ErrorCodes.MACHINE_READABLE_CODE
);
```

Never throw raw `Error` objects in template scripts. The `handleError()` function wraps unknown errors gracefully.

### Imports
- Import paths in template scripts use `.ts` extensions: `import { config } from './config.ts'`
- This works because `tsx` handles resolution

## The `meta` Object

Every problem's default export is the solution function. The named `meta` export provides metadata:

```typescript
export const meta = {
  name: 'Two Sum',              // Display name
  difficulty: 'Easy' as const,  // Enables type narrowing
  tags: ['hash-map', 'array'], // Shown in benchmark table
  time: 'O(n)',                 // Big O — your annotation, not computed
  space: 'O(n)',
  sampleInput: [[2,7,11,15], 9], // Spread: fn(...sampleInput)
  sampleOutput: [0, 1],          // Optional — uses 'in' check
};
```

**Critical:** Use `'sampleOutput' in meta` for existence checks, NOT `meta.sampleOutput !== undefined`. Valid outputs can be falsy (`0`, `false`, `null`).

## Config Loading

`config.ts` merges user config with defaults via deep merge. Always access config through the imported `config` object — never read the JSON file directly from other scripts.

## CLI Conventions (bin/cli.js)

- Use `commander` for argument parsing
- Use `prompts` for interactive input (with `onCancel` handler)
- Use `chalk` for colored output (consistent across all messages)
- Prefix all output with 2 spaces for alignment (`console.log('  ...')`)
- Use emoji in user-facing messages for visual markers

## Testing

- Test files: `__tests__/<name>.test.js` (JavaScript, not TypeScript)
- Use `@jest/globals` imports: `import { describe, test, expect } from '@jest/globals'`
- ESM mode: Jest runs with `--experimental-vm-modules`
- Template test files (`_template/`) are excluded from root Jest via `testPathIgnorePatterns`

## Git & Version Control

- **Commit messages:** Conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `chore:`)
- **Branching:** Feature branches → PR → merge to `main`
- **Never push directly to main**
- **Changelogs:** Add unreleased notes to `changelogs/unreleased.md`

## What NOT to Do

- ❌ Don't add `require()` calls — ESM only
- ❌ Don't add a build step to the CLI — it must run directly via `npx`
- ❌ Don't use `ts-node` — use `tsx` for TypeScript execution
- ❌ Don't put personal information in any file (emails, phone numbers)
- ❌ Don't throw raw `Error` in template scripts — use `DsaLabError`
- ❌ Don't remove `// @version` stamps from template scripts
