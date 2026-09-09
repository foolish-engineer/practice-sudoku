interface CompletedDigitsProps {
	completedDigits: Set<number>;
}

export function CompletedDigits({ completedDigits }: CompletedDigitsProps) {
	return (
		<div className="mt-3 mb-1 min-h-[50px]">
			{completedDigits.size > 0 && (
				<>
					<div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
						Completed
					</div>
					<div className="flex gap-1.5 justify-center flex-wrap">
						{[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) =>
							completedDigits.has(n) ? (
								<span
									key={n}
									className="w-7 h-7 rounded-full bg-green-500 text-white text-sm font-bold flex items-center justify-center shadow-sm"
								>
									{n}
								</span>
							) : null,
						)}
					</div>
				</>
			)}
		</div>
	);
}
