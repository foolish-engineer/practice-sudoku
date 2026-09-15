import { isValid } from "../core/sudoku";
import type { Board, Cell, HintCell } from "../types/sudoku";
import { SudokuCell } from "./SudokuCell";

interface SudokuBoardProps {
	board: Board;
	initialBoard: Board;
	hintCell: HintCell;
	animatingValue: Cell | null;
	isGenerating?: boolean;
	onChange: (row: number, col: number, val: string) => void;
	onAnimateSame: (val: Cell) => void;
}

export function SudokuBoard({
	board,
	initialBoard,
	hintCell,
	animatingValue,
	isGenerating = false,
	onChange,
	onAnimateSame,
}: SudokuBoardProps) {
	return (
		<div className="my-6 inline-block relative">
			{isGenerating && (
				<div
					data-testid="generating-overlay"
					className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-lg z-20"
					role="status"
					aria-live="polite"
				>
					<div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" />
					<span className="text-sm font-semibold text-gray-700">
						Generating puzzle...
					</span>
				</div>
			)}
			{board.map((row, i) => (
				<div key={`row-${i}`} className="flex justify-center">
					{row.map((cell, j) => {
						const isInitial = initialBoard[i][j] !== "";
						const isUserCell = !isInitial && cell !== "";
						const isInvalid = isUserCell && !isValid(board, i, j, cell);
						const isHint = Boolean(
							hintCell && hintCell.row === i && hintCell.col === j,
						);
						const isAnimating = Boolean(
							animatingValue !== null &&
								cell !== "" &&
								Number(cell) === Number(animatingValue),
						);

						return (
							<SudokuCell
								key={`cell-wrap-${i}-${j}`}
								row={i}
								col={j}
								value={cell}
								isInitial={isInitial}
								isHint={isHint}
								isInvalid={isInvalid}
								isAnimating={isAnimating}
								onChange={onChange}
								onAnimateSame={onAnimateSame}
							/>
						);
					})}
				</div>
			))}
		</div>
	);
}
