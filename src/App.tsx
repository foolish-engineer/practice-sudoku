import { CompletedDigits } from "./components/CompletedDigits";
import {
	BTN_BASE,
	BTN_VARIANTS,
	GameControls,
} from "./components/GameControls";
import { SudokuBoard } from "./components/SudokuBoard";
import { useSudokuGame } from "./hooks/useSudokuGame";
import { cn } from "./utils/cn";

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
		handleChange,
		handleNewSudoku,
		handleHint,
		handleAnimateSame,
	} = useSudokuGame();

	return (
		<div className="max-w-[600px] w-full p-8 bg-white rounded-xl shadow-[0_2px_16px_rgba(0,0,0,0.08)] text-center mx-auto">
			<h1>Sudoku</h1>
			<div className="mb-2 text-center font-bold text-[1.1em]">
				Level: <span data-testid="sudoku-level-label">{level}</span>
			</div>

			<GameControls onSelectDifficulty={handleNewSudoku} />

			<SudokuBoard
				board={board}
				initialBoard={initialBoard}
				hintCell={hintCell}
				animatingValue={animatingValue}
				onChange={handleChange}
				onAnimateSame={handleAnimateSame}
			/>

			<div className="my-4 text-center">
				<button
					className={cn(BTN_BASE, BTN_VARIANTS.hint)}
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

			<CompletedDigits completedDigits={completedDigits} />

			<div className="text-[0.95em] text-gray-500 mt-3">
				Fill every row, column, and 3×3 box with numbers 1–9.
			</div>
		</div>
	);
}

export default App;
