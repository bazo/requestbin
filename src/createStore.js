import { compose, createStore, applyMiddleware } from 'redux';
import {
	persistCombineReducers,
	persistStore,
	createTransform
} from 'redux-persist';
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

let myTransform = createTransform(
	// transform state coming from redux on its way to being serialized and stored
	(inboundState, key) => {
		if (key === 'logs') {
			return { maxPerPage: inboundState.maxPerPage };
		}
	},
	// transform state coming from storage, on its way to be rehydrated into redux
	(outboundState, key) => {
		if (key === 'logs') {
			return outboundState;
		}
	},
	// configuration options
	{ whitelist: ['logs'] }
);

/*
{
	storage: localForage,
	blacklist: ['logs'], transforms: [myTransform]
}
*/
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
