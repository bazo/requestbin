import React from "react";

import LoadingBar from "react-redux-loading-bar";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { loadRequests, expandAll, collapseAll } from "../actions";
import BinList from "./binList";
import RequestsList from "./requestsList";
import Pagination from "./pagination";

const App = ({ selectedBin, loadRequests, expandAll, collapseAll, page, pagesCount }) => (
	<div className="container-fluid">
		<nav className="navbar navbar-expand-lg navbar navbar-dark bg-dark">
			<a className="navbar-brand" href="/">
				RequestBin
			</a>
		</nav>

		<div className="row">
			<aside className="col-lg-2">
				<BinList />
			</aside>

			<div className="col-lg-10" id="top">
				<LoadingBar style={{ backgroundColor: "#2e6da4" }} showFastActions />
				<h1>
					{window.location.origin + "/" + selectedBin}{" "}
					<i
						className="fa fa-refresh"
						aria-hidden="true"
						onClick={e => {
							loadRequests(selectedBin);
						}}
					/>
				</h1>
				<br />
				<span onClick={expandAll} className="btn btn-primary">
					Expand all
				</span>&nbsp;&nbsp;&nbsp;&nbsp;<span onClick={collapseAll} className="btn btn-primary">
					Collapse all
				</span>
				<br />
				<RequestsList />
				<Pagination
					{...{
						page,
						pagesCount,
						onChangePage: page => {
							loadRequests(selectedBin, page);
						}
					}}
				/>
				<br />
				<div id="bottom" />
			</div>
		</div>
	</div>
);

const mapStateToProps = ({ bins }, ownProps) => {
	return bins;
};

const mapDispatchToProps = dispatch => {
	return bindActionCreators({ loadRequests, expandAll, collapseAll }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
