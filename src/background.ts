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
	const pagination = $('.pagination:first > ul > li');

	// Check page numbers
	let largestPageNumber: number | undefined;
	let activePageNumber: number | undefined;
	pagination.each((_index, element) => {
		const text = $(element).text();
		const active = $(element).hasClass('active');
		const num = parseInt(text);
		if (isNaN(num)) return;
		if (num.toString() !== text) return;
		if (!largestPageNumber || num > largestPageNumber) largestPageNumber = num;
		if (active) activePageNumber = num;
	});

	const users: string[] = [];
	$('.post').each((_index, element) => {
		// This is a pretty dodgy selector but works for now
		// Demonstrating how you can check through each post
		const post = $(element).find('.inner > .postprofile > dt:nth-child(2) > a').text();
		users.push(post);
	});

	if (!title) return sendResponse({ status: 500, message: 'Could not find page title.' });
	if (!largestPageNumber) return sendResponse({ status: 500, message: 'Could not find largest page number.' });
	if (!activePageNumber) return sendResponse({ status: 500, message: 'Could not find active page number.' });

	return sendResponse({
		status: 200,
		pageTitle: title,
		lastPage: largestPageNumber,
		currentPage: activePageNumber,
		users,
	});
}
