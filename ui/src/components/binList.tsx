import type { Bin } from "../types";

interface BinListProps {
	bins: Bin[];
	onBinSelect: (hashId: string) => void;
	onCreateBinClicked: () => void;
}

export function BinList({
	bins,
	onBinSelect,
	onCreateBinClicked,
}: BinListProps) {
	const selectedBin = "";

	return (
		<div>
			<button
				onClick={onCreateBinClicked}
				className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded cursor-pointer"
			>
				CREATE BIN
			</button>
			<ul className="flex flex-col mt-4">
				{bins.map((bin) => {
					const linkClass =
						selectedBin === bin.ID
							? "block px-3 py-2 rounded text-indigo-400 font-semibold bg-gray-800 dark:bg-gray-700 cursor-pointer"
							: "block px-3 py-2 rounded text-indigo-500 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer";
					return (
						<li key={bin.ID}>
							<span
								onClick={() => onBinSelect(bin.ID)}
								className={linkClass}
							>
								{bin.ID}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
