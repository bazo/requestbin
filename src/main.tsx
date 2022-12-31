import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/app";
import "./App.scss";
import "react-datetime/css/react-datetime.css";
import "font-awesome/css/font-awesome.css";

import { QueryClient, QueryClientProvider } from "react-query";
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	</React.StrictMode>,
);
