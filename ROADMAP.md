# Practice Sudoku — Engineering Roadmap

> Goal: Bring this project to FAANG engineering standards, one item at a time.
> Each phase is ordered by impact. Complete phases in order.

---

## Phase 1 — Foundation (CI/CD & Code Quality)

> Prerequisite layer. Sets up the safety net before anything else.

- [ ] **GitHub Actions CI pipeline** — lint + test + build runs on every push and PR
- [ ] **Code coverage** — install `@vitest/coverage-v8`, add `npm run test:coverage`, enforce 80%+ threshold in CI
- [ ] **Pre-commit hooks** — Husky + lint-staged to run Biome auto-fix on staged files before every commit
- [ ] **TypeScript** — migrate `App.jsx` → `App.tsx`, define types (`Cell`, `Board`, `Difficulty`, `HintCell`), install `typescript`

---

## Phase 2 — Quality & Reliability

> Prevents regressions and improves correctness.

- [ ] **Error Boundary** — wrap the app in a React `ErrorBoundary` so solver failures show a friendly message instead of a blank screen
- [ ] **React performance** — memoize `completedDigits` and cell class computations with `useMemo`; wrap handlers with `useCallback`
- [ ] **Web Worker** — move `generatePuzzle` + helpers into a `puzzleWorker.js` Web Worker to unblock the UI thread; add a loading spinner while generating
- [ ] **E2E tests (Playwright)** — test rendered UI: typing in cells, red border on invalid, hint highlight, puzzle completion, new game buttons

---

## Phase 3 — Accessibility (WCAG 2.1 AA)

> Required for any serious production app. Often a legal requirement.

- [ ] **ARIA grid roles** — add `role="grid"`, `role="row"`, `role="gridcell"` to the board structure
- [ ] **`aria-invalid`** — set on cells with invalid user input
- [ ] **`aria-label`** — describe each cell's position (e.g., "Row 3, Column 5")
- [ ] **Keyboard navigation** — arrow keys to move between cells; `Delete`/`Backspace` to clear
- [ ] **Color contrast** — verify hint yellow (`#fff59d`) and red border meet WCAG AA contrast ratios; add text labels if needed
- [ ] **Focus management** — ensure focus moves correctly after hint fills a cell

---

## Phase 4 — Core Missing Features

> Expected functionality that serious Sudoku players need.

- [ ] **Timer** — count-up timer per puzzle; shows elapsed time; stops on completion
- [ ] **Undo / Redo** — keyboard shortcut `Ctrl+Z` / `Ctrl+Shift+Z` and UI buttons
- [ ] **Pencil marks (notes mode)** — toggle between "value" and "notes" mode; show small candidate numbers in cells
- [ ] **Check button** — validate the entire current board state; highlight all incorrect cells at once
- [ ] **Auto-save to `localStorage`** — persist board state so progress survives page refresh

---

## Phase 5 — UX & Polish

> Differentiates a good product from a great one.

- [ ] **Dark mode** — Tailwind `dark:` class variants, system preference detection via `prefers-color-scheme`
- [ ] **Mobile number pad** — custom 1–9 tap pad rendered below the board on small screens (replaces typing)
- [ ] **Keyboard shortcuts** — `H` = hint, `N` = new game, `1–9` = enter number in focused cell
- [ ] **Statistics panel** — track games played, win rate, best time per difficulty (stored in `localStorage`)
- [ ] **Difficulty progression** — show how many clues remain and a difficulty badge per puzzle

---

## Phase 6 — Distribution & Discoverability

> Makes the project production-grade and shareable.

- [ ] **Open Graph meta tags** — rich previews when sharing on Slack, Twitter, LinkedIn
- [ ] **PWA + Offline support** — `manifest.json`, service worker, installable via browser
- [ ] **`CHANGELOG.md`** — maintained changelog using Conventional Commits format
- [ ] **Conventional Commits** — enforce commit message format with `commitlint` + Husky
- [ ] **Automated deployment** — GitHub Actions deploys to GitHub Pages on every merge to `main`

---

## Progress Tracker

| Phase | Items | Done |
|---|---|---|
| Phase 1 — Foundation | 4 | 0 |
| Phase 2 — Quality & Reliability | 4 | 0 |
| Phase 3 — Accessibility | 6 | 0 |
| Phase 4 — Core Features | 5 | 0 |
| Phase 5 — UX & Polish | 5 | 0 |
| Phase 6 — Distribution | 5 | 0 |
| **Total** | **29** | **0** |
