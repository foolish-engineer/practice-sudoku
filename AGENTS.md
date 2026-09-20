# Practice Sudoku - Agent Instructions

Welcome to the **Practice Sudoku** repository. Read this file carefully before making any changes.

> **CRITICAL AGENT RULE**: You MUST always check lint (`npm run lint`), format (`npm run format`), unit tests (`npm run test`), and E2E tests (`npm run test:e2e`) after making any code changes to verify they pass completely. Do not assume your code works without running these verifications.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 19 (via Vite 8) + **TypeScript** |
| Styling | **Tailwind CSS v3** |
| Linter/Formatter | Biome |
| Testing (unit) | Vitest + `@vitest/coverage-v8` |
| Testing (E2E) | Playwright (system Chrome) |
| Deployment | GitHub Actions → GitHub Pages (`actions/deploy-pages`) |

---

## Project Structure

```
practice-sudoku/
├── .github/
│   └── workflows/
│       └── ci.yml             # CI (lint, test, build) + CD (deploy to GitHub Pages)
├── e2e/
│   └── sudoku.spec.ts         # Playwright E2E test suite (10 tests, 3 workers)
├── src/
│   ├── core/                  # Pure domain logic (zero React dependencies)
│   │   ├── sudoku.ts          # isValid, solveSudoku, countSolutions, generateSolvedBoard, generatePuzzle
│   │   └── sudoku.test.ts     # Colocated Vitest unit test suite
│   ├── types/                 # Domain type definitions
│   │   └── sudoku.ts          # Cell, Board, SolvedBoard, Difficulty, LevelLabel, HintCell
│   ├── hooks/                 # Custom React hooks (state & business logic)
│   │   └── useSudokuGame.ts   # Board state, timers, validation, and hint orchestration
│   ├── workers/               # Web Worker for off-thread puzzle generation
│   │   ├── puzzleWorker.ts    # Worker script — handles GENERATE_PUZZLE messages
│   │   └── puzzleWorker.test.ts # Type contract tests for the worker message shape
│   ├── components/            # Focused presentation components
│   │   ├── ErrorBoundary.tsx  # React error boundary — catches solver failures gracefully
│   │   ├── GameControls.tsx   # Difficulty selector buttons
│   │   ├── SudokuBoard.tsx    # 9×9 grid container + generating overlay
│   │   ├── SudokuCell.tsx     # Single cell input + highlight badge button
│   │   └── CompletedDigits.tsx # 1-9 completion pills
│   ├── utils/                 # Cross-cutting utilities
│   │   └── cn.ts              # Class name merger helper
│   ├── App.tsx                # Composition root shell
│   ├── index.css              # Tailwind directives only
│   ├── main.tsx               # React entry point with runtime root assertion
│   └── vite-env.d.ts          # Vite client ambient types
├── public/                    # Public assets served as-is
├── playwright.config.ts       # Playwright config (port 5174, system Chrome, 3 workers)
├── tailwind.config.js         # Tailwind v3 config with design tokens & animations
├── vite.config.ts             # Vite + Vitest config (base: "/practice-sudoku/")
├── tsconfig.json              # Root project references config
├── tsconfig.app.json          # App TS config (src/)
├── tsconfig.node.json         # Node TS config (vite.config.ts, playwright.config.ts, e2e/)
├── index.html                 # HTML entry point
├── package.json
└── AGENTS.md                  # This file
```

---

## Code Architecture

### Layered Architecture
The codebase follows standard FAANG clean architecture:
- **`core/`**: Pure algorithms with zero UI coupling. Fully tested in isolation via colocated test files.
- **`types/`**: Single source of truth for domain data structures.
- **`hooks/`**: Encapsulates stateful game mechanics, timer lifecycles, and event handlers.
- **`workers/`**: Web Worker for off-thread puzzle generation. Communicates via `postMessage` / `onmessage`.
- **`components/`**: Pure presentational React components using Tailwind CSS design tokens.
- **`App.tsx`**: Composition shell bringing the layers together.

