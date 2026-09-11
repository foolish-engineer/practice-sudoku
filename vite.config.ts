import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
	base: "/practice-sudoku/",
	plugins: [react()],
	test: {
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
