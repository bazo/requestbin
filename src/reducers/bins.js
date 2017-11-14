import { REHYDRATE, PURGE } from 'redux-persist';
import { LOAD_BINS } from '../actions';

const initialState = {
    selectedBin: null,
    bins: [],
    requests: [],
};

export default function(state = initialState, action) {
	switch (action.type) {
		case REHYDRATE: {
            console.log(action)
            return state;
			//return rehydrate(action.payload.bins, initialState);
		}

		case `${LOAD_BINS}_FULFILLED`: {
            const data = action.payload.data;
            console.log(data)
			if (data === null) {
				return [];
			}

			return data;
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
