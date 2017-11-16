import React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createBin, loadBins, loadRequests } from '../actions';

const BinList = ({ createBin, loadBins, bins, loadRequests, selectedBin }) => (
	<div>
		<a onClick={createBin}>CREATE BIN</a>
		<br />
		<br />
		<a onClick={loadBins}>LOAD BINS</a>
		<ul className="nav flex-column">
			{bins.map(bin => {
				let aClass = 'nav-link';
				if(selectedBin === bin.HashId) {
					aClass += ' active';
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
	console.log(bins);
	return bins;
};

const mapDispatchToProps = dispatch => {
	return bindActionCreators({ createBin, loadBins, loadRequests }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(BinList);
