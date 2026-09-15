import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
	base: "/practice-sudoku/",
	plugins: [react()],
	test: {
		// Puzzle generation uses a backtracking solver that can be slow on CI runners.
		// 60s covers the worst-case hard-difficulty generation without flaking.
		testTimeout: 60_000,
		environment: "node",
		include: ["src/**/*.test.{js,jsx,ts,tsx}"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["src/core/**/*.ts"],
			thresholds: {
				statements: 80,
				branches: 80,
				functions: 80,
				lines: 80,
			},
		},
	},
});
