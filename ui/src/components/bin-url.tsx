import { useState } from "react";
import { env } from "../env";

export function BinUrl({ binId }: { binId: string }) {
	const url = `${env.VITE_API_URL}/${binId}`;
	const [copied, setCopied] = useState(false);

	const copy = () => {
		navigator.clipboard.writeText(url).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	};

	return (
		<div className="flex items-center gap-2">
			<code className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono select-all">
				{url}
			</code>
			<button
				onClick={copy}
				className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm cursor-pointer"
			>
				{copied ? "Copied!" : "Copy"}
			</button>
		</div>
	);
}
