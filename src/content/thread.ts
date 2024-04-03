import { Vote, isPageDataResponse } from '../types/backgroundResponse';
import { sendBackgroundRequest } from './request';

export type PageQuery = {
	threadId: string;
	take: number;
	skip: number;
};

export const BASE_THREAD_URL = 'https://forum.mafiascum.net/viewtopic.php?';

export async function getPageData(query: PageQuery) {
	const params = new URLSearchParams();
	params.set('t', query.threadId);
	params.set('ppp', query.take.toString());
	params.set('start', query.skip.toString());
	// reduces response payload size by over 90%!
	// simplifies the html DOM tree
	// removes scripts and css which we don't care about
	params.set('view', 'print');	

	const url = BASE_THREAD_URL + params.toString();

	try {
		const pageData = await sendBackgroundRequest({ action: 'getPageData', url: url });
		if (!isPageDataResponse(pageData)) return null;
		return pageData;
	} catch (err) {
		console.error(err);
		return null;
	}
}

export async function getThreadData(threadId: string, startFrom: number) {
	const throwErr = (...values: string[]) => {
		console.error(...values);
		return null;
	};

	let totalPages: number | undefined;
	let pageTitle: string | undefined;
	let votes: Vote[] = [];

	let loopIndex = 0;
	while (totalPages == undefined || loopIndex < totalPages) {
		const pageData = await getPageData({
			threadId,
			take: 200,
			// skips fetching posts we don't need to parse
			skip: loopIndex * 200 + startFrom,
		});

		if (!pageData) return throwErr('Could not fetch page data.');
		if (pageData.status != 200) return throwErr(`Page data status was ${pageData.status}.`);

		totalPages = pageData.lastPage;
		pageTitle = pageData.pageTitle;
		votes = [...votes, ...pageData.votes];

		loopIndex++;
	}

	if (!totalPages) throwErr('Could not find total pages.');
	if (!pageTitle) throwErr('Could not find page title.');

	return {
		title: pageTitle,
		pageCount: totalPages,
		votes: votes,
	};
}
