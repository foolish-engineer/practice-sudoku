import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { generatePuzzle, isValid } from "../core/sudoku";
import type {
	Board,
	BoardNotes,
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

const emptyNotes = (): BoardNotes =>
	Array.from({ length: 9 }, () => Array(9).fill(""));

function clearPeerNotes(
	notes: BoardNotes,
	row: number,
	col: number,
	numVal: number,
): BoardNotes {
	const boxRow = Math.floor(row / 3) * 3;
	const boxCol = Math.floor(col / 3) * 3;
	const digitStr = String(numVal);
	return notes.map((r, i) =>
		r.map((c, j) => {
			const sameRow = i === row;
			const sameCol = j === col;
			const sameBox =
				i >= boxRow && i < boxRow + 3 && j >= boxCol && j < boxCol + 3;
			if ((sameRow || sameCol || sameBox) && !(i === row && j === col)) {
				return c.split(digitStr).join("");
			}
			return c;
		}),
	);
}

interface HistoryState {
	board: Board;
	notes: BoardNotes;
}

const LABEL_MAP: Record<Difficulty, LevelLabel> = {
	easy: "Easy",
	medium: "Medium",
	hard: "Hard",
};

const MAX_HISTORY = 50;

interface GameSaveState {
	initialBoard: Board;
	board: Board;
	notes: BoardNotes;
	level: LevelLabel;
	solvedBoard: SolvedBoard;
	elapsed: number;
	past: HistoryState[];
	future: HistoryState[];
}

export function useSudokuGame() {
	const initialState = useMemo(() => {
		try {
			const saved = localStorage.getItem("practice-sudoku-save");
			if (saved) return JSON.parse(saved) as GameSaveState;
		} catch (e) {
			console.error("Failed to load saved game", e);
		}
		return null;
	}, []);
	const [initialBoard, setInitialBoard] = useState<Board>(
		() => initialState?.initialBoard ?? emptyBoard(),
	);
	const [board, setBoard] = useState<Board>(
		() => initialState?.board ?? emptyBoard(),
	);
	const [notes, setNotes] = useState<BoardNotes>(
		() => initialState?.notes ?? emptyNotes(),
	);
	const [message, setMessage] = useState("");
	const [hintCell, setHintCell] = useState<HintCell>(null);
	const [level, setLevel] = useState<LevelLabel>(
		() => initialState?.level ?? "Easy",
	);
	const [solvedBoard, setSolvedBoard] = useState<SolvedBoard | null>(
		() => initialState?.solvedBoard ?? null,
	);
	const [animatingValue, setAnimatingValue] = useState<Cell | null>(null);
	const [checkingCells, setCheckingCells] = useState<[number, number][]>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const [elapsed, setElapsed] = useState(() => initialState?.elapsed ?? 0);

	const [past, setPast] = useState<HistoryState[]>(
		() => initialState?.past ?? [],
	);
	const [future, setFuture] = useState<HistoryState[]>(
		() => initialState?.future ?? [],
	);

	const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const checkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const workerRef = useRef<Worker | null>(null);
	const requestIdRef = useRef<number>(0);

	const handleNewSudoku = useCallback((difficulty: Difficulty) => {
		const nextRequestId = ++requestIdRef.current;
		setIsGenerating(true);
		setMessage("");
		setHintCell(null);
		setCheckingCells([]);
		if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
		setLevel(LABEL_MAP[difficulty]);

		if (animTimerRef.current) clearTimeout(animTimerRef.current);
		setAnimatingValue(null);
		setElapsed(0);
		setPast([]);
		setFuture([]);
		setNotes(emptyNotes());

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
					setNotes(emptyNotes());
					setPast([]);
					setFuture([]);
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
						setNotes(emptyNotes());
						setPast([]);
						setFuture([]);
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

		if (!initialState) {
			handleNewSudoku("easy");
		}

		return () => {
			if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
			if (animTimerRef.current) clearTimeout(animTimerRef.current);
			if (workerRef.current) {
				workerRef.current.terminate();
				workerRef.current = null;
			}
		};
	}, [handleNewSudoku, initialState]);

	const handleAnimateSame = useCallback((val: Cell) => {
		if (!val) return;
		setAnimatingValue(val);
		if (animTimerRef.current) clearTimeout(animTimerRef.current);
		animTimerRef.current = setTimeout(() => {
			setAnimatingValue(null);
		}, 3000);
	}, []);

	const handleNotesChange = useCallback(
		(row: number, col: number, val: string) => {
			if (isGenerating) return;

			const sanitized = Array.from(new Set(val.replace(/[^1-9]/g, "")))
				.sort()
				.join("");

			if (notes[row][col] === sanitized) return;

			const nextNotes: BoardNotes = notes.map((r, i) =>
				r.map((c, j) => (i === row && j === col ? sanitized : c)),
			);

			setPast((prev) => [...prev.slice(-(MAX_HISTORY - 1)), { board, notes }]);
			setFuture([]);
			setNotes(nextNotes);
		},
		[board, isGenerating, notes],
	);

	const handleChange = useCallback(
		(row: number, col: number, val: string) => {
			if (isGenerating) return;

			setCheckingCells([]);
			if (checkTimerRef.current) clearTimeout(checkTimerRef.current);

			if (val === "" || /^[1-9]$/.test(val)) {
				const numVal: Cell = val === "" ? "" : Number(val);

				if (numVal === "") {
					if (board[row][col] === "") return;

					const newBoard: Board = board.map((r, i) =>
						r.map((c, j) => (i === row && j === col ? "" : c)),
					);

					setPast((prev) => [
						...prev.slice(-(MAX_HISTORY - 1)),
						{ board, notes },
					]);
					setFuture([]);
					setBoard(newBoard);
					setMessage("");
					return;
				}

				if (board[row][col] === numVal) return;

				const newBoard: Board = board.map((r, i) =>
					r.map((c, j) => (i === row && j === col ? numVal : c)),
				);

				const newNotes = clearPeerNotes(notes, row, col, numVal);

				setPast((prev) => [
					...prev.slice(-(MAX_HISTORY - 1)),
					{ board, notes },
				]);
				setFuture([]);
				setBoard(newBoard);
				setNotes(newNotes);
				if (!isValid(newBoard, row, col, numVal)) {
					setMessage("Invalid move!");
				} else {
					setMessage("");
				}
			} else {
				setMessage("Invalid move!");
			}
		},
		[board, isGenerating, notes],
	);

	const handleCheck = useCallback(() => {
		if (!solvedBoard || isGenerating) return;
		const incorrects: [number, number][] = [];
		for (let i = 0; i < 9; i++) {
			for (let j = 0; j < 9; j++) {
				if (
					board[i][j] !== "" &&
					initialBoard[i][j] === "" &&
					board[i][j] !== solvedBoard[i][j]
				) {
					incorrects.push([i, j]);
				}
			}
		}
		setCheckingCells(incorrects);
		if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
		checkTimerRef.current = setTimeout(() => setCheckingCells([]), 3000);
	}, [board, initialBoard, isGenerating, solvedBoard]);

	const handleHint = useCallback(() => {
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

		const newNotes = clearPeerNotes(notes, row, col, value);

		setPast((prev) => [...prev.slice(-(MAX_HISTORY - 1)), { board, notes }]);
		setFuture([]);
		setBoard(newBoard);
		setNotes(newNotes);
		setHintCell({ row, col });

		if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
		hintTimerRef.current = setTimeout(() => setHintCell(null), 6000);
	}, [board, initialBoard, isGenerating, notes, solvedBoard]);

	useEffect(() => {
		if (isGenerating || !solvedBoard) return;
		const state: GameSaveState = {
			initialBoard,
			board,
			notes,
			level,
			solvedBoard,
			elapsed,
			past,
			future,
		};
		try {
			localStorage.setItem("practice-sudoku-save", JSON.stringify(state));
		} catch (e) {
			console.error("Failed to save game", e);
		}
	}, [
		initialBoard,
		board,
		notes,
		level,
		solvedBoard,
		elapsed,
		past,
		future,
		isGenerating,
	]);

	const isComplete = useMemo(
		() =>
			solvedBoard != null &&
			board.every((row, i) =>
				row.every((cell, j) => cell === solvedBoard[i][j]),
			),
		[board, solvedBoard],
	);

	const completedDigits = useMemo(() => {
		const flatBoard = board.flat();
		return new Set(
			[1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
				(n) => flatBoard.filter((c) => Number(c) === n).length === 9,
			),
		);
	}, [board]);

	// Count-up timer: runs while a puzzle is active, pauses when the tab is hidden.
	// Checking document.hidden inside the tick (rather than adding a separate
	// visibilitychange listener) keeps the logic in one place and avoids the
	// complexity of cancelling/restarting intervals on visibility events.
	const isTimerRunning = !isGenerating && !isComplete;
	useEffect(() => {
		if (!isTimerRunning) return;
		const interval = setInterval(() => {
			if (!document.hidden) setElapsed((s) => s + 1);
		}, 1000);
		return () => clearInterval(interval);
	}, [isTimerRunning]);

	const handleUndo = useCallback(() => {
		if (past.length === 0 || isGenerating || isComplete) return;
		if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
		if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
		setHintCell(null);
		setCheckingCells([]);

		const previous = past[past.length - 1];
		setPast(past.slice(0, -1));
		setFuture([{ board, notes }, ...future]);
		setBoard(previous.board);
		setNotes(previous.notes);
		setMessage("");
	}, [past, future, board, notes, isGenerating, isComplete]);

	const handleRedo = useCallback(() => {
		if (future.length === 0 || isGenerating || isComplete) return;
		if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
		if (checkTimerRef.current) clearTimeout(checkTimerRef.current);
		setHintCell(null);
		setCheckingCells([]);

		const next = future[0];
		setFuture(future.slice(1));
		setPast([...past, { board, notes }]);
		setBoard(next.board);
		setNotes(next.notes);
		setMessage("");
	}, [past, future, board, notes, isGenerating, isComplete]);

	const undoRef = useRef(handleUndo);
	undoRef.current = handleUndo;
	const redoRef = useRef(handleRedo);
	redoRef.current = handleRedo;
	const checkRef = useRef(handleCheck);
	checkRef.current = handleCheck;
	const hintRef = useRef(handleHint);
	hintRef.current = handleHint;
	const newSudokuRef = useRef(handleNewSudoku);
	newSudokuRef.current = handleNewSudoku;
	const levelRef = useRef(level);
	levelRef.current = level;

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.metaKey || e.ctrlKey) {
				const key = e.key.toLowerCase();
				if (key === "z") {
					e.preventDefault();
					if (e.shiftKey) {
						redoRef.current();
					} else {
						undoRef.current();
					}
				} else if (key === "y") {
					e.preventDefault();
					redoRef.current();
				}
				return;
			}

			// Don't intercept shortcuts when user is focused inside an input or textarea
			const target = e.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}

			const key = e.key.toLowerCase();
			if (key === "h") {
				e.preventDefault();
				hintRef.current();
			} else if (key === "c") {
				e.preventDefault();
				checkRef.current();
			} else if (key === "n") {
				e.preventDefault();
				const currentDiff: Difficulty =
					levelRef.current === "Hard"
						? "hard"
						: levelRef.current === "Medium"
							? "medium"
							: "easy";
				newSudokuRef.current(currentDiff);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

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
		elapsed,
		notes,
		checkingCells,
		canUndo: past.length > 0,
		canRedo: future.length > 0,
		handleChange,
		handleNotesChange,
		handleNewSudoku,
		handleHint,
		handleCheck,
		handleAnimateSame,
		handleUndo,
		handleRedo,
	};
}
