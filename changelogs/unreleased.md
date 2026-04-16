### ✨ Features
- 

### 🐞 Bug Fixes
- Fixed dashboard test action crash — added `--experimental-vm-modules` flag for ESM compatibility and updated `--testPathPattern` → `--testPathPatterns` for Jest 30 (#4)
- Fixed remaining unicode escape sequences (`\ud83d\udcda`, `\u2026`, `\u2022`, `\u2630`) in `page.html` — now renders real emoji characters (#4)
- Updated docs (`FILE_REFERENCE.md`, `HOW_IT_WORKS.md`) to reflect corrected Jest command
- Added regression tests to prevent future unicode escape and Jest API regressions
