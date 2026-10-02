# Practice Sudoku - Agent Instructions

Welcome to the **Practice Sudoku** repository. Read this file carefully before making changes.

> **CRITICAL AGENT RULE**: Always run and pass lint (`npm run lint`), format (`npm run format`), unit tests (`npm run test`), and E2E tests (`npm run test:e2e`) after any code changes. Never consider a task complete without passing these four gates.

---

## Technology Stack

- **Framework**: React 19 + TypeScript (via Vite 8, base path `/practice-sudoku/`)
- **Styling**: Tailwind CSS v3 (utilities only, no inline styles or custom CSS)
- **Linter & Formatter**: Biome
- **Unit Testing**: Vitest + `@vitest/coverage-v8` (Node environment, 80%+ threshold)
- **E2E Testing**: Playwright (port 5174, system Chrome, 3 parallel workers)
- **CI/CD**: GitHub Actions → GitHub Pages (automated deploy on push to `main`)

---

## Project Structure

```
practice-sudoku/
├── .github/workflows/ci.yml   # CI (lint, test, build) + CD (GitHub Pages)
├── e2e/sudoku.spec.ts         # Playwright E2E suite
├── src/
│   ├── core/                  # Pure algorithms & logic (zero UI coupling)
│   │   ├── sudoku.ts          # Puzzle generation, backtracking solver, validation
│   │   └── stats.ts           # Game stats tracking, calculations & persistence
│   ├── types/                 # Shared domain types (sudoku.ts)
│   ├── hooks/                 # Business logic hooks (useSudokuGame.ts, useTheme.ts)
│   ├── workers/               # Web Worker for off-thread puzzle generation
│   ├── components/            # Focused presentational components
│   │   ├── ErrorBoundary.tsx  # Graceful solver failure recovery
│   │   ├── GameControls.tsx   # Difficulty selectors
│   │   ├── SudokuBoard.tsx    # 9×9 grid container & loading overlay
│   │   ├── SudokuCell.tsx     # Cell input, notes, and badge highlight
│   │   ├── CompletedDigits.tsx# Digits 1-9 completion indicators
│   │   └── StatsModal.tsx     # Statistics modal dialog
│   ├── utils/                 # cn class merger & formatTime helper
│   ├── App.tsx                # Composition root shell
│   └── main.tsx               # React entry point
├── playwright.config.ts       # Runs Vite on port 5174
├── tailwind.config.js         # Design tokens & pulse animation
├── vite.config.ts             # Base path: "/practice-sudoku/"
└── ROADMAP.md                 # Engineering roadmap & progress tracker
```

---

## Domain & Architectural Invariants

1. **Board Types**:
   - `board`: `(number | "")[][]` (live player grid; empty cells are `""`).
   - `initialBoard`: `(number | "")[][]` (starting clues; determines disabled/locked cells).
   - `solvedBoard`: `number[][]` (complete solution; all cells are digits `1–9`).
2. **`isValid()` Self-Exclusion**: Checks if a digit is valid in a row, column, and 3×3 box while excluding the target cell itself so existing entries do not invalidate themselves.
3. **Solver Zero-Empty Convention**: `solveSudoku` and `countSolutions` represent empty cells internally as `0`, not `""`.
4. **Target Clue Counts**: Easy = 25, Medium = 21, Hard = 19 clues remaining.
5. **Web Worker Off-Thread Generation**: Puzzle generation runs in `puzzleWorker.ts`. `useSudokuGame` uses a `requestIdRef` to discard responses from cancelled/stale generation requests.
6. **Statistics Lifecycle**: A game is counted in `gamesPlayed` only upon the user's first move (cell input, note, or hint). Abandoning an untouched new puzzle does not penalize stats.

---

## Interaction & Keyboard Shortcuts

- **Cell Shortcuts**:
  - `1–9`: fills focused cell.
  - `0`, `Delete`, `Backspace`: clears focused cell.
  - Arrow keys: navigate between cells.
- **Global Shortcuts**:
  - `H`: Get Hint (fills a random unsolved cell and focuses it).
  - `N`: New Game (generates a puzzle at current difficulty).
  - `C`: Check Puzzle (highlights incorrect cells for 3s).
  - `Ctrl+Z` / `Cmd+Z`: Undo.
  - `Ctrl+Shift+Z` / `Cmd+Shift+Z` / `Ctrl+Y`: Redo.
  - `Escape`: Closes `StatsModal`.
- **Input Guard**: Global shortcuts (`H`, `N`, `C`) check `e.target` and are ignored when focused in an `<input>`, `<textarea>`, or contenteditable element.

---

## Styling Conventions

- **Tailwind CSS v3 utilities exclusively**. Never add vanilla CSS files or `style={{}}` inline objects.
- `index.css` contains only `@tailwind` directives.
- `tailwind.config.js` defines the `animate-pulse-highlight` keyframe animation for same-digit highlighting.
- Tailwind's `!` modifier (e.g. `!border-red-500`, `!bg-[#fff59d]`) is intentionally used for visual state overrides (invalid inputs, hints).

---

## Critical Gotchas

1. **Vite Base Path**: `vite.config.ts` sets `base: "/practice-sudoku/"`. Required for GitHub Pages; do not change.
2. **E2E Port**: Playwright runs on `--port 5174` (not `5173`) to prevent collisions with other local dev servers.
3. **Vitest Node Environment**: `vite.config.ts` uses `environment: "node"`. Tests touching `localStorage` must provide an in-memory storage stub on `globalThis.localStorage`.
4. **No Manual Deploys**: Deployments are automated via GitHub Actions on push to `main`. Never add manual deployment scripts.

---

## Workflow Commands

```sh
npm run dev            # Start local dev server (Vite HMR)
npm run build          # Production build to dist/
npm run typecheck      # TypeScript type-check (tsc -b)
npm run lint           # Run Biome linter
npm run lint:fix       # Auto-fix lint issues with Biome
npm run format         # Format code with Biome
npm run test           # Run unit tests (Vitest)
npm run test:coverage  # Unit tests with V8 coverage report (80%+ threshold)
npm run test:e2e       # Run Playwright E2E tests (system Chrome)
```
