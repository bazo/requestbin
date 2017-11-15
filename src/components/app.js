import React from 'react';

import LoadingBar from 'react-redux-loading-bar';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {  } from '../actions';

import BinList from './binList';

const App = ({ createBin }) => (
	<div className="row">
		<aside className="col-lg-2">
			<BinList />
		</aside>

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
	return bindActionCreators({  }, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
