import browser from 'webextension-polyfill';

browser.runtime.onMessage.addListener((request) => {
	const req = request as unknown;
	if (typeof req !== 'object' || req === null || !('action' in req)) {
		return Promise.resolve({ status: 400, message: 'Invalid request' });
	}

	if (request.action === 'getData') {
		const data = { status: 200, message: 'Imagine this is fetched page/vote data :)' };
		return Promise.resolve(data);
	}
});
