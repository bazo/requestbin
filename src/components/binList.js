import React from "react";

import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { createBin, loadBins, loadRequests } from "../actions";

const BinList = ({ createBin, loadBins, bins, loadRequests, selectedBin }) => (
	<div>
		<span onClick={createBin} className="btn btn-success">CREATE BIN</span>
		<br />
		<br />
		<span onClick={loadBins} className="btn btn-light">LOAD BINS</span>
		<ul className="nav flex-column">
			{bins.map(bin => {
				let aClass = "nav-link";
				if (selectedBin === bin.HashId) {
					aClass += " active";
				}
				return (
					<li key={bin.ID} className="nav-item">
						<span onClick={() => loadRequests(bin.HashId)} className={aClass}>
							{bin.HashId}
						</span>
					</li>
				);
			})}
		</ul>
	</div>
);

const mapStateToProps = ({ bins }, ownProps) => {
	return bins;
};

const mapDispatchToProps = dispatch => {
	return bindActionCreators({ createBin, loadBins, loadRequests }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(BinList);
