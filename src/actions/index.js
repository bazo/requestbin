import axios from 'axios';

export const CREATE_BIN = 'CREATE_BIN';
export const LOAD_BINS = 'LOAD_BINS';
export const SELECT_BIN = 'LOAD_BIN';
export const LOAD_REQUESTS = 'LOAD_REQUESTS';

export const EXPAND_ALL = 'EXPAND_ALL';
export const COLLAPSE_ALL = 'COLLAPSE_ALL';

export const SELECT_DATE_FROM = 'SELECT_DATE_FROM';
export const SELECT_DATE_TO = 'SELECT_DATE_TO';
export const SET_DATE_RANGE = 'SET_DATE_RANGE';

export const SET_MAX_PER_PAGE = 'SET_MAX_PER_PAGE';

export function createBin() {
	const request = axios.post('/api/bins');

	return {
		type: CREATE_BIN,
		payload: request
	};
}

export function loadBins() {
	const request = axios.get('/api/bins');

	return {
		type: LOAD_BINS,
		payload: request
	};
}

export function selectBin(binId) {
	return {
		type: SELECT_BIN,
		binId
	};
}

export function loadRequests(binId, page = 1, maxPerPage = 50) {
	console.log(binId)
	const params = { page, maxPerPage };
	const request = axios.get(`/api/bins/${binId}/requests`, params);

	return {
		type: LOAD_REQUESTS,
		payload: request
	};
}

export function expandAll() {
	return {
		type: EXPAND_ALL
	};
}

export function collapseAll() {
	return {
		type: COLLAPSE_ALL
	};
}

export function selectDateFrom(date) {
	return {
		type: SELECT_DATE_FROM,
		date
	};
}

export function selectDateTo(date) {
	return {
		type: SELECT_DATE_TO,
		date
	};
}

export function setDateRange(range) {
	return {
		type: SET_DATE_RANGE,
		range
	};
}

export function setDateRangeToday() {
	const range = 'today';
	return {
		type: SET_DATE_RANGE,
		range
	};
}

export function setDateRangeYesterday() {
	const range = 'yesterday';
	return {
		type: SET_DATE_RANGE,
		range
	};
}

export function setMaxPerPage(maxPerPage) {
	return {
		type: SET_MAX_PER_PAGE,
		maxPerPage
	};
}
