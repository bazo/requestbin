import axios from "axios";
import { FC, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Bin, RequestsResponse } from "../types";

import BinList from "./binList";
import RequestsList from "./requestsList";

const App: FC = () => {
	const [selectedBin, selectBin] = useState("default");

	const expandAll = () => {};
	const collapseAll = () => {};

	const queryClient = useQueryClient();

	const loadBins = useQuery<Bin[]>("bins", async (): Promise<Bin[]> => {
		return (await axios.get<Bin[]>("/api/bins")).data;
	});

	const createBin = useMutation(() => axios.post("/api/bins"), {
		onSuccess: () => {
			queryClient.invalidateQueries("bins");
		},
	});

	const loadRequests = useQuery(
		["bins", selectedBin],
		async () => {
			return (await axios.get<RequestsResponse>(`/api/bins/${selectedBin}`))
				.data;
		}
	);

	const bins = loadBins.data || [];
	const requests = loadRequests.data?.requests || [];

	console.log({ selectedBin, requests });
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
					<RequestsList requests={requests} />
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
