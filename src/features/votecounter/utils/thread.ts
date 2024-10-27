import fetchPageData, { Post } from '../background/getPageData';

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
	params.set('view', 'print');

	const url = BASE_THREAD_URL + params.toString();

	try {
		const pageData = await fetchPageData.query({ url });
		if (!pageData) return null;
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
	let posts: Post[] = [];

	let loopIndex = 0;
	while (totalPages == undefined || loopIndex < totalPages) {
		const pageData = await getPageData({
			threadId,
			take: 200,
			skip: loopIndex * 200 + startFrom,
		});

		if (!pageData) return throwErr('Could not fetch page data.');

		totalPages = pageData.lastPage;
		pageTitle = pageData.title;
		posts = [...posts, ...pageData.posts];

		loopIndex++;
	}

	if (!totalPages) throwErr('Could not find total pages.');
	if (!pageTitle) throwErr('Could not find page title.');

	return {
		title: pageTitle,
		pageCount: totalPages,
		posts: posts,
	};
}
