import { FC, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Bin, RequestsResponse } from "../types";

import BinList from "./binList";
import RequestsList from "./requestsList";

const App: FC = () => {
	const [selectedBin, selectBin] = useState("default");
	const [allExpanded, setAllExpanded] = useState(false);

	const expandAll = () => {
		setAllExpanded(true);
	};
	const collapseAll = () => {
		setAllExpanded(false);
	};

	const queryClient = useQueryClient();

	const loadBins = useQuery<Bin[]>("bins", async (): Promise<Bin[]> => {
		return (await fetch("/api/bins")).json();
	});

	const createBin = useMutation(
		() =>
			fetch("/api/bins", {
				method: "POST",
			}),
		{
			onSuccess: () => {
				queryClient.invalidateQueries("bins");
			},
		}
	);

	const loadRequests = useQuery<RequestsResponse>(["bins", selectedBin], async () => {
		return (await fetch(`/api/bins/${selectedBin}`)).json();
	});

	const bins = loadBins.data || [];
	const requests = loadRequests.data?.requests || [];

	return (
		<div className="container-fluid">
			<nav className="navbar navbar-expand-lg navbar navbar-dark bg-dark">
				<a className="navbar-brand" href="/">
					RequestBin
				</a>
			</nav>

			<div className="row">
				<aside className="col-lg-2">
					<BinList
						bins={bins}
						onBinSelect={selectBin}
						onCreateBinClicked={() => createBin.mutate()}
					/>
				</aside>

				<div className="col-lg-10" id="top">
					{/* <LoadingBar style={{ backgroundColor: "#2e6da4" }} showFastActions /> */}
					<h1>
						{/* {window.location.origin + "/" + selectedBin}{" "}
					<i
						className="fa fa-refresh"
						aria-hidden="true"
						onClick={e => {
							loadRequests(selectedBin);
						}}
					/> */}
					</h1>
					<br />
					<span onClick={expandAll} className="btn btn-primary">
						Expand all
					</span>
					&nbsp;&nbsp;&nbsp;&nbsp;
					<span onClick={collapseAll} className="btn btn-primary">
						Collapse all
					</span>
					<br />
					<RequestsList requests={requests} expand={allExpanded} />
					{/* <Pagination
					{...{
						page,
						pagesCount,
						onChangePage: page => {
							loadRequests(selectedBin, page);
						}
					}}
				/> */}
					<br />
					<div id="bottom" />
				</div>
			</div>
		</div>
	);
};

export default App;
