import $ from 'jquery';
import browser from 'webextension-polyfill';
import { PageDataResponse, isPageDataResponse } from './types/pageData';

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

	const urlParams = getUrlParams();
	if (!(urlParams.has('t') || urlParams.has('p'))) return console.log('Page is not a topic or post.');

	// #post_content13769615 > p.author.modified > a:nth-child(3)

	$('.author').each((_index, element) => {
		const data = $('<button>VC</button>')
			.css('padding', '5px')
			.css('border', '1px solid white')
			.on('click', async () => {
				const baseUrl = `https://forum.mafiascum.net/viewtopic.php?`;
				const params = new Map<string, string>();

				if (urlParams.has('t')) params.set('t', `${urlParams.get('t')}`);
				if (urlParams.has('p')) params.set('p', `${urlParams.get('p')}`);
				if (urlParams.has('start')) params.set(`start`, `${urlParams.get('start')}`);
				params.set('ppp', '200');

				let initialURL = baseUrl;
				for (const [key, value] of params) initialURL += `${key}=${value}&`;
				if (initialURL[initialURL.length - 1] === '&') initialURL = initialURL.slice(0, -1);

				/*
					Fetch the current page, gather page data including the following:
						- Page Title
						- How many pages are there?
						- What is the current page
						- What are all the votes on the current page.
						- More details if needed

					The following command fetches the initial page data.
					It only currently fetches the page title, but it can be expanded to fetch more data (obv).
				*/

				const startTime = Date.now();

				const pageData = await fetchPageData(initialURL);
				if (!pageData) return console.error('Could not fetch page data.');
				if (pageData.status != 200) return console.error('Could not fetch page data.', pageData.message);

				const completedPages = [pageData.currentPage];
				const fetchedData: PageDataResponse[] = [pageData];

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

					completedPages.push(pageData.currentPage);
					fetchedData.push(pageData);
				}

				// Step 1. Insert logic to fetch all pages and their data.

				// Step 2. Insert logic to parse all votes from all pages.

				// Step 3. Insert logic to format the vote-counter.

				// Step 4. Insert logic to display the vote-counter on the screen (possibly a modal?)

				const timeSeconds = (Date.now() - startTime) / 1000;
				console.log('Page Data from Background Script', fetchedData, `Took ${timeSeconds}s`);
			});
		$(element).append(data);
	});
});

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
