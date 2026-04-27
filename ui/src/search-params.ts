import { useState } from "react";

export function useSearchParams() {
	const [search, setSearch] = useState(window.location.search);
	const params = new URLSearchParams(search);

	const setParams = (newParams: Record<string, string | number | null>) => {
		const current = new URLSearchParams(window.location.search);
		for (const [key, value] of Object.entries(newParams)) {
			if (value === null) {
				current.delete(key);
			} else {
				current.set(key, String(value));
			}
		}

		const qs = `?${current.toString()}`;
		window.history.replaceState({}, "", `${window.location.pathname}${qs}`);
		setSearch(qs);
	};

	return { params: Object.fromEntries(params.entries()), setParams };
}
