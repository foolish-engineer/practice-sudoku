import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration.
 * Uses system-installed Google Chrome so no browser download is needed.
 * Runs Vite on port 5174 to avoid collisions with other dev servers on 5173.
 */
export default defineConfig({
	testDir: "./e2e",
	// Maximum time each test can run
	timeout: 30_000,
	// Maximum time for expect() assertions
	expect: { timeout: 10_000 },
	// Re-run failed tests once on CI
	retries: process.env.CI ? 1 : 0,
	// Parallel workers: 3 locally, 1 on CI for determinism
	workers: process.env.CI ? 1 : 3,
	// Reporters
	reporter: process.env.CI
		? [["github"], ["html", { open: "never" }]]
		: [["list"], ["html", { open: "never" }]],

	use: {
		// Base URL — port 5174 is dedicated to E2E to avoid port conflicts
		baseURL: "http://localhost:5174",
		// Collect traces on retry for debugging
		trace: "on-first-retry",
		// Screenshot on failure
		screenshot: "only-on-failure",
	},

	projects: [
		{
			// Use installed system Chrome — no playwright browser download required
			name: "chromium",
			use: { ...devices["Desktop Chrome"], channel: "chrome" },
		},
	],

	// Start a dedicated Vite dev server on port 5174 for E2E isolation.
	// Locally, reuse an existing server if one is already running (e.g. after --ui).
	// On CI, always start a fresh server to guarantee isolation.
	webServer: {
		command: "npm run dev -- --port 5174",
		url: "http://localhost:5174",
		reuseExistingServer: !process.env.CI,
		timeout: 30_000,
	},
});
