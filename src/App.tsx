import { CompletedDigits } from "./components/CompletedDigits";
import {
	BTN_BASE,
	BTN_VARIANTS,
	GameControls,
} from "./components/GameControls";
import { SudokuBoard } from "./components/SudokuBoard";
import { useSudokuGame } from "./hooks/useSudokuGame";
import { cn, formatTime } from "./utils";

// Re-export core algorithms and types for backwards compatibility
export * from "./core/sudoku";
export * from "./types/sudoku";

function App() {
	const {
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
		handleChange,
		handleNotesChange,
		handleNewSudoku,
		handleHint,
		handleAnimateSame,
		handleUndo,
		handleRedo,
		canUndo,
		canRedo,
	} = useSudokuGame();

	return (
		<div className="max-w-[600px] w-full p-8 bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.08)] text-center mx-auto">
			<h1>Sudoku</h1>
			<div className="relative mb-2 flex items-center justify-center font-bold text-[1.1em]">
				<div>
					Level: <span data-testid="sudoku-level-label">{level}</span>
				</div>
				<span
					data-testid="timer"
					className={cn(
						"absolute right-0 font-mono font-normal text-[0.95em] tabular-nums",
						isComplete ? "text-green-600 font-semibold" : "text-gray-400",
					)}
				>
					{formatTime(elapsed)}
				</span>
			</div>

			<GameControls
				onSelectDifficulty={handleNewSudoku}
				disabled={isGenerating}
			/>

			<SudokuBoard
				board={board}
				initialBoard={initialBoard}
				notes={notes}
				hintCell={hintCell}
				animatingValue={animatingValue}
				isGenerating={isGenerating}
				onChange={handleChange}
				onNotesChange={handleNotesChange}
				onAnimateSame={handleAnimateSame}
			/>

			<div className="my-4 flex gap-2 justify-center">
				<button
					data-testid="undo-button"
					className={cn(BTN_BASE, BTN_VARIANTS.action)}
					type="button"
					onClick={handleUndo}
					disabled={!canUndo || isComplete || isGenerating}
					title="Undo (Ctrl+Z or ⌘Z)"
					aria-label="Undo move"
				>
					Undo
				</button>
				<button
					data-testid="hint-button"
					className={cn(BTN_BASE, BTN_VARIANTS.hint)}
					type="button"
					onClick={handleHint}
					disabled={isComplete || isGenerating}
				>
					Get Hint
				</button>
				<button
					data-testid="redo-button"
					className={cn(BTN_BASE, BTN_VARIANTS.action)}
					type="button"
					onClick={handleRedo}
					disabled={!canRedo || isComplete || isGenerating}
					title="Redo (Ctrl+Shift+Z or ⌘Shift+Z)"
					aria-label="Redo move"
				>
					Redo
				</button>
			</div>

			<div
				data-testid="status-message"
				className="text-red-600 min-h-[1.5em] mb-2"
			>
				{message || (isComplete ? "Congratulations! Puzzle complete." : "")}
			</div>

			<CompletedDigits completedDigits={completedDigits} />

			<div className="text-[0.95em] text-gray-500 mt-3">
				Fill every row, column, and 3×3 box with numbers 1–9.
			</div>
		</div>
	);
}

export default App;
