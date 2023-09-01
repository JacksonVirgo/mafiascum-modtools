chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
	const req = request as unknown;
	if (typeof req !== 'object' || req === null || !('action' in req)) {
		return sendResponse({ status: 400, message: 'Invalid request' });
	}

	if (request.action === 'getData') {
		const data = { status: 200, message: 'Imagine this is fetched page/vote data' };
		sendResponse(data);
	}
});
