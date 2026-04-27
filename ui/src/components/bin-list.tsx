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
				className="px-4 py-2 bg-cyan-800 hover:bg-cyan-900 dark:bg-cyan-700 dark:hover:bg-cyan-800 text-white rounded cursor-pointer"
			>
				CREATE BIN
			</button>
			<ul className="flex flex-col mt-4">
				{bins.map((bin) => {
					const linkClass =
						selectedBin === bin.ID
							? "block px-3 py-2 rounded text-cyan-400 font-semibold bg-gray-800 dark:bg-gray-700 cursor-pointer"
							: "block px-3 py-2 rounded text-cyan-500 dark:text-cyan-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer";
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
