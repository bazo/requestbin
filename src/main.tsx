import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux';
import App from './components/app';
import { persistor, store } from './createStore';
import { PersistGate } from 'redux-persist/lib/integration/react';

//import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import 'react-datetime/css/react-datetime.css';
import 'font-awesome/css/font-awesome.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <PersistGate persistor={persistor}>
			<Provider store={store}>
				<App />
			</Provider>
		</PersistGate>,
  </React.StrictMode>,
)
