# Practice Sudoku - Agent Instructions

Welcome to the **Practice Sudoku** repository. Read this file carefully before making any changes.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | React 19 (via Vite 8) + **TypeScript** |
| Styling | **Tailwind CSS v3** |
| Linter/Formatter | Biome |
| Deployment | GitHub Pages via `gh-pages` npm package |

---

## Project Structure

```
practice-sudoku/
├── src/
│   ├── core/                  # Pure domain logic (zero React dependencies)
│   │   ├── sudoku.ts          # isValid, solveSudoku, countSolutions, generateSolvedBoard, generatePuzzle
│   │   └── sudoku.test.ts     # Colocated Vitest unit test suite
│   ├── types/                 # Domain type definitions
│   │   └── sudoku.ts          # Cell, Board, SolvedBoard, Difficulty, LevelLabel, HintCell
│   ├── hooks/                 # Custom React hooks (state & business logic)
│   │   └── useSudokuGame.ts   # Board state, timers, validation, and hint orchestration
│   ├── components/            # Focused presentation components
│   │   ├── GameControls.tsx   # Difficulty selector buttons
│   │   ├── SudokuBoard.tsx    # 9×9 grid container
│   │   ├── SudokuCell.tsx     # Single cell input + highlight badge button
│   │   └── CompletedDigits.tsx # 1-9 completion pills
│   ├── utils/                 # Cross-cutting utilities
│   │   └── cn.ts              # Class name merger helper
│   ├── App.tsx                # Composition root shell
│   ├── index.css              # Tailwind directives only
│   ├── main.tsx               # React entry point with runtime root assertion
│   ├── vite-env.d.ts          # Vite client ambient types
│   └── assets/                # Static assets (e.g. react logo)
├── public/                    # Public assets served as-is
├── tailwind.config.js         # Tailwind v3 config with design tokens & animations
├── vite.config.ts             # Vite + Vitest config (base: "/practice-sudoku/")
├── tsconfig.json              # Root project references config
├── tsconfig.app.json          # App TS config (src/)
├── tsconfig.node.json         # Node TS config (vite.config.ts)
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

### State Management (inside `App` component)

| State | Type | Description |
|---|---|---|
| `initialBoard` | `number[][]` | The puzzle as generated — used to determine which cells are locked (pre-filled). |
| `board` | `number\|string[][]` | Current live board state with user edits. Empty cells are `""`. |
| `solvedBoard` | `number[][]` | The complete solution — used for hint logic and win detection. |
| `hintCell` | `{row, col} \| null` | Coordinates of the cell currently highlighted as a hint. Cleared after 6 seconds via `hintTimerRef`. |
| `level` | `string` | Display label: `"Easy"`, `"Medium"`, or `"Hard"`. |
| `animatingValue` | `number \| null` | When set, all cells matching this value get the pulse animation. Cleared after 3 seconds via `animTimerRef`. |
| `message` | `string` | Status message shown below the board (e.g., `"Invalid move!"`). |

### Key Handlers

- **`handleChange(row, col, val)`** — Updates `board` state, runs `isValid` to set `message`. Only accepts `""` or `[1-9]`.
- **`handleNewSudoku(difficulty)`** — Generates a new puzzle, resets all state.
- **`handleHint()`** — Finds all cells that differ from `solvedBoard`, picks a random one, fills it in, and sets `hintCell` for 6 seconds.
- **`handleAnimateSame(val)`** — Sets `animatingValue` to animate all matching cells for 3 seconds.

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
4. **Vite base path**: `vite.config.js` sets `base: "/practice-sudoku/"`. This is required for GitHub Pages and must not be changed.
5. **No state reset on animation**: `animatingValue` only resets via a `setTimeout`. Do not reset it during board updates — let the timer do it.
6. **`countSolutions` is intentionally slow for hard puzzles**: It uses backtracking with an early-exit at `limit=2`. This is acceptable; do not replace it with a lookup table or skip it.

---

## Workflow Commands

```sh
npm run dev       # Start local dev server (Vite HMR)
npm run build     # Production build to dist/
npm run deploy    # Build + push to gh-pages branch on GitHub
npm run lint      # Run Biome linter
npm run lint:fix  # Auto-fix lint issues with Biome
npm run format    # Format code with Biome
```

> **Deployment note**: Always use `npm run deploy`. Do not push to the `gh-pages` branch manually via git.

