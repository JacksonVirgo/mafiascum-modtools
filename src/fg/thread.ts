import browser from 'webextension-polyfill';
import { isPageDataResponse } from '../types/pageData';

export type PageQuery = {
	threadId: string;
	take: number;
	skip: number;
};

export const BASE_THREAD_URL = 'https://forum.mafiascum.net/viewtopic.php?';

export async function getPageData(query: PageQuery) {
	const params = new Map<string, string>();
	params.set('t', query.threadId);
	params.set('ppp', query.take.toString());
	params.set('start', query.skip.toString());

	let url = BASE_THREAD_URL;
	for (const [key, value] of params) url += `${key}=${value}&`;
	if (url[url.length - 1] === '&') url = url.slice(0, -1);

	try {
		const pageData = await browser.runtime.sendMessage({ action: 'getPageData', url: url });
		if (!isPageDataResponse(pageData)) return null;
		return pageData;
	} catch (err) {
		console.error(err);
		return null;
	}
}
