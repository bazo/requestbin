import { REHYDRATE, PURGE } from 'redux-persist';
import { CREATE_BIN, LOAD_BINS } from '../actions';

const initialState = {
	selectedBin: null,
	bins: [],
	requests: []
};

export default function(state = initialState, action) {
	switch (action.type) {
		case REHYDRATE: {
			console.log(action);
			return state;
			//return rehydrate(action.payload.bins, initialState);
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

		default:
			return state;
	}
}

function rehydrate(saved, initialState) {
	if (saved === undefined) {
		return initialState;
	}

	return saved;
}
