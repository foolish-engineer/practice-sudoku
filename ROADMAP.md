# Practice Sudoku — Engineering Roadmap

> Goal: Bring this project to FAANG engineering standards, one item at a time.
> Each phase is ordered by impact. Complete phases in order.

---

## Phase 1 — Foundation (CI/CD & Code Quality)

> Prerequisite layer. Sets up the safety net before anything else.

- [x] **TypeScript** — migrate `App.jsx` → `App.tsx`, define types (`Cell`, `Board`, `Difficulty`, `HintCell`), install `typescript`
- [ ] **Code coverage** — install `@vitest/coverage-v8`, add `npm run test:coverage`, enforce 80%+ threshold in CI
- [x] **Pre-commit hook** — Husky + lint-staged: Biome auto-fix on staged files before every commit
- [x] **Pre-push hook** — Husky: runs full `npm run test` suite before every push
- [ ] **GitHub Actions CI** — on every push and PR: lint → test → coverage threshold → build
- [ ] **GitHub Actions CD** — on merge to `main`: auto-deploy to GitHub Pages (replaces manual `npm run deploy`)

---

## Phase 2 — Quality & Reliability

> Prevents regressions and improves correctness.

- [ ] **Error Boundary** — wrap the app in a React `ErrorBoundary` so solver failures show a friendly message instead of a blank screen
- [ ] **Web Worker** — move `generatePuzzle` + helpers into a `puzzleWorker.js` Web Worker to unblock the UI thread; add a loading spinner while generating
- [ ] **React performance** — memoize `completedDigits` and cell class computations with `useMemo`; wrap handlers with `useCallback`
- [ ] **E2E tests (Playwright)** — test rendered UI: typing in cells, red border on invalid, hint highlight, puzzle completion, new game buttons

---

## Phase 3 — Accessibility (WCAG 2.1 AA)

> Required for any serious production app. Often a legal requirement.

- [ ] **ARIA grid roles** — add `role="grid"`, `role="row"`, `role="gridcell"` to the board structure
- [ ] **`aria-invalid`** — set on cells with invalid user input
- [ ] **`aria-label`** — describe each cell's position (e.g., "Row 3, Column 5, value 7")
- [ ] **Keyboard navigation** — arrow keys to move between cells; `Delete`/`Backspace` to clear a cell
- [ ] **Color contrast** — verify hint yellow (`#fff59d`) and red border meet WCAG AA contrast ratios; supplement with icons/labels if needed
- [ ] **Focus management** — programmatically move focus after hint fills a cell

---

## Phase 4 — Core Missing Features

> Expected functionality that serious Sudoku players need.

- [ ] **Timer** — count-up timer per puzzle; pauses on tab blur; stops and displays on completion
- [ ] **Undo / Redo** — `Ctrl+Z` / `Ctrl+Shift+Z` keyboard shortcuts + UI buttons; does not affect pre-filled cells
- [ ] **Pencil marks (notes mode)** — toggle between "value" and "notes" input mode; render small candidate numbers inside cells
- [ ] **Check button** — validate the entire board at once; highlight all incorrect cells simultaneously
- [ ] **Auto-save to `localStorage`** — persist board, timer, and difficulty so progress survives page refresh

---

## Phase 5 — UX & Polish

> Differentiates a good product from a great one.

- [ ] **Dark mode** — Tailwind `dark:` variants, toggled by a button + `prefers-color-scheme` system default
- [ ] **Mobile number pad** — custom 1–9 tap grid rendered below the board on touch devices (replaces keyboard typing)
- [ ] **Keyboard shortcuts** — `H` = hint, `N` = new game, `1–9` = fill focused cell, `0`/`Del` = clear cell
- [ ] **Statistics dashboard** — track games played, win rate, and best time per difficulty (stored in `localStorage`)
- [ ] **Difficulty badge** — show selected difficulty and remaining empty cell count as a live subtitle below the board

---

## Phase 6 — Distribution & Discoverability

> Makes the project production-grade and shareable.

- [ ] **Conventional Commits** — enforce commit message format (`feat:`, `fix:`, `chore:`) with `commitlint` + Husky `commit-msg` hook
- [ ] **`CHANGELOG.md`** — auto-generated from Conventional Commits using `standard-version` or `release-it`
- [ ] **Open Graph meta tags** — rich link previews when sharing on Slack, Twitter, LinkedIn (`og:title`, `og:image`, `og:description`)
- [ ] **PWA + Offline support** — `manifest.json`, Vite PWA plugin, service worker caching so the game works offline and is installable

---

## Progress Tracker

| Phase | Items | Done |
|---|---|---|
| Phase 1 — Foundation | 6 | 3 |
| Phase 2 — Quality & Reliability | 4 | 0 |
| Phase 3 — Accessibility | 6 | 0 |
| Phase 4 — Core Features | 5 | 0 |
| Phase 5 — UX & Polish | 5 | 0 |
| Phase 6 — Distribution | 4 | 0 |
| **Total** | **30** | **3** |
