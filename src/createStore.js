import { compose, createStore, applyMiddleware } from 'redux';
import { persistCombineReducers, persistStore } from 'redux-persist';
import promiseMiddleware from 'redux-promise-middleware';
import { loadingBarMiddleware } from 'react-redux-loading-bar';
import logger from 'redux-logger';
import localForage from 'localforage';

import rootReducer from './reducers';

let middleware = [promiseMiddleware(), loadingBarMiddleware()];

if (process.env.NODE_ENV === 'development') {
	middleware.push(logger);
}

localForage.config({
	// driver      : localforage.WEBSQL, // Force WebSQL; same as using setDriver()
	name: 'requestbin',
	version: 1.0,
	//size        : 4980736, // Size of database, in bytes. WebSQL-only for now.
	storeName: 'values', // Should be alphanumeric, with underscores.
	description: 'Requestbin DB'
});

const config = {
	key: 'primary',
	storage: localForage
};

let reducer = persistCombineReducers(config, rootReducer);

export const store = createStore(
	reducer,
	undefined,
	compose(applyMiddleware(...middleware))
);
export const persistor = persistStore(store, null);

if (process.env.NODE_ENV !== 'production') {
	if (module.hot) {
		module.hot.accept('./reducers', () => {
			store.replaceReducer(reducer);
		});
	}
}
