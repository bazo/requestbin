import { JSONTree } from "react-json-tree";
//@ts-ignore
import Code from "./code";
import moment from "moment";
import HideText from "./hideText";
import { FC } from "react";
import { Request } from "types";

const List = ({ items }: {items: Record<string, string>}) => {
	const result = [];
	for (const item in items) {
		const value = items[item];
		result.push(
			<li key={item}>
				<strong>{item}:</strong> {value}
			</li>,
		);
	}
	return <ul>{result}</ul>;
};

const Body = ({ body, contentType, expand }:{ body: string, contentType: string, expand: boolean }) => {
	if (contentType === "application/json") {
		return (
			<JSONTree
				data={JSON.parse(body)}
				hideRoot={true}
				shouldExpandNode={(keyName, data, level) => {
					return expand;
				}}
				valueRenderer={(raw) => <HideText text={raw} maxLength={200} />}
			/>
		);
	}

	return <Code codeString={body} />;
};

const Time = ({ time }: { time: string }) => {
	const requestTime = moment(time);
	const now = moment();

	const diff = now.diff(requestTime, "hours");

	if (diff <= 1) {
		return <>{requestTime.from(now)}</>;
	} else {
		return <>{requestTime.format("DD.MM.YYYY HH:MM:SS")}</>;
	}
};

function getContentType(request: Request) {
	if (request.Header["Content-Type"] !== undefined) {
		return request.Header["Content-Type"][0];
	}

	return "text/plain";
}

interface RequestsListProps {
	requests: Request[];
	expand: boolean
}

const RequestsList: FC<RequestsListProps> = ({ requests, expand }) => (
	<div>
		{requests.map((request) => {
			return (
				<div
					className="jumbotron"
					key={request.ID}
					style={{ padding: "2rem 1rem" }}
					onClick={() => {
						//this is a feature, not debug info
						console.log(request);
					}}
				>
					<h6>
						<strong>{request.Method}</strong>
						{request.RequestURI} {request.Proto}{" "}
						<i className="fa fa-file-code-o" aria-hidden="true" /> {request.Header["Content-Type"]}{" "}
						FROM {request.RemoteAddr}{" "}
						<span className="pull-right">
							<Time time={request.Time} />
							{"   "}
							<small>{request.ID} </small>
						</span>
					</h6>
					<hr className="my-4" />
					<div className="row">
						<div className="col-lg-6">
							FORM/POST PARAMETERS:
							<br />
							<List items={request.PostForm} />{" "}
						</div>

						<div className="col-lg-6">
							HEADERS:
							<br />
							<List items={request.Header} />
						</div>
					</div>
					<div className="row">
						<div className="col-lg-12">
							BODY:
							<Body body={request.Body} contentType={getContentType(request)} expand={expand} />
						</div>
					</div>
				</div>
			);
		})}
	</div>
);

export default RequestsList;
