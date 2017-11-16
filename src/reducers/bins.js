import { REHYDRATE } from 'redux-persist';
import { CREATE_BIN, LOAD_BINS, LOAD_REQUESTS } from '../actions';

const initialState = {
	selectedBin: null,
	bins: [],
	requests: []
};

export default function(state = initialState, action) {
	switch (action.type) {
		case REHYDRATE: {
			if (action.payload === undefined) {
				return state;
			}

			const data = action.payload.bins;
			return {
				...state,
				...{
					bins: data.bins,
					selectedBin: data.selectedBin,
					requests: data.requests
				}
			};
		}

		case `${CREATE_BIN}_FULFILLED`: {
			let data = action.payload.data;
			if (data === null) {
				return state;
			}

			return { ...state, ...{ bins: state.bins.concat(data) } };
		}

		case `${LOAD_BINS}_FULFILLED`: {
			let data = action.payload.data;
			if (data === null) {
				data = [];
			}

			return { ...state, ...{ bins: data } };
		}

		case `${LOAD_REQUESTS}_FULFILLED`: {
			let data = action.payload.data;
			if (data === null) {
				data = [];
			}

			return {
				...state,
				...{ requests: data, selectedBin: action.meta.selectedBin }
			};
		}

		default:
			return state;
	}
}
