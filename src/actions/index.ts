import axios from "axios";


export function loadRequests(binId: string, page = 1, maxPerPage = 50) {
	const params = { page, maxPerPage };
	const request = axios.get(`/api/bins/${binId}/requests`, {params});

	
}

