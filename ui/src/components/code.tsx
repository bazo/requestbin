import { dark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';

const Code = ({ codeString }: { codeString: string }) => {
	return (
		<SyntaxHighlighter language="text" style={dark}>
			{codeString}
		</SyntaxHighlighter>
	);
};

export default Code;
