import browser from 'webextension-polyfill';
import { load } from 'cheerio';

export type PageDataRequest = {
	action: 'getPageData';
	url: string;
};

function isPageData(data: unknown): data is PageDataRequest {
	if (!data || typeof data !== 'object') return false;
	if (!('action' in data)) return false;
	if (!('url' in data)) return false;

	if (typeof data.action !== 'string') return false;
	if (data.action !== 'getPageData') return false;
	if (typeof data.url !== 'string') return false;

	return true;
}

browser.runtime.onMessage.addListener(async (request) => {
	if (!isPageData(request)) return Promise.resolve({ status: 400, message: 'Invalid request' });

	try {
		const response = await fetch(request.url);
		if (response.status !== 200) return Promise.resolve({ status: response.status, message: response.statusText });

		const html = await response.text();

		const $ = load(html);
		const title = $('h2').first().text();

		const data = { status: 200, pageTitle: title };
		return Promise.resolve(data);
	} catch (err) {
		return Promise.resolve({ status: 500, message: err });
	}
});
