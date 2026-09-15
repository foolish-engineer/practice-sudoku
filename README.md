# Practice Sudoku

A fully interactive Sudoku game built with React, Vite, and **Tailwind CSS**. This project features dynamic puzzle generation on the fly (so you never run out of puzzles!), real-time move validation, and a beautiful UI.

## Features

- **Dynamic Puzzles**: Automatically generates unique, solvable Sudoku puzzles on the fly for Easy, Medium, and Hard difficulties — powered by a Web Worker so the UI never freezes.
- **Real-Time Validation**: Instantly highlights invalid moves (self-exclusion checked) with a red border.
- **Smart Hint System**: Selects a random empty cell and reveals the correct answer, highlighted in yellow for 6 seconds.
- **Interactive UI**: Click the badge on any filled cell to trigger a pulse animation on all matching numbers across the board.
- **Premium Design**: Fully styled using Tailwind CSS for a responsive, modern aesthetic.
- **Error Boundary**: Graceful fallback UI if the puzzle solver ever throws unexpectedly.

## Getting Started

### Development

1. Install dependencies:
   ```sh
   npm install
   ```

2. Start the development server:
   ```sh
   npm run dev
   ```

### Testing

```sh
npm run test             # Unit tests (Vitest)
npm run test:coverage    # Unit tests with coverage report
npm run test:e2e         # E2E tests (Playwright, requires Chrome)
npm run test:e2e:ui      # Playwright UI mode
```

### Deployment

Deployment is fully automated via **GitHub Actions**. Every push to `main` that passes all CI checks (lint → unit tests → E2E tests) is automatically deployed to GitHub Pages. No manual step required.

> **Repo Settings required (one-time):** Set **Settings → Pages → Source → GitHub Actions**.

## AI Agents

This repository includes a dedicated instruction file for AI coding assistants. If you are an AI agent, please read the **[`AGENTS.md`](./AGENTS.md)** file in the root directory before making any changes.

---

This project was bootstrapped with [Vite](https://vitejs.dev/) and [React](https://react.dev/).
