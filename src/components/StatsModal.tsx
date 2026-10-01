import { useEffect, useState } from "react";
import { getOverallStats, getWinRate } from "../core/stats";
import type { Difficulty, DifficultyStats, SudokuStats } from "../types/sudoku";
import { cn, formatTime } from "../utils";

export interface StatsModalProps {
	isOpen: boolean;
	onClose: () => void;
	stats: SudokuStats;
	onResetStats: () => void;
	initialDifficulty?: Difficulty;
}

type TabType = "overall" | Difficulty;

const TABS: { id: TabType; label: string }[] = [
	{ id: "overall", label: "Overall" },
	{ id: "easy", label: "Easy" },
	{ id: "medium", label: "Medium" },
	{ id: "hard", label: "Hard" },
];

export function StatsModal({
	isOpen,
	onClose,
	stats,
	onResetStats,
	initialDifficulty = "easy",
}: StatsModalProps) {
	const [activeTab, setActiveTab] = useState<TabType>(initialDifficulty);
	const [confirmReset, setConfirmReset] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setConfirmReset(false);
		}
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				onClose();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	const currentStats: DifficultyStats =
		activeTab === "overall" ? getOverallStats(stats) : stats[activeTab];

	const winRate = getWinRate(currentStats);
	const formattedBestTime =
		currentStats.bestTime !== null
			? formatTime(currentStats.bestTime)
			: "--:--";

	const handleResetClick = () => {
		if (confirmReset) {
			onResetStats();
			setConfirmReset(false);
		} else {
			setConfirmReset(true);
		}
	};

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150"
			data-testid="stats-modal-backdrop"
		>
			<button
				type="button"
				tabIndex={-1}
				aria-label="Close backdrop"
				className="fixed inset-0 w-full h-full cursor-default bg-transparent border-0"
				onClick={onClose}
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="stats-modal-title"
				data-testid="stats-modal"
				className="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 text-center border border-gray-100 dark:border-slate-700 transition-colors"
			>
				{/* Close Button */}
				<button
					type="button"
					onClick={onClose}
					className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold p-1 rounded-full transition-colors"
					aria-label="Close statistics"
					data-testid="close-stats-button"
				>
					✕
				</button>

				<h2
					id="stats-modal-title"
					className="text-2xl font-bold mb-4 text-gray-800 dark:text-slate-100"
				>
					Statistics
				</h2>

				{/* Tabs */}
				<div
					className="flex p-1 mb-6 bg-gray-100 dark:bg-slate-700 rounded-lg"
					role="tablist"
					aria-label="Difficulty selection"
				>
					{TABS.map((tab) => (
						<button
							key={tab.id}
							type="button"
							role="tab"
							aria-selected={activeTab === tab.id}
							data-testid={`stats-tab-${tab.id}`}
							onClick={() => {
								setActiveTab(tab.id);
								setConfirmReset(false);
							}}
							className={cn(
								"flex-1 py-1.5 text-sm font-semibold rounded-md transition-all duration-150",
								activeTab === tab.id
									? "bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm"
									: "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white",
							)}
						>
							{tab.label}
						</button>
					))}
				</div>

				{/* Stats Grid */}
				<div className="grid grid-cols-2 gap-3 mb-6">
					<div
						data-testid="stat-played"
						className="p-3 bg-gray-50 dark:bg-slate-750 border border-gray-100 dark:border-slate-700 rounded-xl"
					>
						<div className="text-2xl font-black text-gray-800 dark:text-slate-100">
							{currentStats.gamesPlayed}
						</div>
						<div className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mt-1">
							Played
						</div>
					</div>

					<div
						data-testid="stat-won"
						className="p-3 bg-gray-50 dark:bg-slate-750 border border-gray-100 dark:border-slate-700 rounded-xl"
					>
						<div className="text-2xl font-black text-gray-800 dark:text-slate-100">
							{currentStats.gamesWon}
						</div>
						<div className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mt-1">
							Won
						</div>
					</div>

					<div
						data-testid="stat-win-rate"
						className="p-3 bg-gray-50 dark:bg-slate-750 border border-gray-100 dark:border-slate-700 rounded-xl"
					>
						<div className="text-2xl font-black text-gray-800 dark:text-slate-100">
							{winRate}%
						</div>
						<div className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mt-1">
							Win Rate
						</div>
					</div>

					<div
						data-testid="stat-best-time"
						className="p-3 bg-gray-50 dark:bg-slate-750 border border-gray-100 dark:border-slate-700 rounded-xl"
					>
						<div className="text-2xl font-black text-gray-800 dark:text-slate-100">
							{formattedBestTime}
						</div>
						<div className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mt-1">
							Best Time
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-700">
					<button
						type="button"
						onClick={handleResetClick}
						data-testid="reset-stats-button"
						className={cn(
							"text-xs px-3 py-1.5 rounded transition-colors font-medium",
							confirmReset
								? "bg-red-600 hover:bg-red-700 text-white font-bold"
								: "text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400",
						)}
					>
						{confirmReset ? "Confirm Reset?" : "Reset Stats"}
					</button>

					<button
						type="button"
						onClick={onClose}
						className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
					>
						Close
					</button>
				</div>
			</div>
		</div>
	);
}
