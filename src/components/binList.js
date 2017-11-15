import React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createBin, loadBins, loadRequests } from '../actions';

const BinList = ({ createBin, loadBins, bins, loadRequests }) => (
	<div>
		{console.log(bins)}
		<a onClick={createBin}>CREATE BIN</a>
		<br />
		<br />
		<a onClick={loadBins}>LOAD BINS</a>
		<ul>
			{bins.map(bin => {
				return (
					<li key={bin.ID} onClick={() => loadRequests(bin.HashId)}>
						{bin.HashId}
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