### Pure Functions (`src/core/sudoku.ts`)

| Function | Description |
|---|---|
| `isValid(board, row, col, value)` | Checks if placing `value` at `[row][col]` is valid. Uses **self-exclusion** — ignores the current cell's own value when checking conflicts, so existing entries don't invalidate themselves. |
| `countSolutions(board, limit=2)` | Backtracking solver that counts solutions up to `limit`. Used during puzzle generation to verify uniqueness. Returns early once `limit` is reached. |
| `solveSudoku(board)` | Returns a fully solved board. Uses `0` internally (not `""`). Input board uses `""` for empty cells. |
| `generateSolvedBoard()` | Seeds the three diagonal 3×3 boxes with random numbers, then calls `solveSudoku` to fill the rest. Produces a random, valid completed board. |
| `generatePuzzle(difficulty)` | Calls `generateSolvedBoard()`, then randomly removes cells one at a time, only committing a removal if uniqueness is maintained (`countSolutions === 1`). Stops when the target clue count is reached. Returns `{ puzzleBoard, solvedBoard }`. |

### Difficulty & Clue Counts
| Difficulty | Clues Kept |
|---|---|
| Easy | 25 |
| Medium | 21 |
| Hard | 19 |

### Web Worker (`src/workers/puzzleWorker.ts`)

Puzzle generation runs in a dedicated Web Worker to keep the main thread unblocked. The hook (`useSudokuGame`) sends a `GENERATE_PUZZLE` message with a `difficulty` and an `id`. The worker responds with `{ puzzleBoard, solvedBoard, id }`. A `requestIdRef` in the hook guards against stale responses from cancelled requests.

### State Management (`src/hooks/useSudokuGame.ts`)

| State | Type | Description |
|---|---|---|
| `initialBoard` | `number[][]` | The puzzle as generated — used to determine which cells are locked (pre-filled). |
| `board` | `number\|string[][]` | Current live board state with user edits. Empty cells are `""`. |
| `solvedBoard` | `number[][]` | The complete solution — used for hint logic and win detection. |
| `notes` | `string[][]` | Candidate pencil marks typed into empty cells by the user. |
| `elapsed` | `number` | Seconds elapsed since the current puzzle started. |
| `past`/`future` | `HistoryState[]` | Stacks tracking board and notes state for Undo/Redo operations. |
| `hintCell` | `{row, col} \| null` | Coordinates of the cell currently highlighted as a hint. Cleared after 6 seconds via `hintTimerRef`. |
| `checkingCells` | `[number, number][]` | Coordinates of user-filled cells that don't match the solution. Highlighted for 3 seconds. |
| `level` | `string` | Display label: `"Easy"`, `"Medium"`, or `"Hard"`. |
| `animatingValue` | `number \| null` | When set, all cells matching this value get the pulse animation. Cleared after 3 seconds via `animTimerRef`. |
| `message` | `string` | Status message shown below the board (e.g., `"Invalid move!"`). |
| `isGenerating` | `boolean` | True while the Web Worker is running — disables all controls and shows the overlay. |

### Key Handlers

- **`handleChange(row, col, val)`** — Updates `board` state, handles note clearing, pushes to undo history, and runs `isValid` to set `message`.
- **`handleNotesChange(row, col, notes)`** — Updates candidate `notes` for a specific cell and pushes to undo history.
- **`handleNewSudoku(difficulty)`** — Posts a `GENERATE_PUZZLE` message to the worker, sets `isGenerating: true`, resets all state.
- **`handleHint()`** — Finds all cells that differ from `solvedBoard`, picks a random one, fills it in, and sets `hintCell` for 6 seconds.
- **`handleCheck()`** — Compares the user's `board` against `solvedBoard` and temporarily populates `checkingCells` to highlight incorrect entries.
- **`handleAnimateSame(val)`** — Sets `animatingValue` to animate all matching cells for 3 seconds.
- **`handleUndo()` / `handleRedo()`** — Traverses the `past` and `future` stacks to revert or reapply board and note states.

