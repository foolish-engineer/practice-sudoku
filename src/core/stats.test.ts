import { beforeEach, describe, expect, test } from "vitest";
import {
	createDefaultDifficultyStats,
	createDefaultStats,
	DEFAULT_STATS,
	getOverallStats,
	getWinRate,
	loadStats,
	recordGameStart,
	recordGameWin,
	resetStats,
	STATS_STORAGE_KEY,
	saveStats,
} from "./stats";

class MemoryStorage {
	private store = new Map<string, string>();
	get length() {
		return this.store.size;
	}
	clear(): void {
		this.store.clear();
	}
	getItem(key: string): string | null {
		return this.store.get(key) ?? null;
	}
	key(index: number): string | null {
		return Array.from(this.store.keys())[index] ?? null;
	}
	removeItem(key: string): void {
		this.store.delete(key);
	}
	setItem(key: string, value: string): void {
		this.store.set(key, String(value));
	}
}

describe("Sudoku Statistics Core", () => {
	beforeEach(() => {
		globalThis.localStorage = new MemoryStorage() as unknown as Storage;
	});

	test("createDefaultStats initializes all difficulties with 0s and null bestTime", () => {
		const stats = createDefaultStats();
		expect(stats.easy).toEqual({ gamesPlayed: 0, gamesWon: 0, bestTime: null });
		expect(stats.medium).toEqual({
			gamesPlayed: 0,
			gamesWon: 0,
			bestTime: null,
		});
		expect(stats.hard).toEqual({ gamesPlayed: 0, gamesWon: 0, bestTime: null });
	});

	test("loadStats returns default stats when localStorage is empty", () => {
		const stats = loadStats();
		expect(stats).toEqual(DEFAULT_STATS);
	});

	test("loadStats safely parses valid localStorage data", () => {
		const data = {
			easy: { gamesPlayed: 5, gamesWon: 4, bestTime: 120 },
			medium: { gamesPlayed: 2, gamesWon: 1, bestTime: 300 },
			hard: { gamesPlayed: 0, gamesWon: 0, bestTime: null },
		};
		localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(data));

		const loaded = loadStats();
		expect(loaded).toEqual(data);
	});

	test("loadStats handles corrupt JSON gracefully", () => {
		localStorage.setItem(STATS_STORAGE_KEY, "invalid-json{");
		expect(loadStats()).toEqual(DEFAULT_STATS);
	});

	test("loadStats sanitizes malformed objects or negative values", () => {
		const malformed = {
			easy: { gamesPlayed: -10, gamesWon: "foo", bestTime: -5 },
			medium: null,
		};
		localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(malformed));

		const loaded = loadStats();
		expect(loaded.easy).toEqual({
			gamesPlayed: 0,
			gamesWon: 0,
			bestTime: null,
		});
		expect(loaded.medium).toEqual(createDefaultDifficultyStats());
		expect(loaded.hard).toEqual(createDefaultDifficultyStats());
	});

	test("recordGameStart increments gamesPlayed for the selected difficulty and persists", () => {
		const initial = createDefaultStats();
		const updated = recordGameStart(initial, "easy");

		expect(updated.easy.gamesPlayed).toBe(1);
		expect(updated.easy.gamesWon).toBe(0);
		expect(updated.medium.gamesPlayed).toBe(0);

		const inStorage = JSON.parse(
			localStorage.getItem(STATS_STORAGE_KEY) || "{}",
		);
		expect(inStorage.easy.gamesPlayed).toBe(1);
	});

	test("recordGameWin updates gamesWon and sets bestTime when none existed", () => {
		let stats = createDefaultStats();
		stats = recordGameStart(stats, "medium");
		stats = recordGameWin(stats, "medium", 185, true);

		expect(stats.medium.gamesPlayed).toBe(1);
		expect(stats.medium.gamesWon).toBe(1);
		expect(stats.medium.bestTime).toBe(185);
	});

	test("recordGameWin updates bestTime only when new time is lower", () => {
		let stats = createDefaultStats();
		stats = recordGameWin(stats, "hard", 200, false);
		expect(stats.hard.bestTime).toBe(200);

		// Slower time does not replace bestTime
		stats = recordGameWin(stats, "hard", 250, false);
		expect(stats.hard.bestTime).toBe(200);

		// Faster time replaces bestTime
		stats = recordGameWin(stats, "hard", 150, false);
		expect(stats.hard.bestTime).toBe(150);
	});

	test("recordGameWin increments gamesPlayed if alreadyCountedPlayed is false", () => {
		const initial = createDefaultStats();
		const updated = recordGameWin(initial, "easy", 60, false);

		expect(updated.easy.gamesPlayed).toBe(1);
		expect(updated.easy.gamesWon).toBe(1);
		expect(updated.easy.bestTime).toBe(60);
	});

	test("getWinRate calculates correct rounded percentages and handles division by zero", () => {
		expect(getWinRate({ gamesPlayed: 0, gamesWon: 0, bestTime: null })).toBe(0);
		expect(getWinRate({ gamesPlayed: 10, gamesWon: 3, bestTime: 100 })).toBe(
			30,
		);
		expect(getWinRate({ gamesPlayed: 3, gamesWon: 2, bestTime: 100 })).toBe(67);
		expect(getWinRate({ gamesPlayed: 5, gamesWon: 5, bestTime: 100 })).toBe(
			100,
		);
	});

	test("getOverallStats aggregates across all difficulties", () => {
		const stats = {
			easy: { gamesPlayed: 5, gamesWon: 4, bestTime: 120 },
			medium: { gamesPlayed: 3, gamesWon: 2, bestTime: 240 },
			hard: { gamesPlayed: 2, gamesWon: 1, bestTime: 95 },
		};

		const overall = getOverallStats(stats);
		expect(overall.gamesPlayed).toBe(10);
		expect(overall.gamesWon).toBe(7);
		expect(overall.bestTime).toBe(95);
	});

	test("getOverallStats returns null bestTime when no games are won", () => {
		const stats = createDefaultStats();
		const overall = getOverallStats(stats);
		expect(overall.bestTime).toBeNull();
	});

	test("resetStats resets all stats to 0 and updates storage", () => {
		let stats = createDefaultStats();
		stats = recordGameWin(stats, "easy", 100, false);
		saveStats(stats);

		const reset = resetStats();
		expect(reset).toEqual(DEFAULT_STATS);

		const inStorage = JSON.parse(
			localStorage.getItem(STATS_STORAGE_KEY) || "{}",
		);
		expect(inStorage).toEqual(DEFAULT_STATS);
	});
});
