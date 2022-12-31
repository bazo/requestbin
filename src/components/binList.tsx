import { FC } from "react";
import { Bin } from "../types";

interface BinListProps {
	bins: Bin[];
	onBinSelect: (hashId: string) => void;
	onCreateBinClicked: () => void;
}

const BinList: FC<BinListProps> = ({ bins, onBinSelect, onCreateBinClicked }) => {
	const selectedBin = "";

	return (
		<div>
			<span onClick={onCreateBinClicked} className="btn btn-success">
				CREATE BIN
			</span>
			<br />
			<br />
			<ul className="nav flex-column">
				{bins.map((bin) => {
					let aClass = "nav-link";
					if (selectedBin === bin.ID) {
						aClass += " active";
					}
					return (
						<li key={bin.ID} className="nav-item">
							<span onClick={() => onBinSelect(bin.ID)} className={aClass}>
								{bin.ID}
							</span>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default BinList;
