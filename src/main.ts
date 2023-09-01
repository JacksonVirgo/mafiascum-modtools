import $, { post } from 'jquery';
import browser from 'webextension-polyfill';
import { Vote, isPageDataResponse } from './types/pageData';
import { getUrlParams } from './utils/url';
import { getPageData } from './fg/thread';

$(async function () {
	$('.author').each((_index, element) => {
		const data = $('<button>VC</button>')
			.css('padding', '5px')
			.css('border', '1px solid white')
			.on('click', async () => {
				const startTime = Date.now();

				const pageData = await getEveryPageData();
				if (!pageData) return console.error('Could not fetch page data.');

				const timeSeconds = (Date.now() - startTime) / 1000;
				console.log(`Took ${timeSeconds} seconds to fetch ${pageData.pageCount} pages of data.\n`, pageData);
			});
		$(element).append(data);
	});
});

async function getEveryPageData() {
	const urlParams = getUrlParams(window.location.search);

	const throwErr = (...values: string[]) => {
		console.error(...values);
		return null;
	};

	const threadId = urlParams.get('t');
	if (!threadId) return throwErr('Could not find thread id in url.', JSON.stringify(urlParams));

	let totalPages: number | undefined;
	let pageTitle: string | undefined;
	let votes: Vote[] = [];

	let loopIndex = 0;
	while (totalPages == undefined || loopIndex < totalPages) {
		const pageData = await getPageData({
			threadId,
			take: 200,
			skip: loopIndex * 200,
		});

		if (!pageData) return throwErr('Could not fetch page data.');
		if (pageData.status != 200) return throwErr(`Page data status was ${pageData.status}.`);

		totalPages = pageData.lastPage;
		pageTitle = pageData.pageTitle;
		votes = [...votes, ...pageData.votes];

		loopIndex++;
	}

	if (!totalPages || !pageTitle) return throwErr('Could not find total pages or page title.');

	return {
		title: pageTitle,
		pageCount: totalPages,
		votes: votes,
	};
}
