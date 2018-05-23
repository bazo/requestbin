import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/app';
import { persistor, store } from './createStore';
import { PersistGate } from 'redux-persist/lib/integration/react';

//import 'bootstrap/dist/css/bootstrap.css';
import './App.css';
import 'react-datetime/css/react-datetime.css';
import 'font-awesome/css/font-awesome.css';

const render = Component => {
	ReactDOM.render(
		<PersistGate persistor={persistor}>
			<Provider store={store}>
				<Component />
			</Provider>
		</PersistGate>,
		document.getElementById('root')
	);
};

render(App);

if (module.hot) {
	module.hot.accept('./components/app', () => {
		render(App);
	});
}
