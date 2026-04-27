import { JSONTree } from "react-json-tree";
import Code from "./code";
import moment from "moment";
import { HideText } from "./hideText";
import type { Request } from "../types";

function List({ items }: { items: Record<string, string | string[]> }) {
	const result = [];
	for (const item in items) {
		const value = items[item];
		result.push(
			<li key={item}>
				{Array.isArray(value) ? value.join(", ") : value}
			</li>,
		);
	}
	return <ul>{result}</ul>;
}

function Body({
	body,
	contentType,
	expand,
}: {
	body: string;
	contentType: string;
	expand: boolean;
}) {
	if (contentType === "application/json") {
		return (
			<JSONTree
				data={JSON.parse(body)}
				hideRoot={true}
				shouldExpandNodeInitially={() => expand}
				valueRenderer={(raw) => (
					<HideText text={raw as string} maxLength={200} />
				)}
			/>
		);
	}

	return <Code codeString={body} />;
}

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
	expand: boolean;
}

export function RequestsList({ requests, expand }: RequestsListProps) {
	return (
		<div className="space-y-4">
			{requests.length === 0 && (
				<div className="text-center text-gray-500 dark:text-gray-400">
					No requests yet
				</div>
			)}

			{requests.map((request) => {
				return (
					<div
						className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-6"
						key={request.ID}
						onClick={() => {
							//this is a feature, not debug info
							console.log(request);
						}}
					>
						<h6 className="text-sm font-semibold">
							<strong>{request.Method}</strong>
							{request.RequestURI} {request.Proto}{" "}
							{request.Header["Content-Type"]} FROM{" "}
							{request.RemoteAddr}{" "}
							<span className="float-right">
								<Time time={request.Time} />
								{"   "}
								<small className="text-xs text-gray-500 dark:text-gray-400">
									{request.ID}{" "}
								</small>
							</span>
						</h6>
						<hr className="my-4 border-gray-300 dark:border-gray-600" />
						<div className="flex flex-col lg:flex-row gap-4">
							<div className="lg:w-1/2">
								FORM/POST PARAMETERS:
								<br />
								<List items={request.PostForm} />{" "}
							</div>

							<div className="lg:w-1/2">
								HEADERS:
								<br />
								<List items={request.Header} />
							</div>
						</div>

						<div>
							BODY:
							{request.Body !== "" ? (
								<Body
									body={request.Body}
									contentType={getContentType(request)}
									expand={expand}
								/>
							) : (
								"Empty"
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
