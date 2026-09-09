import type { Cell } from "../types/sudoku";
import { cn } from "../utils/cn";

const CELL_BADGE_CLASS =
	"absolute top-[3px] right-[3px] w-[14px] h-[14px] p-0 m-0 border border-blue-500/25 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center cursor-pointer z-[4] transition-all duration-200 hover:bg-blue-500 hover:text-white hover:border-blue-600 hover:scale-125";

interface SudokuCellProps {
	row: number;
	col: number;
	value: Cell;
	isInitial: boolean;
	isHint: boolean;
	isInvalid: boolean;
	isAnimating: boolean;
	onChange: (row: number, col: number, val: string) => void;
	onAnimateSame: (val: Cell) => void;
}

export function SudokuCell({
	row,
	col,
	value,
	isInitial,
	isHint,
	isInvalid,
	isAnimating,
	onChange,
	onAnimateSame,
}: SudokuCellProps) {
	const cellClass = cn(
		"w-[54px] h-[54px] text-center text-[1.2rem] border border-[#bbb] outline-none bg-[#f9f9f9] transition-colors duration-200 text-black",
		"focus:bg-blue-50 disabled:bg-[#e0e0e0] disabled:text-[#333] disabled:font-bold",
		(col + 1) % 3 === 0 && "border-r-[3px] border-r-[#333]",
		(row + 1) % 3 === 0 && "border-b-[3px] border-b-[#333]",
		row % 3 === 0 && "border-t-[3px] border-t-[#333]",
		col % 3 === 0 && "border-l-[3px] border-l-[#333]",
		isHint && "!bg-[#fff59d] transition-colors duration-500",
		isInvalid &&
			"!border-2 !border-red-500 z-[2] !bg-[#fff59d] focus:!bg-[#fff176]",
		isAnimating && "animate-pulse-highlight z-[5] relative",
	);

	return (
		<div className="relative inline-flex">
			<input
				className={cellClass}
				type="text"
				maxLength={1}
				value={value}
				onChange={(e) => onChange(row, col, e.target.value)}
				disabled={isInitial}
			/>
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
		</div>
	);
}
