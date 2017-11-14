import React from 'react';

import LoadingBar from 'react-redux-loading-bar';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { createBin, loadBins } from '../actions';

const BinList = ({ createBin, loadBins }) => (
	<div className="row">
		<aside className="col-lg-2" />
        <a onClick={loadBins}>LOAD BINS</a>
		<a onClick={createBin}>CREATE BIN</a>

    
		<div className="col-lg-10" id="top">
			<br />
			<LoadingBar
				style={{ backgroundColor: '#2e6da4' }}
				showFastActions
			/>
			<br />
			<div id="bottom" />
		</div>
	</div>
);

const mapStateToProps = ({ bins }, ownProps) => {
	return bins;
};

const mapDispatchToProps = dispatch => {
	return bindActionCreators({ createBin, loadBins }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(BinList);
