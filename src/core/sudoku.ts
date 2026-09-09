import type {
	Board,
	Cell,
	Difficulty,
	PuzzleResult,
	SolvedBoard,
} from "../types/sudoku";

/**
 * Returns true if placing `value` at [row][col] is valid.
 * Uses self-exclusion: the cell's own current value is ignored so pre-filled
 * cells don't falsely conflict with themselves.
 */
export function isValid(
	board: Board,
	row: number,
	col: number,
	value: Cell,
): boolean {
	for (let i = 0; i < 9; i++) {
		if (i !== col && board[row][i] === value) return false;
		if (i !== row && board[i][col] === value) return false;
	}
	const startRow = Math.floor(row / 3) * 3;
	const startCol = Math.floor(col / 3) * 3;
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			const r = startRow + i;
			const c = startCol + j;
			if ((r !== row || c !== col) && board[r][c] === value) return false;
		}
	}
	return true;
}

/**
 * Counts the number of solutions for the given board up to `limit`.
 * Returns early once the limit is reached (early-exit optimisation).
 * Input board may contain numbers or "" for empty cells.
 */
export function countSolutions(board: Board, limit = 2): number {
	// Normalize to numbers so isSafe comparisons work for both string and number boards
	const b: Board = board.map((row) =>
		row.map((cell) => (cell === "" ? "" : Number(cell))),
	);
	let count = 0;

	function isSafe(r: number, c: number, n: number): boolean {
		for (let i = 0; i < 9; i++) {
			if (b[r][i] === n || b[i][c] === n) return false;
		}
		const sr = Math.floor(r / 3) * 3;
		const sc = Math.floor(c / 3) * 3;
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				if (b[sr + i][sc + j] === n) return false;
			}
		}
		return true;
	}

	function solve(r = 0, c = 0): boolean {
		if (r === 9) {
			count++;
			return count >= limit;
		}
		const nextR = c === 8 ? r + 1 : r;
		const nextC = c === 8 ? 0 : c + 1;

		if (b[r][c] !== "") {
			return solve(nextR, nextC);
		}

		for (let n = 1; n <= 9; n++) {
			if (isSafe(r, c, n)) {
				b[r][c] = n;
				if (solve(nextR, nextC)) return true;
				b[r][c] = "";
			}
		}
		return false;
	}

	solve();
	return count;
}

/**
 * Returns a fully solved board given a partial board.
 * Converts "" → 0 internally; returns a SolvedBoard (all numbers).
 */
export function solveSudoku(board: Board): SolvedBoard {
	const b: number[][] = board.map((row) =>
		row.map((cell) => (cell === "" ? 0 : cell)),
	);

	function isSafe(r: number, c: number, n: number): boolean {
		for (let i = 0; i < 9; i++) {
			if (b[r][i] === n || b[i][c] === n) return false;
		}
		const sr = Math.floor(r / 3) * 3;
		const sc = Math.floor(c / 3) * 3;
		for (let i = 0; i < 3; i++) {
			for (let j = 0; j < 3; j++) {
				if (b[sr + i][sc + j] === n) return false;
			}
		}
		return true;
	}

	function solve(r = 0, c = 0): boolean {
		if (r === 9) return true;
		const nextR = c === 8 ? r + 1 : r;
		const nextC = c === 8 ? 0 : c + 1;

		if (b[r][c] !== 0) {
			return solve(nextR, nextC);
		}

		for (let n = 1; n <= 9; n++) {
			if (isSafe(r, c, n)) {
				b[r][c] = n;
				if (solve(nextR, nextC)) return true;
				b[r][c] = 0;
			}
		}
		return false;
	}

	solve();
	return b;
}

/**
 * Seeds the three diagonal 3×3 boxes with random digits (they are independent
 * of each other), then fills the rest with solveSudoku.
 */
export function generateSolvedBoard(): SolvedBoard {
	const board: Board = Array.from({ length: 9 }, () => Array(9).fill(""));

	for (let i = 0; i < 9; i += 3) {
		const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
		let idx = 0;
		for (let r = 0; r < 3; r++) {
			for (let c = 0; c < 3; c++) {
				board[i + r][i + c] = nums[idx++];
			}
		}
	}

	return solveSudoku(board);
}

/**
 * Generates a puzzle by removing cells from a solved board one at a time,
 * only committing a removal if the puzzle still has a unique solution.
 * Stops when the target clue count is reached.
 */
export function generatePuzzle(difficulty: Difficulty): PuzzleResult {
	let cluesToKeep = 25; // easy
	if (difficulty === "medium") cluesToKeep = 21;
	if (difficulty === "hard") cluesToKeep = 19;

	const solvedBoard = generateSolvedBoard();
	const puzzleBoard: Board = solvedBoard.map((row) => [...row]);

	const coords: [number, number][] = [];
	for (let r = 0; r < 9; r++) {
		for (let c = 0; c < 9; c++) {
			coords.push([r, c]);
		}
	}
	coords.sort(() => Math.random() - 0.5);

	let clues = 81;
	for (const [r, c] of coords) {
		if (clues <= cluesToKeep) break;

		const backup = puzzleBoard[r][c];
		puzzleBoard[r][c] = "";

		const solutions = countSolutions(puzzleBoard, 2);
		if (solutions !== 1) {
			puzzleBoard[r][c] = backup;
		} else {
			clues--;
		}
	}

	return { puzzleBoard, solvedBoard };
}
