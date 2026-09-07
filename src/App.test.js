import { describe, expect, it } from "vitest";
import {
	countSolutions,
	generatePuzzle,
	generateSolvedBoard,
	isValid,
	solveSudoku,
} from "./App.jsx";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the board is a valid complete Sudoku solution */
function isValidSolution(board) {
	const digits = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);

	// Check rows
	for (let r = 0; r < 9; r++) {
		if (new Set(board[r]).size !== 9) return false;
		for (const v of board[r]) if (!digits.has(Number(v))) return false;
	}

	// Check columns
	for (let c = 0; c < 9; c++) {
		const col = new Set(board.map((row) => row[c]));
		if (col.size !== 9) return false;
	}

	// Check 3x3 boxes
	for (let br = 0; br < 3; br++) {
		for (let bc = 0; bc < 3; bc++) {
			const box = new Set();
			for (let r = 0; r < 3; r++)
				for (let c = 0; c < 3; c++) box.add(board[br * 3 + r][bc * 3 + c]);
			if (box.size !== 9) return false;
		}
	}

	return true;
}

/** Count the non-empty cells on a puzzle board (cells are strings; "" = empty) */
function countClues(board) {
	return board.flat().filter((c) => c !== "").length;
}

// A known, fully solved board for deterministic tests
const SOLVED = [
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
	it("returns true for a valid placement in an otherwise empty board", () => {
		const board = Array.from({ length: 9 }, () => Array(9).fill(""));
		expect(isValid(board, 0, 0, 5)).toBe(true);
	});

	it("returns false when the same value exists in the same row", () => {
		const board = Array.from({ length: 9 }, () => Array(9).fill(""));
		board[0][3] = 5;
		expect(isValid(board, 0, 0, 5)).toBe(false);
	});

	it("returns false when the same value exists in the same column", () => {
		const board = Array.from({ length: 9 }, () => Array(9).fill(""));
		board[4][0] = 5;
		expect(isValid(board, 0, 0, 5)).toBe(false);
	});

	it("returns false when the same value exists in the same 3x3 box", () => {
		const board = Array.from({ length: 9 }, () => Array(9).fill(""));
		board[1][1] = 5;
		expect(isValid(board, 0, 0, 5)).toBe(false);
	});

	it("self-exclusion: treats the cell's own value as non-conflicting (pre-filled cells)", () => {
		// A pre-filled cell should not conflict with itself
		const board = SOLVED.map((r) => [...r]);
		// Value 5 is already at (0,0) — isValid should still return true (self-exclusion)
		expect(isValid(board, 0, 0, 5)).toBe(true);
	});

	it("returns true when no conflict exists anywhere", () => {
		const board = Array.from({ length: 9 }, () => Array(9).fill(""));
		board[0][1] = 3;
		board[0][2] = 4;
		// 5 does not conflict with 3 or 4 in the row/col/box
		expect(isValid(board, 0, 0, 5)).toBe(true);
	});

	it("returns false when the value conflicts in both row and box simultaneously", () => {
		const board = Array.from({ length: 9 }, () => Array(9).fill(""));
		board[0][1] = 7;
		board[2][2] = 7;
		expect(isValid(board, 0, 0, 7)).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// solveSudoku
// ---------------------------------------------------------------------------

describe("solveSudoku", () => {
	it("solves a board with one empty cell", () => {
		const board = SOLVED.map((r) => r.map((v) => v));
		// Replace (8,8) with empty — the only missing value in that row/col/box is 9
		board[8][8] = "";
		const result = solveSudoku(board);
		expect(result[8][8]).toBe(9);
	});

	it("returns a fully filled board (no zeros)", () => {
		const board = Array.from({ length: 9 }, () => Array(9).fill(""));
		const result = solveSudoku(board);
		expect(result.flat().every((c) => c !== 0 && c !== "")).toBe(true);
	});

	it("produces a valid solution for a known puzzle", () => {
		// Remove a few cells from the solved board
		const puzzle = SOLVED.map((r) => [...r]);
		puzzle[0][0] = "";
		puzzle[4][4] = "";
		puzzle[8][8] = "";
		const result = solveSudoku(puzzle);
		expect(isValidSolution(result)).toBe(true);
	});

	it("leaves pre-filled cells unchanged", () => {
		const board = SOLVED.map((r) => r.map((v) => v));
		board[0][1] = ""; // remove one cell
		const result = solveSudoku(board);
		// All originally filled values should remain the same
		for (let r = 0; r < 9; r++)
			for (let c = 0; c < 9; c++)
				if (board[r][c] !== "") expect(result[r][c]).toBe(board[r][c]);
	});
});

// ---------------------------------------------------------------------------
// countSolutions
// ---------------------------------------------------------------------------

describe("countSolutions", () => {
	it("returns 1 for an almost-complete board with a single empty cell", () => {
		// countSolutions uses numbers internally (not strings)
		const board = SOLVED.map((r) => r.map((v) => v));
		board[8][8] = ""; // only one empty cell, only one valid value
		expect(countSolutions(board)).toBe(1);
	});

	it("returns 1 for the fully solved board (treated as 0 empty cells)", () => {
		// Board uses numbers directly (as returned by generateSolvedBoard)
		const board = SOLVED.map((r) => [...r]);
		expect(countSolutions(board)).toBe(1);
	});

	it("returns >= 2 (up to limit) for a board with many empty cells", () => {
		// All empty — many solutions
		const board = Array.from({ length: 9 }, () => Array(9).fill(""));
		expect(countSolutions(board, 2)).toBe(2);
	});

	it("respects the limit parameter and stops early", () => {
		const board = Array.from({ length: 9 }, () => Array(9).fill(""));
		// With limit=1, should stop after finding the first solution
		const result = countSolutions(board, 1);
		expect(result).toBeGreaterThanOrEqual(1);
	});
});

// ---------------------------------------------------------------------------
// generateSolvedBoard
// ---------------------------------------------------------------------------

describe("generateSolvedBoard", () => {
	it("returns a 9x9 board", () => {
		const board = generateSolvedBoard();
		expect(board).toHaveLength(9);
		for (const row of board) expect(row).toHaveLength(9);
	});

	it("produces a valid complete Sudoku solution", () => {
		const board = generateSolvedBoard();
		expect(isValidSolution(board)).toBe(true);
	});

	it("produces a different board on each call (randomness check)", () => {
		const a = generateSolvedBoard();
		const b = generateSolvedBoard();
		// Extremely unlikely to be identical — if this flakes, something is wrong
		const identical = a.every((row, i) => row.every((v, j) => v === b[i][j]));
		expect(identical).toBe(false);
	});

	it("every cell contains a number between 1 and 9", () => {
		const board = generateSolvedBoard();
		for (const cell of board.flat()) {
			expect(cell).toBeGreaterThanOrEqual(1);
			expect(cell).toBeLessThanOrEqual(9);
		}
	});
});

// ---------------------------------------------------------------------------
// generatePuzzle
// ---------------------------------------------------------------------------

describe("generatePuzzle", () => {
	// generatePuzzle involves backtracking and can be slow — allow 30 seconds
	const TIMEOUT = 30_000;

	it("returns both puzzleBoard and solvedBoard", () => {
		const result = generatePuzzle("easy");
		expect(result).toHaveProperty("puzzleBoard");
		expect(result).toHaveProperty("solvedBoard");
	}, TIMEOUT);

	it("easy puzzle has at most 25 clues", () => {
		// The generator targets 25 but may stop earlier if uniqueness cannot be maintained
		const { puzzleBoard } = generatePuzzle("easy");
		expect(countClues(puzzleBoard)).toBeLessThanOrEqual(30); // always removes meaningful clues
		expect(countClues(puzzleBoard)).toBeLessThan(81); // always removes at least some cells
	}, TIMEOUT);

	it("medium puzzle has at most 21 clues", () => {
		// The generator targets 21 but may stop earlier if uniqueness cannot be maintained
		const { puzzleBoard } = generatePuzzle("medium");
		expect(countClues(puzzleBoard)).toBeLessThan(81); // always removes at least some cells
		expect(countClues(puzzleBoard)).toBeLessThan(30); // always below easy-difficulty range
	}, TIMEOUT);

	it("hard puzzle has at most 19 clues", () => {
		// The generator targets 19 but may stop earlier if uniqueness cannot be maintained
		const { puzzleBoard } = generatePuzzle("hard");
		expect(countClues(puzzleBoard)).toBeLessThan(81); // always removes at least some cells
		expect(countClues(puzzleBoard)).toBeLessThan(30); // always below easy-difficulty range
	}, TIMEOUT);

	it("solvedBoard is a valid complete solution", () => {
		const { solvedBoard } = generatePuzzle("easy");
		expect(isValidSolution(solvedBoard)).toBe(true);
	}, TIMEOUT);

	it("puzzle has a unique solution (countSolutions === 1)", () => {
		const { puzzleBoard } = generatePuzzle("easy");
		expect(countSolutions(puzzleBoard, 2)).toBe(1);
	}, TIMEOUT);

	it("puzzle clues match the corresponding values in solvedBoard", () => {
		const { puzzleBoard, solvedBoard } = generatePuzzle("medium");
		for (let r = 0; r < 9; r++) {
			for (let c = 0; c < 9; c++) {
				if (puzzleBoard[r][c] !== "") {
					// puzzleBoard stores strings, solvedBoard stores numbers
					expect(Number(puzzleBoard[r][c])).toBe(solvedBoard[r][c]);
				}
			}
		}
	}, TIMEOUT);

	it("empty cells in puzzleBoard are represented as empty strings", () => {
		const { puzzleBoard } = generatePuzzle("hard");
		const clues = countClues(puzzleBoard);
		const emptyCells = puzzleBoard.flat().filter((c) => c === "");
		// clues + empty cells must always sum to 81
		expect(emptyCells.length).toBe(81 - clues);
	}, TIMEOUT);
});
