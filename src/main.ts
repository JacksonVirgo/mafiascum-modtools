import $ from 'jquery';
import browser from 'webextension-polyfill';
import { isPageDataResponse } from './types/pageData';

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
				let url = `https://forum.mafiascum.net/viewtopic.php?`;
				const params: string[] = [];
				if (urlParams.has('t')) params.push(`t=${urlParams.get('t')}`);
				if (urlParams.has('p')) params.push(`p=${urlParams.get('p')}`);
				if (urlParams.has('start')) params.push(`start=${urlParams.get('start')}`);
				params.push('ppp=200');

				url += params.join('&');

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
				const pageData = await fetchPageData(url);

				// Step 1. Insert logic to fetch all pages and their data.

				// Step 2. Insert logic to parse all votes from all pages.

				// Step 3. Insert logic to format the vote-counter.

				// Step 4. Insert logic to display the vote-counter on the screen (possibly a modal?)

				console.log('Page Data from Background Script', pageData);
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
