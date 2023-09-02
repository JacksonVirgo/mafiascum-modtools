import $, { post } from 'jquery';
import browser from 'webextension-polyfill';
import { Vote, isPageDataResponse } from './types/pageData';
import { getUrlParams } from './utils/url';
import { getPageData, getThreadData } from './fg/thread';
import { createModal } from './fg/modal';

let modalReference: JQuery<HTMLElement> = createModal();

$(async function () {
	$('body').append(modalReference);
	$('.author').each((_index, element) => {
		const data = $('<span class="mafia-engine-vc"> - <button>VC</button></span>').on('click', async () => {
			modalReference.removeClass('mafia-engine-modal-closed');
		});
		$(element).find('a:nth-child(3)').after(data);
	});
});

async function startVoteCount() {
	const startTime = Date.now();

	const params = getUrlParams(window.location.search);
	if (!params) return console.error('Could not get url params.');
	const threadId = params.get('t');
	if (!threadId) return console.error('Could not get thread id.');

	const threadData = await getThreadData(threadId);
	if (!threadData) return console.error('Could not fetch page data.');

	const timeSeconds = (Date.now() - startTime) / 1000;
	console.log(`Took ${timeSeconds} seconds to fetch ${threadData.pageCount} pages of data.\n`, threadData);
}
