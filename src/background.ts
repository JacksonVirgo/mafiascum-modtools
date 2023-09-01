import browser from 'webextension-polyfill';
import { load } from 'cheerio';
import { PageDataResponse, isPageDataRequest } from './types/pageData';

browser.runtime.onMessage.addListener(async (request) => {
	const sendResponse = (response: PageDataResponse) => {
		return Promise.resolve(response);
	};

	if (!isPageDataRequest(request)) return sendResponse({ status: 400, message: 'Invalid request' });

	try {
		const response = await fetch(request.url);
		if (response.status !== 200) return Promise.resolve({ status: response.status, message: response.statusText });

		const html = await response.text();

		const $ = load(html);
		const title = $('h2').first().text();

		if (!title) return sendResponse({ status: 500, message: 'Could not find page title.' });

		return sendResponse({
			status: 200,
			pageTitle: title,
		});
	} catch (err) {
		console.log(err); // Do proper error handling later
		return sendResponse({ status: 500, message: 'Unexpected error' });
	}
});
