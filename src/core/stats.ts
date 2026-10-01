import type { Difficulty, DifficultyStats, SudokuStats } from "../types/sudoku";

export const STATS_STORAGE_KEY = "practice-sudoku-stats";

export function createDefaultDifficultyStats(): DifficultyStats {
	return {
		gamesPlayed: 0,
		gamesWon: 0,
		bestTime: null,
	};
}

export function createDefaultStats(): SudokuStats {
	return {
		easy: createDefaultDifficultyStats(),
		medium: createDefaultDifficultyStats(),
		hard: createDefaultDifficultyStats(),
	};
}

export const DEFAULT_STATS: SudokuStats = createDefaultStats();

function sanitizeDifficultyStats(raw: unknown): DifficultyStats {
	if (!raw || typeof raw !== "object") {
		return createDefaultDifficultyStats();
	}
	const candidate = raw as Record<string, unknown>;
	const gamesPlayed =
		typeof candidate.gamesPlayed === "number" && candidate.gamesPlayed >= 0
			? Math.floor(candidate.gamesPlayed)
			: 0;
	const gamesWon =
		typeof candidate.gamesWon === "number" &&
		candidate.gamesWon >= 0 &&
		candidate.gamesWon <= gamesPlayed
			? Math.floor(candidate.gamesWon)
			: 0;
	const bestTime =
		typeof candidate.bestTime === "number" && candidate.bestTime >= 0
			? Math.floor(candidate.bestTime)
			: null;

	return { gamesPlayed, gamesWon, bestTime };
}

/** Loads statistics from localStorage, falling back to clean defaults if unavailable or corrupt. */
export function loadStats(): SudokuStats {
	if (typeof localStorage === "undefined") {
		return createDefaultStats();
	}

	try {
		const raw = localStorage.getItem(STATS_STORAGE_KEY);
		if (!raw) return createDefaultStats();

		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== "object") return createDefaultStats();

		return {
			easy: sanitizeDifficultyStats(parsed.easy),
			medium: sanitizeDifficultyStats(parsed.medium),
			hard: sanitizeDifficultyStats(parsed.hard),
		};
	} catch {
		return createDefaultStats();
	}
}

/** Saves statistics to localStorage. */
export function saveStats(stats: SudokuStats): void {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
	} catch (e) {
		console.error("Failed to save statistics", e);
	}
}

/** Increments games played for the given difficulty. */
export function recordGameStart(
	stats: SudokuStats,
	difficulty: Difficulty,
): SudokuStats {
	const current = stats[difficulty];
	const updatedDiff: DifficultyStats = {
		...current,
		gamesPlayed: current.gamesPlayed + 1,
	};
	const nextStats: SudokuStats = {
		...stats,
		[difficulty]: updatedDiff,
	};
	saveStats(nextStats);
	return nextStats;
}

/** Records a completed win for the given difficulty and updates best time. */
export function recordGameWin(
	stats: SudokuStats,
	difficulty: Difficulty,
	elapsedSeconds: number,
	alreadyCountedPlayed = true,
): SudokuStats {
	const current = stats[difficulty];
	const gamesPlayed = alreadyCountedPlayed
		? current.gamesPlayed
		: current.gamesPlayed + 1;
	const gamesWon = current.gamesWon + 1;
	const bestTime =
		current.bestTime === null
			? elapsedSeconds
			: Math.min(current.bestTime, elapsedSeconds);

	const updatedDiff: DifficultyStats = {
		gamesPlayed,
		gamesWon,
		bestTime,
	};

	const nextStats: SudokuStats = {
		...stats,
		[difficulty]: updatedDiff,
	};
	saveStats(nextStats);
	return nextStats;
}

/** Resets all statistics to initial defaults and clears storage. */
export function resetStats(): SudokuStats {
	const fresh = createDefaultStats();
	saveStats(fresh);
	return fresh;
}

/** Computes the win percentage (0 to 100). */
export function getWinRate(stats: DifficultyStats): number {
	if (stats.gamesPlayed === 0) return 0;
	return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
}

/** Computes aggregated statistics across all difficulty levels. */
export function getOverallStats(stats: SudokuStats): DifficultyStats {
	const all = [stats.easy, stats.medium, stats.hard];
	const gamesPlayed = all.reduce((sum, d) => sum + d.gamesPlayed, 0);
	const gamesWon = all.reduce((sum, d) => sum + d.gamesWon, 0);

	const validTimes = all
		.map((d) => d.bestTime)
		.filter((t): t is number => t !== null);
	const bestTime = validTimes.length > 0 ? Math.min(...validTimes) : null;

	return {
		gamesPlayed,
		gamesWon,
		bestTime,
	};
}
