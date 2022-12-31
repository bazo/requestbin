import { FC, useState } from "react";

interface HideTextProps {
	text: string;
	maxLength: number;
}
const HideText: FC<HideTextProps> = ({ text, maxLength }) => {
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
					className="ellipsis"
					onClick={toggleExpand}
				>
					...
				</span>
			)}
		</>
	);
};

export default HideText;
