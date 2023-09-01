export type PageDataRequest = {
	action: 'getPageData';
	url: string;
};

export function isPageDataRequest(data: unknown): data is PageDataRequest {
	if (!data || typeof data !== 'object') return false;
	if (!('action' in data)) return false;
	if (!('url' in data)) return false;

	if (typeof data.action !== 'string') return false;
	if (data.action !== 'getPageData') return false;
	if (typeof data.url !== 'string') return false;

	return true;
}

export type PageDataResponse =
	| {
			status: 200;
			pageTitle: string;
			lastPage: number;
			currentPage: number;
	  }
	| {
			status: 500;
			message: string;
	  }
	| {
			status: 400;
			message: string;
	  };

export function isPageDataResponse(data: unknown): data is PageDataResponse {
	if (!data || typeof data !== 'object') return false;
	if (!('status' in data)) return false;
	if (typeof data.status !== 'number') return false;

	if (data.status === 200) {
		if (!('pageTitle' in data)) return false;
		if (typeof data.pageTitle !== 'string') return false;

		if (!('lastPage' in data)) return false;
		if (typeof data.lastPage !== 'number') return false;

		if (!('currentPage' in data)) return false;
		if (typeof data.currentPage !== 'number') return false;

		return true;
	}

	if (data.status != 500 && data.status != 400) return false;
	if (!('message' in data)) return false;
	if (typeof data.message !== 'string') return false;
	return true;
}
