import { REHYDRATE } from "redux-persist";
import { CREATE_BIN, LOAD_BINS, LOAD_REQUESTS, EXPAND_ALL, COLLAPSE_ALL } from "../actions";

const initialState = {
	selectedBin: null,
	bins: [],
	requests: [],
	expandAll: false,
	page: 1,
	nextPage: null,
	previousPage: null,
	total: 0,
	pagesCount: 1,
	maxPerPage: 50
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
				page: data.page,
				pagesCount: data.pagesCount,
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
			...{
				requests: data.requests,
				page: data.page,
				pagesCount: data.pagesCount,
				selectedBin: action.meta.selectedBin
			}
		};
	}

	case EXPAND_ALL: {
		return {
			...state,
			...{ expandAll: true }
		};
	}

	case COLLAPSE_ALL: {
		return {
			...state,
			...{ expandAll: false }
		};
	}

	default:
		return state;
	}
}
