import { useEffect, useState } from "react";

type Theme = "system" | "light" | "dark";

function getStoredTheme(): Theme {
	const stored = localStorage.getItem("theme");
	if (stored === "light" || stored === "dark" || stored === "system") {
		return stored;
	}
	return "system";
}

function applyTheme(theme: Theme) {
	const root = document.documentElement;
	if (theme === "dark") {
		root.classList.add("dark");
	} else if (theme === "light") {
		root.classList.remove("dark");
	} else {
		if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
			root.classList.add("dark");
		} else {
			root.classList.remove("dark");
		}
	}
}

export function ThemeSwitcher() {
	const [theme, setTheme] = useState<Theme>(getStoredTheme);

	useEffect(() => {
		applyTheme(theme);
		localStorage.setItem("theme", theme);
	}, [theme]);

	useEffect(() => {
		if (theme !== "system") return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => applyTheme("system");
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, [theme]);

	return (
		<div className="flex items-center bg-gray-800 rounded-full p-1 gap-0.5">
			<button
				onClick={() => setTheme("system")}
				className={`p-1.5 rounded-full cursor-pointer transition-colors ${theme === "system" ? "bg-gray-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
				title="System"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<rect x="2" y="3" width="20" height="14" rx="2" />
					<path d="M8 21h8" />
					<path d="M12 17v4" />
				</svg>
			</button>
			<button
				onClick={() => setTheme("light")}
				className={`p-1.5 rounded-full cursor-pointer transition-colors ${theme === "light" ? "bg-gray-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
				title="Light"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<circle cx="12" cy="12" r="4" />
					<path d="M12 2v2" />
					<path d="M12 20v2" />
					<path d="m4.93 4.93 1.41 1.41" />
					<path d="m17.66 17.66 1.41 1.41" />
					<path d="M2 12h2" />
					<path d="M20 12h2" />
					<path d="m6.34 17.66-1.41 1.41" />
					<path d="m19.07 4.93-1.41 1.41" />
				</svg>
			</button>
			<button
				onClick={() => setTheme("dark")}
				className={`p-1.5 rounded-full cursor-pointer transition-colors ${theme === "dark" ? "bg-gray-600 text-white" : "text-gray-400 hover:text-gray-200"}`}
				title="Dark"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
					<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
					<path d="M19 3v4" />
					<path d="M21 5h-4" />
				</svg>
			</button>
		</div>
	);
}
