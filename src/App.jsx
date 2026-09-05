import { useEffect, useRef, useState } from "react";
import "./App.css";

function isValid(board, row, col, value) {
	for (let i = 0; i < 9; i++) {
		if (board[row][i] === value || board[i][col] === value) return false;
	}
	const startRow = Math.floor(row / 3) * 3;
	const startCol = Math.floor(col / 3) * 3;
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (board[startRow + i][startCol + j] === value) return false;
		}
	}
	return true;
}

function countSolutions(board, limit = 2) {
	const b = board.map((row) => [...row]);
	let count = 0;

	function isSafe(r, c, n) {
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

	function solve(r = 0, c = 0) {
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

function solveSudoku(board) {
	const b = board.map((row) => row.map((cell) => (cell === "" ? 0 : cell)));
	function isSafe(r, c, n) {
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
	function solve(r = 0, c = 0) {
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

function generateSolvedBoard() {
	const board = Array.from({ length: 9 }, () => Array(9).fill(""));

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

function generatePuzzle(difficulty) {
	let cluesToKeep = 25; // easy
	if (difficulty === "medium") cluesToKeep = 21;
	if (difficulty === "hard") cluesToKeep = 19;

	const solvedBoard = generateSolvedBoard();
	const puzzleBoard = solvedBoard.map((row) => [...row]);

	const coords = [];
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

function App() {
	const [initialBoard, setInitialBoard] = useState(
		Array.from({ length: 9 }, () => Array(9).fill("")),
	);
	const [board, setBoard] = useState(
		Array.from({ length: 9 }, () => Array(9).fill("")),
	);
	const [message, setMessage] = useState("");
	const [hintCell, setHintCell] = useState(null); // {row, col}
	const [level, setLevel] = useState("Easy");
	const [solvedBoard, setSolvedBoard] = useState(null);
	const hintTimerRef = useRef(null);

	useEffect(() => {
		const { puzzleBoard, solvedBoard } = generatePuzzle("easy");
		setInitialBoard(puzzleBoard);
		setBoard(puzzleBoard.map((row) => [...row]));
		setSolvedBoard(solvedBoard);
		setMessage("");
		setHintCell(null);
		setLevel("Easy");
	}, []);

	const handleChange = (row, col, val) => {
		if (
			val === "" ||
			(/^[1-9]$/.test(val) && isValid(board, row, col, Number(val)))
		) {
			const newBoard = board.map((r, i) =>
				r.map((c, j) =>
					i === row && j === col ? (val === "" ? "" : Number(val)) : c,
				),
			);
			setBoard(newBoard);
			setMessage("");
		} else {
			setMessage("Invalid move!");
		}
	};

	const handleNewSudoku = (difficulty) => {
		let label = "Easy";
		if (difficulty === "medium") label = "Medium";
		if (difficulty === "hard") label = "Hard";

		const { puzzleBoard, solvedBoard } = generatePuzzle(difficulty);
		setInitialBoard(puzzleBoard);
		setBoard(puzzleBoard.map((row) => [...row]));
		setSolvedBoard(solvedBoard);
		setMessage("");
		setHintCell(null);
		setLevel(label);
	};

	const handleHint = () => {
		if (!solvedBoard) return;
		const incorrects = [];
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
		const newBoard = board.map((r) => [...r]);
		newBoard[row][col] = value;
		setBoard(newBoard);
		setHintCell({ row, col });

		if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
		hintTimerRef.current = setTimeout(() => setHintCell(null), 6000);
	};

	const isComplete =
		solvedBoard &&
		board.every((row, i) => row.every((cell, j) => cell === solvedBoard[i][j]));

	return (
		<div className="sudoku-app">
			<h1>Sudoku</h1>
			<div
				style={{
					marginBottom: "0.5em",
					textAlign: "center",
					fontWeight: "bold",
					fontSize: "1.1em",
				}}
			>
				Level: <span data-testid="sudoku-level-label">{level}</span>
			</div>
			<div
				style={{
					marginBottom: "1em",
					display: "flex",
					gap: "0.5em",
					justifyContent: "center",
				}}
			>
				<button
					className="btn btn-easy"
					type="button"
					onClick={() => handleNewSudoku("easy")}
				>
					New Easy
				</button>
				<button
					className="btn btn-medium"
					type="button"
					onClick={() => handleNewSudoku("medium")}
				>
					New Medium
				</button>
				<button
					className="btn btn-hard"
					type="button"
					onClick={() => handleNewSudoku("hard")}
				>
					New Hard
				</button>
			</div>
			<div className="sudoku-board">
				{board.map((row, i) => (
					<div key={`row-${i}`}>
						{row.map((cell, j) => {
							const blockRight = (j + 1) % 3 === 0;
							const blockBottom = (i + 1) % 3 === 0;
							const blockTop = i % 3 === 0;
							const blockLeft = j % 3 === 0;
							// Add classes for block borders
							let cellClass = "sudoku-cell";
							if (blockRight) cellClass += " block-right";
							if (blockBottom) cellClass += " block-bottom";
							if (blockTop) cellClass += " block-top";
							if (blockLeft) cellClass += " block-left";
							if (hintCell && hintCell.row === i && hintCell.col === j)
								cellClass += " sudoku-hint";
							return (
								<input
									key={`cell-${i}-${j}`}
									className={cellClass}
									type="text"
									maxLength={1}
									value={cell}
									onChange={(e) => handleChange(i, j, e.target.value)}
									disabled={initialBoard[i][j] !== ""}
								/>
							);
						})}
					</div>
				))}
			</div>
			<div style={{ margin: "1em 0", textAlign: "center" }}>
				<button className="btn btn-hint" type="button" onClick={handleHint}>
					Get Hint
				</button>
			</div>
			<div className="sudoku-message">
				{message || (isComplete ? "Congratulations! Puzzle complete." : "")}
			</div>
			<div className="sudoku-instructions">
				<p>
					Fill the grid so that every row, column, and 3x3 box contains the
					numbers 1-9.
				</p>
			</div>
		</div>
	);
}

export default App;
