import { useState } from "react";

import { BinList } from "./components/bin-list";
import { Pagination } from "./components/pagination";
import { RequestsList } from "./components/requests-list";
import { ThemeSwitcher } from "./components/theme-switcher";
import { BinUrl } from "./components/bin-url";
import { useCreateBin, useLoadBins, useLoadRequests } from "./api";

export function App() {
	const [selectedBin, selectBin] = useState("default");
	const [allExpanded, setAllExpanded] = useState(false);
	const [page, setPage] = useState(1);

	const expandAll = () => {
		setAllExpanded(true);
	};
	const collapseAll = () => {
		setAllExpanded(false);
	};

	const loadBins = useLoadBins();
	const loadRequests = useLoadRequests(selectedBin, page);

	const createBin = useCreateBin();

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
					<div className="flex items-center gap-4 mb-4">
						<BinUrl binId={selectedBin} />
						{requests.length > 0 ? (
							<>
								<button
									onClick={expandAll}
									className="px-3 py-2 bg-cyan-800 hover:bg-cyan-900 dark:bg-cyan-700 dark:hover:bg-cyan-800 text-white text-sm rounded cursor-pointer"
								>
									Expand all
								</button>
								<button
									onClick={collapseAll}
									className="px-3 py-2 bg-cyan-800 hover:bg-cyan-900 dark:bg-cyan-700 dark:hover:bg-cyan-800 text-white text-sm rounded cursor-pointer"
								>
									Collapse all
								</button>
							</>
						) : null}
					</div>
					<RequestsList requests={requests} expand={allExpanded} />
					<Pagination
						page={loadRequests.data?.page || 1}
						pagesCount={loadRequests.data?.pagesCount || 1}
						onPageChange={setPage}
					/>
				</div>
			</div>
		</div>
	);
}
