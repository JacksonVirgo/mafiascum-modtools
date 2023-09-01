import $ from 'jquery';
import browser from 'webextension-polyfill';
import { PageDataResponse, Vote, isPageDataResponse } from './types/pageData';

export function getUrlParams() {
	const urlParams = new URLSearchParams(window.location.search);
	const params = new Map<string, string>();
	for (const [key, value] of urlParams) {
		params.set(key, value);
	}
	return params;
}

$(async function () {
	console.log('Mafia Engine has loaded.');
	console.log('This should only be called on forum.mafiascum.net');

	$('.author').each((_index, element) => {
		const data = $('<button>VC</button>')
			.css('padding', '5px')
			.css('border', '1px solid white')
			.on('click', async () => {
				const startTime = Date.now();

				const pageData = await getEveryPageData();
				if (!pageData) return console.error('Could not fetch page data.');

				const { votes, title, pageCount } = pageData;
				const timeSeconds = (Date.now() - startTime) / 1000;
				console.log(`Took ${timeSeconds} seconds to fetch ${pageCount} pages of data.`);
				console.log(`Found ${votes.length} votes in ${title}.`, votes);
			});
		$(element).append(data);
	});
});

async function getEveryPageData() {
	const urlParams = getUrlParams();
	if (!(urlParams.has('t') || urlParams.has('p'))) return console.log('Page is not a topic or post.');

	const baseUrl = `https://forum.mafiascum.net/viewtopic.php?`;
	const params = new Map<string, string>();

	if (urlParams.has('t')) params.set('t', `${urlParams.get('t')}`);
	if (urlParams.has('p')) params.set('p', `${urlParams.get('p')}`);
	if (urlParams.has('start')) params.set(`start`, `${urlParams.get('start')}`);
	params.set('ppp', '200');

	let initialURL = baseUrl;
	for (const [key, value] of params) initialURL += `${key}=${value}&`;
	if (initialURL[initialURL.length - 1] === '&') initialURL = initialURL.slice(0, -1);

	const pageData = await fetchPageData(initialURL);
	if (!pageData) return console.error('Could not fetch page data.');
	if (pageData.status != 200) {
		console.error('Could not fetch page data.', pageData.message);
		return null;
	}

	const completedPages = [pageData.currentPage];
	let votes: Vote[] = [];
	const totalPages = pageData.lastPage;
	const pageTitle = pageData.pageTitle;

	for (let i = 0; i < pageData.lastPage; i++) {
		if (completedPages.includes(i + 1)) continue;

		const start = i * 200;
		params.set('start', `${start}`);

		let url = baseUrl;
		for (const [key, value] of params) url += `${key}=${value}&`;
		if (url[url.length - 1] === '&') url = url.slice(0, -1);

		const pageData = await fetchPageData(url);
		if (!pageData) return console.error('Could not fetch page data.');
		if (pageData.status != 200) return console.error('Could not fetch page data.', pageData.message);

		votes = [...votes, ...pageData.votes];

		completedPages.push(pageData.currentPage);
	}

	return {
		title: pageTitle,
		pageCount: totalPages,
		votes: votes,
	};
}

async function fetchPageData(url: string) {
	try {
		const pageData = await browser.runtime.sendMessage({ action: 'getPageData', url: url });
		if (!isPageDataResponse(pageData)) return null;
		return pageData;
	} catch (err) {
		console.error(err);
		return null;
	}
}
