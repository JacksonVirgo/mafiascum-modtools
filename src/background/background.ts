import browser from 'webextension-polyfill';
import { load } from 'cheerio';
import { AnyResponse, Vote } from '../types/backgroundResponse';
import { isMemberVerificationRequest, isPageDataRequest } from '../types/backgroundRequests';

function sendResponse(response: AnyResponse) {
	return Promise.resolve(response);
}

browser.runtime.onMessage.addListener(async (request) => {
	try {
		if (isPageDataRequest(request)) return await fetchPageData(request.url);
		if (isMemberVerificationRequest(request)) return await verifyMemberExists(request.username);
		return sendResponse({ status: 400, message: 'Invalid request' });
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

	const votes: Vote[] = [];

	$('.post').each((_index, element) => {
		// This is a pretty dodgy selector but works for now
		// Demonstrating how you can check through each post
		const post = $(element).find('.inner > .postprofile > dt:nth-child(2) > a').text();

		const postNumberRaw = $(element).find('.author > a > .post-number-bolded').text().slice(1);
		const postNumber = parseInt(postNumberRaw);
		const posts = new Map<number, Vote[]>();

		$(element)
			.find('.inner > .postbody > div > .content > .bbvote')
			.each((_index, element) => {
				const array = posts.get(postNumber) ?? [];
				array.push({
					author: post,
					post: postNumber,
					index: array.length,
					vote: $(element).text(),
				});

				posts.set(postNumber, array);
			});

		for (const post of posts) {
			votes.push(...post[1]);
		}
	});

	if (!title) return sendResponse({ status: 500, message: 'Could not find page title.' });
	if (!largestPageNumber) return sendResponse({ status: 500, message: 'Could not find largest page number.' });
	if (!activePageNumber) return sendResponse({ status: 500, message: 'Could not find active page number.' });

	return sendResponse({
		action: 'pageData',
		status: 200,
		pageTitle: title,
		lastPage: largestPageNumber,
		currentPage: activePageNumber,
		votes,
	});
}

async function verifyMemberExists(username: string) {
	const fetchUrl = `https://forum.mafiascum.net/memberlist.php?username=${username}`;
	const response = await fetch(fetchUrl);
	const text = await response.text();
	const $ = load(text);
	const member = $('#memberlist > tbody > tr > td:nth-child(1) > a').first().text();
	return sendResponse({ action: 'verifyMember', status: 200, username, verified: member === username });
}
