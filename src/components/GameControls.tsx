import { memo } from "react";
import type { Difficulty } from "../types/sudoku";
import { cn } from "../utils";

// Shared disabled state — every button variant uses the same disabled appearance
const BTN_DISABLED =
	"disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none";

export const BTN_BASE = `px-5 py-2.5 border-none rounded-lg text-base font-semibold cursor-pointer text-white transition-all duration-200 shadow-[0_2px_4px_rgba(0,0,0,0.1)] hover:-translate-y-[1px] hover:shadow-[0_4px_8px_rgba(0,0,0,0.15)] active:translate-y-[1px] active:shadow-[0_1px_2px_rgba(0,0,0,0.1)] ${BTN_DISABLED}`;

export const BTN_VARIANTS = {
	easy: "bg-green-500 hover:bg-green-600",
	medium: "bg-orange-500 hover:bg-orange-600",
	hard: "bg-red-500 hover:bg-red-600",
	hint: "bg-blue-500 hover:bg-blue-600",
	action: "bg-slate-500 hover:bg-slate-600",
};

interface GameControlsProps {
	onSelectDifficulty: (difficulty: Difficulty) => void;
	disabled?: boolean;
}

export const GameControls = memo(function GameControls({
	onSelectDifficulty,
	disabled = false,
}: GameControlsProps) {
	return (
		<div className="mb-4 flex gap-2 justify-center">
			<button
				className={cn(BTN_BASE, BTN_VARIANTS.easy)}
				type="button"
				onClick={() => onSelectDifficulty("easy")}
				disabled={disabled}
			>
				New Easy
			</button>
			<button
				className={cn(BTN_BASE, BTN_VARIANTS.medium)}
				type="button"
				onClick={() => onSelectDifficulty("medium")}
				disabled={disabled}
			>
				New Medium
			</button>
			<button
				className={cn(BTN_BASE, BTN_VARIANTS.hard)}
				type="button"
				onClick={() => onSelectDifficulty("hard")}
				disabled={disabled}
			>
				New Hard
			</button>
		</div>
	);
});
