import React from 'react';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import JSONTree from 'react-json-tree';
import Code from 'react-code-prettify';
import moment from 'moment';

const List = ({ items }) => {
	let result = [];
	for (let item in items) {
		const value = items[item];
		result.push(
			<li key={item}>
				<strong>{item}:</strong> {value}
			</li>
		);
	}
	return <ul>{result}</ul>;
};

const Body = ({ body, contentType, expand }) => {
	if (contentType === 'application/json') {
		return (
			<JSONTree
				data={JSON.parse(body)}
				hideRoot={true}
				shouldExpandNode={(keyName, data, level) => {
					return expand || false;
				}}
			/>
		);
	}

	return <Code codeString={body} />;
};

const Time = ({ time }) => {
	const requestTime = moment(time);
	const now = moment();

	const diff = now.diff(requestTime, 'hours');

	if (diff <= 1) {
		return requestTime.from(now);
	} else {
		return requestTime.format('DD.MM.YYYY HH:MM:SS');
	}
};

function getContentType(request) {
	if (request.Header['Content-Type'] !== undefined) {
		return request.Header['Content-Type'][0];
	}

	return 'text/plain';
}

const RequestsList = ({ requests, expandAll }) => (
	<div>
		{requests.map(request => {
			return (
				<div
					className="jumbotron"
					key={request.ID}
					style={{ padding: '2rem 1rem' }}
					onClick={() => {
						console.log(request);
					}}
				>
					<h6>
						<strong>{request.Method}</strong>
						{request.RequestURI} {request.Proto}{' '}
						<i
							className="fa fa-file-code-o"
							aria-hidden="true"
						/>{' '}
						{request.Header['Content-Type']} FROM{' '}
						{request.RemoteAddr}{' '}
						<span className="pull-right">
							<Time time={request.Time} />
							{'   '}
							<small>{request.ID} </small>
						</span>
					</h6>
					<hr className="my-4" />
					<div className="row">
						<div className="col-lg-6">
							FORM/POST PARAMETERS:<br />
							<List items={request.PostForm} />{' '}
						</div>

						<div className="col-lg-6">
							HEADERS:<br />
							<List items={request.Header} />
						</div>
					</div>
					<div className="row">
						<div className="col-lg-12">
							BODY:
							<Body
								body={request.Body}
								contentType={getContentType(request)}
								expand={expandAll}
							/>
						</div>
					</div>
				</div>
			);
		})}
	</div>
);

const mapStateToProps = ({ bins }, ownProps) => {
	return bins;
};

const mapDispatchToProps = dispatch => {
	return bindActionCreators({}, dispatch);
};

export default connect(mapStateToProps, mapDispatchToProps)(RequestsList);
