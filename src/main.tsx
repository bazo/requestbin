import React from "react";
import ReactDOM from "react-dom/client";
//import { Provider } from 'react-redux';
import App from "./components/app";
//import { persistor, store } from './createStore';
//import { PersistGate } from 'redux-persist/lib/integration/react';

//import 'bootstrap/dist/css/bootstrap.css';
import "./App.css";
import "react-datetime/css/react-datetime.css";
import "font-awesome/css/font-awesome.css";

import {
	QueryClient,
	QueryClientProvider,
} from "react-query";
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<App />
		</QueryClientProvider>
	</React.StrictMode>
);
