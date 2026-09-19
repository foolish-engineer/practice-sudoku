import { useCallback, useEffect } from "react";
import { isValid } from "../core/sudoku";
import type { Board, BoardNotes, Cell, HintCell } from "../types/sudoku";
import { SudokuCell } from "./SudokuCell";

interface SudokuBoardProps {
	board: Board;
	initialBoard: Board;
	notes: BoardNotes;
	hintCell: HintCell;
	animatingValue: Cell | null;
	isGenerating?: boolean;
	onChange: (row: number, col: number, val: string) => void;
	onNotesChange: (row: number, col: number, val: string) => void;
	onAnimateSame: (val: Cell) => void;
}

export function SudokuBoard({
	board,
	initialBoard,
	notes,
	hintCell,
	animatingValue,
	isGenerating = false,
	onChange,
	onNotesChange,
	onAnimateSame,
}: SudokuBoardProps) {
	// Move focus to the hint cell whenever a hint is applied
	useEffect(() => {
		if (!hintCell) return;
		document
			.querySelector<HTMLElement>(
				`[data-testid="cell-${hintCell.row}-${hintCell.col}"]`,
			)
			?.focus();
	}, [hintCell]);

	// Arrow-key navigation via event delegation — one handler on the grid
	// container instead of 81 individual handlers, keeping SudokuCell props stable.
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLTableElement>) => {
			const target = e.target as HTMLElement;
			const testId = target.dataset.testid;
			if (!testId?.startsWith("cell-")) return;

			const parts = testId.split("-");
			const row = Number(parts[1]);
			const col = Number(parts[2]);

			let dRow = 0;
			let dCol = 0;

			switch (e.key) {
				case "ArrowUp":
					dRow = -1;
					break;
				case "ArrowDown":
					dRow = 1;
					break;
				case "ArrowLeft":
					dCol = -1;
					break;
				case "ArrowRight":
					dCol = 1;
					break;
				default:
					return;
			}

			e.preventDefault();
			for (let step = 1; step < 9; step++) {
				const targetRow = (row + dRow * step + 9) % 9;
				const targetCol = (col + dCol * step + 9) % 9;
				const el = document.querySelector<HTMLInputElement>(
					`[data-testid="cell-${targetRow}-${targetCol}"]`,
				);
				if (el && !el.disabled) {
					el.focus();
					break;
				}
			}
		},
		[],
	);

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
			<table
				aria-label="Sudoku puzzle"
				aria-busy={isGenerating}
				onKeyDown={handleKeyDown}
			>
				<tbody>
					{board.map((row, i) => (
						<tr key={`row-${i}`}>
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
										notes={notes[i][j]}
										isInitial={isInitial}
										isHint={isHint}
										isInvalid={isInvalid}
										isAnimating={isAnimating}
										onChange={onChange}
										onNotesChange={onNotesChange}
										onAnimateSame={onAnimateSame}
									/>
								);
							})}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
