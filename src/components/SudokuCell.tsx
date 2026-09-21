import { memo } from "react";
import type { Cell, CellNotes } from "../types/sudoku";
import { cn } from "../utils";

const CELL_BADGE_CLASS =
	"absolute top-[3px] right-[3px] w-[14px] h-[14px] p-0 m-0 border border-blue-500/25 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center cursor-pointer z-[4] transition-all duration-200 hover:bg-blue-500 hover:text-white hover:border-blue-600 hover:scale-125";

interface SudokuCellProps {
	row: number;
	col: number;
	value: Cell;
	notes: CellNotes;
	isInitial: boolean;
	isHint: boolean;
	isInvalid: boolean;
	isAnimating: boolean;
	onChange: (row: number, col: number, val: string) => void;
	onNotesChange: (row: number, col: number, val: string) => void;
	onAnimateSame: (val: Cell) => void;
}

export const SudokuCell = memo(function SudokuCell({
	row,
	col,
	value,
	notes,
	isInitial,
	isHint,
	isInvalid,
	isAnimating,
	onChange,
	onNotesChange,
	onAnimateSame,
}: SudokuCellProps) {
	const cellClass = cn(
		"w-[54px] h-[54px] text-center text-[1.2rem] border border-[#bbb] dark:border-slate-600 outline-none bg-[#f9f9f9] dark:bg-slate-800 transition-colors duration-200 text-black dark:text-white",
		"focus:bg-blue-50 dark:focus:bg-slate-700 disabled:bg-[#e0e0e0] dark:disabled:bg-slate-900 disabled:text-[#333] dark:disabled:text-slate-100 disabled:font-bold",
		(col + 1) % 3 === 0 &&
			"border-r-[3px] border-r-[#333] dark:border-r-slate-400",
		(row + 1) % 3 === 0 &&
			"border-b-[3px] border-b-[#333] dark:border-b-slate-400",
		row % 3 === 0 && "border-t-[3px] border-t-[#333] dark:border-t-slate-400",
		col % 3 === 0 && "border-l-[3px] border-l-[#333] dark:border-l-slate-400",
		isHint &&
			"!bg-[#fff59d] dark:!bg-yellow-900/60 transition-colors duration-500",
		isInvalid &&
			"!border-2 !border-red-500 z-[2] !bg-[#fff59d] dark:!bg-yellow-900/60 focus:!bg-[#fff176] dark:focus:!bg-yellow-800/60",
		isAnimating && "animate-pulse-highlight z-[5] relative",
	);

	const ariaLabel = `Row ${row + 1}, Column ${col + 1}${
		value !== ""
			? `, value ${value}`
			: notes.length > 0
				? `, empty, notes ${notes}`
				: ", empty"
	}`;

	return (
		<td className="relative p-0">
			<input
				data-testid={`cell-${row}-${col}`}
				className={cellClass}
				type="text"
				inputMode="numeric"
				maxLength={1}
				value={value}
				aria-label={ariaLabel}
				aria-invalid={isInvalid}
				onChange={(e) => onChange(row, col, e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Delete" || e.key === "Backspace") {
						onChange(row, col, "");
					}
				}}
				disabled={isInitial}
			/>
			{!isInitial && (
				<input
					data-testid={`notes-input-${row}-${col}`}
					type="text"
					inputMode="numeric"
					maxLength={9}
					value={notes}
					onChange={(e) => onNotesChange(row, col, e.target.value)}
					onClick={(e) => e.stopPropagation()}
					onKeyDown={(e) => e.stopPropagation()}
					className="absolute top-[2px] left-[2px] w-[34px] h-[15px] text-[9px] tracking-tight leading-none text-slate-600 dark:text-slate-300 bg-transparent border border-slate-300/60 dark:border-slate-600/60 hover:border-slate-400 dark:hover:border-slate-500 focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-700 focus:ring-1 focus:ring-blue-400 rounded px-0.5 outline-none z-[3] font-medium"
					title="Candidate notes"
					aria-label={`Row ${row + 1}, Column ${col + 1} notes`}
				/>
			)}
			{value !== "" && (
				<button
					type="button"
					className={CELL_BADGE_CLASS}
					onClick={(e) => {
						e.stopPropagation();
						onAnimateSame(value);
					}}
					title={`Highlight all ${value}s for 3 seconds`}
					aria-label={`Highlight all cells with number ${value}`}
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
		</td>
	);
});
