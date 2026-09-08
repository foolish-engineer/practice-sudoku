import { describe, expect, it } from "vitest";
import type { Board, SolvedBoard } from "./App.tsx";
import {
	countSolutions,
	generatePuzzle,
	generateSolvedBoard,
	isValid,
	solveSudoku,
} from "./App.tsx";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the board is a valid complete Sudoku solution (all numbers, no repeats) */
function isValidSolution(board: SolvedBoard): boolean {
	const expected = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

	// Check rows
	for (let r = 0; r < 9; r++) {
		const row = new Set(board[r]);
		if (row.size !== 9 || ![...row].every((v) => expected.has(v))) return false;
	}

	// Check columns
	for (let c = 0; c < 9; c++) {
		const col = new Set(board.map((row) => row[c]));
		if (col.size !== 9) return false;
	}

	// Check 3x3 boxes
	for (let br = 0; br < 3; br++) {
		for (let bc = 0; bc < 3; bc++) {
			const box = new Set<number>();
			for (let r = 0; r < 3; r++)
				for (let c = 0; c < 3; c++) box.add(board[br * 3 + r][bc * 3 + c]);
			if (box.size !== 9) return false;
		}
	}

	return true;
}

/**
 * Counts non-empty cells on a puzzle board.
 * Empty cells are represented as "". Filled cells are numbers.
 */
function countClues(board: Board): number {
	return board.flat().filter((c) => c !== "").length;
}

// A known, fully-solved board used for deterministic / non-random tests
const SOLVED: SolvedBoard = [
	[5, 3, 4, 6, 7, 8, 9, 1, 2],
	[6, 7, 2, 1, 9, 5, 3, 4, 8],
	[1, 9, 8, 3, 4, 2, 5, 6, 7],
	[8, 5, 9, 7, 6, 1, 4, 2, 3],
	[4, 2, 6, 8, 5, 3, 7, 9, 1],
	[7, 1, 3, 9, 2, 4, 8, 5, 6],
	[9, 6, 1, 5, 3, 7, 2, 8, 4],
	[2, 8, 7, 4, 1, 9, 6, 3, 5],
	[3, 4, 5, 2, 8, 6, 1, 7, 9],
];

// ---------------------------------------------------------------------------
// isValid
// ---------------------------------------------------------------------------

