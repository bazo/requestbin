import { useState } from "react";

interface HideTextProps {
	text: string;
	maxLength: number;
}
export function HideText({ text, maxLength }: HideTextProps) {
	const [isExpanded, setIsExpanded] = useState(false);

	const toggleExpand = () => {
		setIsExpanded(!isExpanded);
	};

	const isTextLonger = text.length > maxLength;
	if (isTextLonger) {
		if (!isExpanded) {
			text = text.substring(0, maxLength);
		}
	}

	return (
		<>
			<span key="text">{text}</span>
			{isTextLonger && (
				<span
					key="ellipsis"
					className="text-indigo-500 cursor-pointer hover:underline"
					onClick={toggleExpand}
				>
					...
				</span>
			)}
		</>
	);
}

