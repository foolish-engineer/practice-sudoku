import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single Sudoku cell: a digit 1–9, or "" for an empty cell. */
export type Cell = number | "";

/** A 9×9 Sudoku board. Empty cells are represented as "". */
export type Board = Cell[][];

/** A fully solved 9×9 Sudoku board. All cells are numbers 1–9. */
export type SolvedBoard = number[][];

/** The three difficulty levels. */
export type Difficulty = "easy" | "medium" | "hard";

/** Display label derived from a Difficulty. */
type LevelLabel = "Easy" | "Medium" | "Hard";

/** Coordinates of the currently highlighted hint cell. */
type HintCell = { row: number; col: number } | null;

/** Return value of generatePuzzle. */
interface PuzzleResult {
	puzzleBoard: Board;
	solvedBoard: SolvedBoard;
}

// ---------------------------------------------------------------------------
// Pure functions
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// App component
// ---------------------------------------------------------------------------

function App() {
	const emptyBoard = (): Board =>
		Array.from({ length: 9 }, () => Array(9).fill(""));

	const [initialBoard, setInitialBoard] = useState<Board>(emptyBoard);
	const [board, setBoard] = useState<Board>(emptyBoard);
	const [message, setMessage] = useState("");
	const [hintCell, setHintCell] = useState<HintCell>(null);
	const [level, setLevel] = useState<LevelLabel>("Easy");
	const [solvedBoard, setSolvedBoard] = useState<SolvedBoard | null>(null);
	const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const [animatingValue, setAnimatingValue] = useState<Cell | null>(null);
	const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const handleAnimateSame = (val: Cell) => {
		if (!val) return;
		setAnimatingValue(val);
		if (animTimerRef.current) clearTimeout(animTimerRef.current);
		animTimerRef.current = setTimeout(() => {
			setAnimatingValue(null);
		}, 3000);
	};

	useEffect(() => {
		const { puzzleBoard, solvedBoard } = generatePuzzle("easy");
		setInitialBoard(puzzleBoard);
		setBoard(puzzleBoard.map((row) => [...row]));
		setSolvedBoard(solvedBoard);
		setMessage("");
		setHintCell(null);
		setLevel("Easy");
	}, []);

	const handleChange = (row: number, col: number, val: string) => {
		if (val === "" || /^[1-9]$/.test(val)) {
			const numVal: Cell = val === "" ? "" : Number(val);
			const newBoard: Board = board.map((r, i) =>
				r.map((c, j) => (i === row && j === col ? numVal : c)),
			);
			setBoard(newBoard);
			if (numVal !== "" && !isValid(newBoard, row, col, numVal)) {
				setMessage("Invalid move!");
			} else {
				setMessage("");
			}
		} else {
			setMessage("Invalid move!");
		}
	};

	const handleNewSudoku = (difficulty: Difficulty) => {
		const labelMap: Record<Difficulty, LevelLabel> = {
			easy: "Easy",
			medium: "Medium",
			hard: "Hard",
		};

		const { puzzleBoard, solvedBoard } = generatePuzzle(difficulty);
		setInitialBoard(puzzleBoard);
		setBoard(puzzleBoard.map((row) => [...row]));
		setSolvedBoard(solvedBoard);
		if (animTimerRef.current) clearTimeout(animTimerRef.current);
		setAnimatingValue(null);
		setMessage("");
		setHintCell(null);
		setLevel(labelMap[difficulty]);
	};

	const handleHint = () => {
		if (!solvedBoard) return;
		const incorrects: [number, number][] = [];
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (initialBoard[i][j] === "" && board[i][j] !== solvedBoard[i][j]) {
					incorrects.push([i, j]);
				}
			}
		}
		if (incorrects.length === 0) return;
		const [row, col] =
			incorrects[Math.floor(Math.random() * incorrects.length)];
		const value = solvedBoard[row][col];
		const newBoard: Board = board.map((r) => [...r]);
		newBoard[row][col] = value;
		setBoard(newBoard);
		setHintCell({ row, col });

		if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
		hintTimerRef.current = setTimeout(() => setHintCell(null), 6000);
	};

	const isComplete =
		solvedBoard != null &&
		board.every((row, i) => row.every((cell, j) => cell === solvedBoard[i][j]));

	// Digits that appear exactly 9 times on the board (fully placed)
	const completedDigits = new Set(
		[1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
			(n) => board.flat().filter((c) => Number(c) === n).length === 9,
		),
	);

	return (
		<div className="max-w-[600px] w-full p-8 bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.08)] text-center mx-auto">
			<h1>Sudoku</h1>
			<div className="mb-2 text-center font-bold text-[1.1em]">
				Level: <span data-testid="sudoku-level-label">{level}</span>
			</div>
			<div className="mb-4 flex gap-2 justify-center">
				<button
					className="px-5 py-2.5 border-none rounded-lg text-base font-semibold cursor-pointer text-white transition-all duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] active:translate-y-[1px] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)] bg-green-500 hover:bg-green-600"
					type="button"
					onClick={() => handleNewSudoku("easy")}
				>
					New Easy
				</button>
				<button
					className="px-5 py-2.5 border-none rounded-lg text-base font-semibold cursor-pointer text-white transition-all duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] active:translate-y-[1px] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)] bg-orange-500 hover:bg-orange-600"
					type="button"
					onClick={() => handleNewSudoku("medium")}
				>
					New Medium
				</button>
				<button
					className="px-5 py-2.5 border-none rounded-lg text-base font-semibold cursor-pointer text-white transition-all duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] active:translate-y-[1px] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)] bg-red-500 hover:bg-red-600"
					type="button"
					onClick={() => handleNewSudoku("hard")}
				>
					New Hard
				</button>
			</div>
			<div className="my-6 inline-block">
				{board.map((row, i) => (
					<div key={`row-${i}`} className="flex justify-center">
						{row.map((cell, j) => {
							const blockRight = (j + 1) % 3 === 0;
							const blockBottom = (i + 1) % 3 === 0;
							const blockTop = i % 3 === 0;
							const blockLeft = j % 3 === 0;
							// Add classes for block borders
							let cellClass =
								"w-[54px] h-[54px] text-center text-[1.2rem] border border-[#bbb] outline-none bg-[#f9f9f9] transition-colors duration-200 text-black focus:bg-blue-50 disabled:bg-[#e0e0e0] disabled:text-[#333] disabled:font-bold";
							if (blockRight) cellClass += " border-r-[3px] border-r-[#333]";
							if (blockBottom) cellClass += " border-b-[3px] border-b-[#333]";
							if (blockTop) cellClass += " border-t-[3px] border-t-[#333]";
							if (blockLeft) cellClass += " border-l-[3px] border-l-[#333]";
							if (hintCell && hintCell.row === i && hintCell.col === j)
								cellClass += " !bg-[#fff59d] transition-colors duration-500";
							const isUserCell = initialBoard[i][j] === "" && cell !== "";
							if (isUserCell && !isValid(board, i, j, cell))
								cellClass +=
									" !border-2 !border-red-500 z-[2] !bg-[#fff59d] focus:!bg-[#fff176]";
							if (
								animatingValue !== null &&
								cell !== "" &&
								Number(cell) === Number(animatingValue)
							)
								cellClass += " animate-pulse-highlight z-[5] relative";
							return (
								<div
									key={`cell-wrap-${i}-${j}`}
									className="relative inline-flex"
								>
									<input
										className={cellClass}
										type="text"
										maxLength={1}
										value={cell}
										onChange={(e) => handleChange(i, j, e.target.value)}
										disabled={initialBoard[i][j] !== ""}
									/>
									{cell !== "" && (
										<button
											type="button"
											className="absolute top-[3px] right-[3px] w-[14px] h-[14px] p-0 m-0 border border-blue-500/25 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center cursor-pointer z-[4] transition-all duration-200 hover:bg-blue-500 hover:text-white hover:border-blue-600 hover:scale-125"
											onClick={(e) => {
												e.stopPropagation();
												handleAnimateSame(cell);
											}}
											title={`Highlight all ${cell}s for 3 seconds`}
											aria-label={`Highlight all cells with number ${cell}`}
										>
											<svg
												width="8"
												height="8"
												viewBox="0 0 24 24"
												fill="none"
												stroke="currentColor"
												strokeWidth="3.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											>
												<title>Highlight matching numbers</title>
												<circle cx="11" cy="11" r="7" />
												<line x1="21" y1="21" x2="16" y2="16" />
											</svg>
										</button>
									)}
								</div>
							);
						})}
					</div>
				))}
			</div>
			<div className="my-4 text-center">
				<button
					className="px-5 py-2.5 border-none rounded-lg text-base font-semibold cursor-pointer text-white transition-all duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] active:translate-y-[1px] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)] bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
					type="button"
					onClick={handleHint}
					disabled={isComplete}
				>
					Get Hint
				</button>
			</div>
			<div className="text-red-600 min-h-[1.5em] mb-2">
				{message || (isComplete ? "Congratulations! Puzzle complete." : "")}
			</div>
			{completedDigits.size > 0 && (
				<div className="mt-3 mb-1">
					<div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
						Completed
					</div>
					<div className="flex gap-1.5 justify-center flex-wrap">
						{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) =>
							completedDigits.has(n) ? (
								<span
									key={n}
									className="w-7 h-7 rounded-full bg-green-500 text-white text-sm font-bold flex items-center justify-center shadow-sm"
								>
									{n}
								</span>
							) : null,
						)}
					</div>
				</div>
			)}
			<div className="text-[0.95em] text-gray-500 mt-3">
				Fill every row, column, and 3×3 box with numbers 1–9.
			</div>
		</div>
	);
}

export default App;
