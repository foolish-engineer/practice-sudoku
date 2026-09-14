import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generatePuzzle, isValid } from "../core/sudoku";
import type {
	Board,
	Cell,
	Difficulty,
	HintCell,
	LevelLabel,
	SolvedBoard,
} from "../types/sudoku";
import type {
	GeneratePuzzleRequest,
	PuzzleWorkerResponse,
} from "../workers/puzzleWorker";

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
	const [isGenerating, setIsGenerating] = useState(false);

	const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const workerRef = useRef<Worker | null>(null);
	const requestIdRef = useRef<number>(0);

	const handleNewSudoku = useCallback((difficulty: Difficulty) => {
		const nextRequestId = ++requestIdRef.current;
		setIsGenerating(true);
		setMessage("");
		setHintCell(null);
		setLevel(LABEL_MAP[difficulty]);

		if (animTimerRef.current) clearTimeout(animTimerRef.current);
		setAnimatingValue(null);

		if (workerRef.current) {
			const request: GeneratePuzzleRequest = {
				type: "GENERATE_PUZZLE",
				difficulty,
				id: nextRequestId,
			};
			workerRef.current.postMessage(request);
		} else {
			// Fallback if Web Workers are unavailable (e.g. Node/SSR test environments)
			try {
				const { puzzleBoard, solvedBoard } = generatePuzzle(difficulty);
				if (nextRequestId === requestIdRef.current) {
					setInitialBoard(puzzleBoard);
					setBoard(puzzleBoard.map((row) => [...row]));
					setSolvedBoard(solvedBoard);
				}
			} catch {
				setMessage("Failed to generate puzzle. Please try again.");
			} finally {
				if (nextRequestId === requestIdRef.current) {
					setIsGenerating(false);
				}
			}
		}
	}, []);

	// Initialize Web Worker and generate initial puzzle
	useEffect(() => {
		if (typeof Worker !== "undefined") {
			try {
				const worker = new Worker(
					new URL("../workers/puzzleWorker.ts", import.meta.url),
					{ type: "module" },
				);

				worker.onmessage = (event: MessageEvent<PuzzleWorkerResponse>) => {
					const data = event.data;
					if (data.id !== requestIdRef.current) return;

					if (data.type === "PUZZLE_GENERATED") {
						const { puzzleBoard, solvedBoard } = data.result;
						setInitialBoard(puzzleBoard);
						setBoard(puzzleBoard.map((row) => [...row]));
						setSolvedBoard(solvedBoard);
						setIsGenerating(false);
					} else if (data.type === "PUZZLE_ERROR") {
						setMessage("Failed to generate puzzle. Please try again.");
						setIsGenerating(false);
					}
				};

				worker.onerror = () => {
					setMessage("Puzzle generator worker error.");
					setIsGenerating(false);
					// Null out the dead worker so the next call falls back to the sync path
					workerRef.current = null;
				};

				workerRef.current = worker;
			} catch {
				workerRef.current = null;
			}
		}

		handleNewSudoku("easy");

		return () => {
			if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
			if (animTimerRef.current) clearTimeout(animTimerRef.current);
			if (workerRef.current) {
				workerRef.current.terminate();
				workerRef.current = null;
			}
		};
	}, [handleNewSudoku]);

	const handleAnimateSame = (val: Cell) => {
		if (!val) return;
		setAnimatingValue(val);
		if (animTimerRef.current) clearTimeout(animTimerRef.current);
		animTimerRef.current = setTimeout(() => {
			setAnimatingValue(null);
		}, 3000);
	};

	const handleChange = (row: number, col: number, val: string) => {
		if (isGenerating) return;
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

	const handleHint = () => {
		if (!solvedBoard || isGenerating) return;
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
		isGenerating,
		handleChange,
		handleNewSudoku,
		handleHint,
		handleAnimateSame,
	};
}