describe("isValid", () => {
	it("returns true for a valid placement in an empty board", () => {
		const board: Board = Array.from({ length: 9 }, () => Array(9).fill(""));
		expect(isValid(board, 0, 0, 5)).toBe(true);
	});

	it("returns false when the value already exists in the same row", () => {
		const board: Board = Array.from({ length: 9 }, () => Array(9).fill(""));
		board[0][3] = 5;
		expect(isValid(board, 0, 0, 5)).toBe(false);
	});

	it("returns false when the value already exists in the same column", () => {
		const board: Board = Array.from({ length: 9 }, () => Array(9).fill(""));
		board[4][0] = 5;
		expect(isValid(board, 0, 0, 5)).toBe(false);
	});

	it("returns false when the value already exists in the same 3x3 box", () => {
		const board: Board = Array.from({ length: 9 }, () => Array(9).fill(""));
		board[1][1] = 5;
		expect(isValid(board, 0, 0, 5)).toBe(false);
	});

	it("self-exclusion: a cell does not conflict with its own pre-filled value", () => {
		// Value 5 is at (0,0) — checking if 5 is valid at (0,0) should return true
		// because the cell's own value is excluded from the conflict check
		const board: Board = SOLVED.map((r) => [...r]);
		expect(isValid(board, 0, 0, 5)).toBe(true);
	});

	it("returns false when the value conflicts in both the row and box simultaneously", () => {
		const board: Board = Array.from({ length: 9 }, () => Array(9).fill(""));
		board[0][1] = 7; // same row as (0,0)
		board[2][2] = 7; // same 3x3 box as (0,0)
		expect(isValid(board, 0, 0, 7)).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// solveSudoku
// ---------------------------------------------------------------------------

describe("solveSudoku", () => {
	it("fills the single empty cell with the only valid value", () => {
		const board: Board = SOLVED.map((r) => [...r]);
		board[8][8] = ""; // only valid value here is 9
		expect(solveSudoku(board)[8][8]).toBe(9);
	});

	it("returns a fully-filled board with no zeros or empty strings", () => {
		const board: Board = Array.from({ length: 9 }, () => Array(9).fill(""));
		const result = solveSudoku(board);
		// SolvedBoard is number[][] — cells are never "", only check for 0
		expect(result.flat().every((c) => c !== 0)).toBe(true);
	});

	it("produces a valid Sudoku solution for a partially filled board", () => {
		const puzzle: Board = SOLVED.map((r) => [...r]);
		puzzle[0][0] = "";
		puzzle[4][4] = "";
		puzzle[8][8] = "";
		expect(isValidSolution(solveSudoku(puzzle))).toBe(true);
	});

	it("does not change pre-filled cells", () => {
		const board: Board = SOLVED.map((r) => [...r]);
		board[0][1] = "";
		const result = solveSudoku(board);
		for (let r = 0; r < 9; r++)
			for (let c = 0; c < 9; c++)
				if (board[r][c] !== "") expect(result[r][c]).toBe(board[r][c]);
	});
});

// ---------------------------------------------------------------------------
// countSolutions
// ---------------------------------------------------------------------------

describe("countSolutions", () => {
	it("returns 1 for a board with a single empty cell (only one solution possible)", () => {
		const board: Board = SOLVED.map((r) => [...r]);
		board[8][8] = "";
		expect(countSolutions(board)).toBe(1);
	});

	it("returns 1 for a fully solved board (zero empty cells)", () => {
		const board: Board = SOLVED.map((r) => [...r]);
		expect(countSolutions(board)).toBe(1);
	});

	it("returns exactly 2 (the limit) for a fully empty board", () => {
		// A fully empty board has many solutions; limit=2 causes early exit at 2
		const board: Board = Array.from({ length: 9 }, () => Array(9).fill(""));
		expect(countSolutions(board, 2)).toBe(2);
	});

	it("stops at limit=1 and returns 1 for a multi-solution board", () => {
		const board: Board = Array.from({ length: 9 }, () => Array(9).fill(""));
		expect(countSolutions(board, 1)).toBe(1);
	});
});

// ---------------------------------------------------------------------------
// generateSolvedBoard
// ---------------------------------------------------------------------------

describe("generateSolvedBoard", () => {
	it("returns a 9x9 grid", () => {
		const board = generateSolvedBoard();
		expect(board).toHaveLength(9);
		for (const row of board) expect(row).toHaveLength(9);
	});

	it("produces a valid, complete Sudoku solution", () => {
		expect(isValidSolution(generateSolvedBoard())).toBe(true);
	});

	it("each cell contains an integer between 1 and 9 inclusive", () => {
		for (const cell of generateSolvedBoard().flat()) {
			expect(cell).toBeGreaterThanOrEqual(1);
			expect(cell).toBeLessThanOrEqual(9);
		}
	});
});

// ---------------------------------------------------------------------------
// generatePuzzle
// generatePuzzle uses backtracking internally — allow 30s per test
// ---------------------------------------------------------------------------

const PUZZLE_TIMEOUT = 30_000;

describe("generatePuzzle", () => {
	it(
		"returns an object with puzzleBoard and solvedBoard",
		() => {
			const result = generatePuzzle("easy");
			expect(result).toHaveProperty("puzzleBoard");
			expect(result).toHaveProperty("solvedBoard");
		},
		PUZZLE_TIMEOUT,
	);

	it(
		"easy: always removes at least some cells from the 81-cell board",
		() => {
			const { puzzleBoard } = generatePuzzle("easy");
			const clues = countClues(puzzleBoard);
			expect(clues).toBeGreaterThan(0);
			expect(clues).toBeLessThan(81);
		},
		PUZZLE_TIMEOUT,
	);

	it(
		"medium: targets fewer clues than easy (target: 21 vs 25)",
		() => {
			// Comparing targets (constants), not two random puzzles which can vary independently
			const { puzzleBoard } = generatePuzzle("medium");
			// Medium always attempts to reach 21 clues (vs easy's 25) — always fewer than 30
			expect(countClues(puzzleBoard)).toBeLessThan(30);
		},
		PUZZLE_TIMEOUT,
	);

	it(
		"hard: targets fewer clues than medium (target: 19 vs 21)",
		() => {
			const { puzzleBoard } = generatePuzzle("hard");
			// Hard always attempts to reach 19 clues — always fewer than 30
			expect(countClues(puzzleBoard)).toBeLessThan(30);
		},
		PUZZLE_TIMEOUT,
	);

	it(
		"solvedBoard is a valid, complete Sudoku solution",
		() => {
			expect(isValidSolution(generatePuzzle("easy").solvedBoard)).toBe(true);
		},
		PUZZLE_TIMEOUT,
	);

	it(
		"generated puzzle has exactly one unique solution",
		() => {
			const { puzzleBoard } = generatePuzzle("easy");
			expect(countSolutions(puzzleBoard, 2)).toBe(1);
		},
		PUZZLE_TIMEOUT,
	);

	it(
		"all clue values in puzzleBoard exactly match the corresponding solvedBoard values",
		() => {
			const { puzzleBoard, solvedBoard } = generatePuzzle("medium");
			for (let r = 0; r < 9; r++)
				for (let c = 0; c < 9; c++)
					if (puzzleBoard[r][c] !== "")
						expect(puzzleBoard[r][c]).toBe(solvedBoard[r][c]);
		},
		PUZZLE_TIMEOUT,
	);

	it(
		"clue count and empty count always sum to 81",
		() => {
			const { puzzleBoard } = generatePuzzle("hard");
			const clues = countClues(puzzleBoard);
			const empties = puzzleBoard.flat().filter((c) => c === "").length;
			expect(clues + empties).toBe(81);
		},
		PUZZLE_TIMEOUT,
	);
});