---

## Styling Conventions (Strict)

- **Tailwind CSS v3 utilities only**. Do not add vanilla CSS files or `style={{}}` inline objects. Use `className` with Tailwind classes exclusively.
- `index.css` contains only `@tailwind` directives. **Do not add custom CSS here**.
- `tailwind.config.js` has a custom `pulseHighlight` keyframe animation, accessible as `animate-pulse-highlight`. Do not remove it.
- Tailwind's `!important` modifier (e.g., `!border-red-500`) is intentionally used for conditional overrides (invalid cells, hint cells). This is by design.

### Key Visual States

| State | Classes Applied |
|---|---|
| Default cell | `w-[54px] h-[54px] border border-[#bbb] bg-[#f9f9f9]` |
| Locked/pre-filled cell | `disabled:bg-[#e0e0e0] disabled:font-bold` |
| Block border (every 3rd) | `border-r-[3px] border-r-[#333]` etc. |
| Hint cell | `!bg-[#fff59d]` (yellow) |
| Invalid user cell | `!border-2 !border-red-500 !bg-[#fff59d]` |
| Animating cell | `animate-pulse-highlight z-[5] relative` |
| Badge (top-right of filled cell) | `absolute top-[3px] right-[3px] w-[14px] h-[14px] rounded-full` |

---

## Important Gotchas

1. **`isValid` uses self-exclusion**: When checking validity, the cell's own current value is excluded from the conflict check. Never simplify this to a naive check — it will break real-time validation for pre-filled cells.
2. **Board values are mixed types**: `initialBoard` cells are either a `number` or `""`. `solvedBoard` cells are always `number`. `board` cells are `number | ""`. Always use `Number(cell)` when comparing.
3. **`solveSudoku` uses `0` for empty**: Internally it converts `""` → `0`. Do not pass a board with `""` directly into it or compare with `""` inside it.
4. **Vite base path**: `vite.config.ts` sets `base: "/practice-sudoku/"`. This is required for GitHub Pages and must not be changed.
5. **No state reset on animation**: `animatingValue` only resets via a `setTimeout`. Do not reset it during board updates — let the timer do it.
6. **`countSolutions` is intentionally slow for hard puzzles**: It uses backtracking with an early-exit at `limit=2`. This is acceptable; do not replace it with a lookup table or skip it.
7. **Worker stale-response guard**: `requestIdRef` in `useSudokuGame` increments on every new puzzle request. The worker response is ignored if its `id` doesn't match the current ref. Never remove this guard.
8. **E2E uses port 5174**: `playwright.config.ts` runs Vite on `--port 5174` (not 5173) to avoid collisions with other local dev servers. Do not change this port without updating the config.
9. **No manual deploy**: `npm run deploy` has been removed. Deployment is fully automated via GitHub Actions on every push to `main`. Use `git push` to deploy.

---

## Workflow Commands

```sh
npm run dev            # Start local dev server (Vite HMR)
npm run build          # Production build to dist/
npm run preview        # Preview the production build locally

npm run typecheck      # TypeScript type-check (all tsconfig projects)
npm run lint           # Run Biome linter
npm run lint:fix       # Auto-fix lint issues with Biome
npm run format         # Format code with Biome

npm run test           # Run unit tests (Vitest)
npm run test:watch     # Unit tests in watch mode
npm run test:coverage  # Unit tests with V8 coverage report
npm run test:e2e       # Run Playwright E2E tests (3 parallel workers)
npm run test:e2e:ui    # Playwright interactive UI mode
npm run test:e2e:headed  # E2E tests in headed Chrome (visible browser)
npm run test:e2e:report  # Open last Playwright HTML report
```

> **Deployment**: Push to `main`. GitHub Actions runs lint → unit tests → E2E tests → deploy. All three gates must pass.
