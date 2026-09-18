/** Merges class names, filtering out falsy values. */
export function cn(
	...classes: (string | boolean | undefined | null)[]
): string {
	return classes.filter(Boolean).join(" ");
}

/** Formats elapsed seconds as M:SS (e.g. 0:00, 1:04, 12:30). */
export function formatTime(totalSeconds: number): string {
	const m = Math.floor(totalSeconds / 60);
	const s = totalSeconds % 60;
	return `${m}:${s.toString().padStart(2, "0")}`;
}
