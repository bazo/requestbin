import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { BinList } from "./binList";
import { Pagination } from "./pagination";
import { RequestsList } from "./requestsList";
import { ThemeSwitcher } from "./themeSwitcher";
import { BinResponseSchema, BinSchema, RequestsResponseSchema } from "../types";

export function App() {
	console.log(import.meta.env);
	const [selectedBin, selectBin] = useState("default");
	const [allExpanded, setAllExpanded] = useState(false);
	const [page, setPage] = useState(1);

	const expandAll = () => {
		setAllExpanded(true);
	};
	const collapseAll = () => {
		setAllExpanded(false);
	};

	const queryClient = useQueryClient();

	const loadBins = useQuery({
		queryKey: ["bins"],
		queryFn: async () => {
			const res = await fetch("/api/bins");
			const json = await res.json();
			return BinResponseSchema.parse(json);
		},
	});

	const createBin = useMutation({
		mutationFn: async () => {
			const res = await fetch("/api/bins", {
				method: "POST",
			});
			const json = await res.json();
			return BinSchema.parse(json);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["bins"] });
		},
	});

	const loadRequests = useQuery({
		queryKey: ["bins", selectedBin, page],
		queryFn: async () => {
			const res = await fetch(`/api/bins/${selectedBin}?page=${page}`);
			const json = await res.json();
			const parsed = RequestsResponseSchema.safeParse(json);
			if (parsed.success) {
				return parsed.data;
			}

			console.error("Failed to parse requests response", parsed.error);
		},
	});

	const bins = loadBins.data || [];
	const requests = loadRequests.data?.requests || [];

	return (
		<div className="w-full">
			<nav className="flex items-center gap-3 bg-gray-900 px-4 py-3 mb-4">
				<img src="/logo.svg" alt="RequestBin" className="h-8 w-8" />
				<a
					className="text-white text-xl font-bold no-underline"
					href="/"
				>
					RequestBin
				</a>
				<div className="ml-auto">
					<ThemeSwitcher />
				</div>
			</nav>

			<div className="flex flex-col lg:flex-row gap-4 px-4">
				<aside className="lg:w-1/6">
					<BinList
						bins={bins}
						onBinSelect={selectBin}
						onCreateBinClicked={createBin.mutate}
					/>
				</aside>

				<div className="lg:w-5/6" id="top">
					{selectedBin} 
					<div className="flex gap-4 mb-4">
						<button
							onClick={expandAll}
							className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded cursor-pointer"
						>
							Expand all
						</button>
						<button
							onClick={collapseAll}
							className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded cursor-pointer"
						>
							Collapse all
						</button>
					</div>
					<RequestsList requests={requests} expand={allExpanded} />
					<Pagination
						{...{
							page: loadRequests.data?.page || 1,
							pagesCount: loadRequests.data?.pagesCount || 1,
							onChangePage: (page: number) => {
								setPage(page);
							},
						}}
					/>
					<div id="bottom" />
				</div>
			</div>
		</div>
	);
}
