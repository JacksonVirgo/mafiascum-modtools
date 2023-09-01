import browser from 'webextension-polyfill';
import { load } from 'cheerio';
import { PageDataResponse, isPageDataRequest } from './types/pageData';

function sendResponse(response: PageDataResponse) {
	return Promise.resolve(response);
}

browser.runtime.onMessage.addListener(async (request) => {
	try {
		switch (true) {
			case isPageDataRequest(request):
				return await fetchPageData(request.url);
			default:
				return sendResponse({ status: 400, message: 'Invalid request' });
		}
	} catch (err) {
		console.log(err); // Do proper error handling later
		return sendResponse({ status: 500, message: 'Unexpected error' });
	}
});

async function fetchPageData(url: string) {
	const response = await fetch(url);
	if (response.status !== 200) return Promise.resolve({ status: response.status, message: response.statusText });

	const html = await response.text();

	const $ = load(html);
	const title = $('h2').first().text();

	// #page-body > div.action-bar.bar-top > div.pagination > ul > li:nth-child(5) > a

	const pagination = $('.pagination:first > ul > li');

	let largestPageNumber: number | undefined;
	let activePageNumber: number | undefined;

	pagination.each((_index, element) => {
		const text = $(element).text();
		const active = $(element).hasClass('active');

		// Validate text is an integer
		const num = parseInt(text);
		if (isNaN(num)) return;
		if (num.toString() !== text) return;

		if (!largestPageNumber || num > largestPageNumber) largestPageNumber = num;
		if (active) activePageNumber = num;
	});

	if (!title) return sendResponse({ status: 500, message: 'Could not find page title.' });
	if (!largestPageNumber) return sendResponse({ status: 500, message: 'Could not find largest page number.' });
	if (!activePageNumber) return sendResponse({ status: 500, message: 'Could not find active page number.' });

	console.log('Page Data from Background Script', title, largestPageNumber, activePageNumber);

	return sendResponse({
		status: 200,
		pageTitle: title,
		lastPage: largestPageNumber,
		currentPage: activePageNumber,
	});
}
