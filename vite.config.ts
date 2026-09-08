import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
	base: "/practice-sudoku/",
	plugins: [react()],
	test: {
		environment: "node",
		include: ["src/**/*.test.{js,jsx,ts,tsx}"],
	},
});
