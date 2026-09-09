import { useEffect, useMemo, useRef, useState } from "react";
import { generatePuzzle, isValid } from "../core/sudoku";
import type {
	Board,
	Cell,
	Difficulty,
	HintCell,
	LevelLabel,
	SolvedBoard,
} from "../types/sudoku";

const emptyBoard = (): Board =>
	Array.from({ length: 9 }, () => Array(9).fill(""));

const LABEL_MAP: Record<Difficulty, LevelLabel> = {
	easy: "Easy",
	medium: "Medium",
	hard: "Hard",
};

export function useSudokuGame() {
	const [initialBoard, setInitialBoard] = useState<Board>(emptyBoard);
	const [board, setBoard] = useState<Board>(emptyBoard);
	const [message, setMessage] = useState("");
	const [hintCell, setHintCell] = useState<HintCell>(null);
	const [level, setLevel] = useState<LevelLabel>("Easy");
	const [solvedBoard, setSolvedBoard] = useState<SolvedBoard | null>(null);
	const [animatingValue, setAnimatingValue] = useState<Cell | null>(null);

	const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Initialize board with easy puzzle on mount
	useEffect(() => {
		const { puzzleBoard, solvedBoard } = generatePuzzle("easy");
		setInitialBoard(puzzleBoard);
		setBoard(puzzleBoard.map((row) => [...row]));
		setSolvedBoard(solvedBoard);
		setMessage("");
		setHintCell(null);
		setLevel("Easy");

		return () => {
			if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
			if (animTimerRef.current) clearTimeout(animTimerRef.current);
		};
	}, []);

	const handleAnimateSame = (val: Cell) => {
		if (!val) return;
		setAnimatingValue(val);
		if (animTimerRef.current) clearTimeout(animTimerRef.current);
		animTimerRef.current = setTimeout(() => {
			setAnimatingValue(null);
		}, 3000);
	};

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
		const { puzzleBoard, solvedBoard } = generatePuzzle(difficulty);
		setInitialBoard(puzzleBoard);
		setBoard(puzzleBoard.map((row) => [...row]));
		setSolvedBoard(solvedBoard);
		if (animTimerRef.current) clearTimeout(animTimerRef.current);
		setAnimatingValue(null);
		setMessage("");
		setHintCell(null);
		setLevel(LABEL_MAP[difficulty]);
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

	const isComplete = Boolean(
		solvedBoard != null &&
			board.every((row, i) =>
				row.every((cell, j) => cell === solvedBoard[i][j]),
			),
	);

	// Digits that appear exactly 9 times on the board (fully placed)
	const completedDigits = useMemo(() => {
		const flatBoard = board.flat();
		return new Set(
			[1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
				(n) => flatBoard.filter((c) => Number(c) === n).length === 9,
			),
		);
	}, [board]);

	return {
		board,
		initialBoard,
		level,
		message,
		hintCell,
		animatingValue,
		isComplete,
		completedDigits,
		handleChange,
		handleNewSudoku,
		handleHint,
		handleAnimateSame,
	};
}
