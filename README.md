# Practice Sudoku

A fully interactive Sudoku game built with React, Vite, and **Tailwind CSS**. This project features dynamic puzzle generation on the fly (so you never run out of puzzles!), real-time move validation, and a beautiful UI.

## Features

- **Dynamic Puzzles**: Automatically generates unique, solvable Sudoku puzzles on the fly for Easy, Medium, and Hard difficulties.
- **Real-Time Validation**: Instantly highlights invalid moves (self-exclusion checked) with a red border.
- **Smart Hint System**: Selects a random incorrect or empty cell and reveals the correct answer for a few seconds.
- **Interactive UI**: Click the badge on any filled cell to trigger a pulse animation on all matching numbers across the board!
- **Premium Design**: Fully styled from the ground up using Tailwind CSS for a responsive, modern aesthetic.

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

### Deployment (GitHub Pages)

This project is configured with a deployment script using the `gh-pages` package. To build the app and push the `dist` folder to the `gh-pages` branch, simply run:

```sh
npm run deploy
```

## AI Agents

This repository includes a dedicated instruction file for AI coding assistants. If you are an AI agent, please read the **[`AGENTS.md`](./AGENTS.md)** file in the root directory before making any changes.

---

This project was bootstrapped with [Vite](https://vitejs.dev/) and [React](https://react.dev/).
