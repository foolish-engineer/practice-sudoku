import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export function useTheme() {
	const [theme, setTheme] = useState<Theme>(() => {
		try {
			return (localStorage.getItem("theme") as Theme) || "system";
		} catch {
			return "system";
		}
	});

	useEffect(() => {
		const root = window.document.documentElement;
		root.classList.remove("light", "dark");

		if (theme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
				.matches
				? "dark"
				: "light";
			root.classList.add(systemTheme);
		} else {
			root.classList.add(theme);
		}

		try {
			localStorage.setItem("theme", theme);
		} catch (e) {
			console.error("Failed to save theme preference", e);
		}
	}, [theme]);

	return { theme, setTheme };
}
