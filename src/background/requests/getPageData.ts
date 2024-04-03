import { load } from 'cheerio';
import { Vote } from '../../types/backgroundResponse';

export async function getPageData(url: string) {
	const response = await fetch(url);
	if (response.status !== 200) return null;
	const html = await response.text();

	const qs = new URLSearchParams(url);
	const start = parseInt(qs.get('start') ?? '0');

	const $ = load(html);
	const title = $('h2').first().text();

	// what pagination looks like in view=print mode
	// 'Page 7 of 9'
	const pagination = $('.page-number:first > strong');

	// Check page numbers
	let largestPageNumber: number = 1;
	let activePageNumber: number = 1;

	pagination.each((_index, element) => {
		const text = $(element).text();
		const num = parseInt(text);
		const active = _index === 0;
		if (isNaN(num)) return;
		if (num.toString() !== text) return;
		if (active) {
			activePageNumber = num;
		} else {
			largestPageNumber = num;
		}
	});

	const votes: Vote[] = [];

	$('.post').each((_index, element) => {
		const author = $(element).find('.author > strong').text();

		// post number is not returned in the html response anymore
		// can be inferred from offset + index
		const postNumber = start + _index;
		const posts = new Map<number, Vote[]>();

		$(element)
			.find('.content > .bbvote')
			.each((_index, element) => {
				const array = posts.get(postNumber) ?? [];
				array.push({
					author,
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

	return {
		title,
		lastPage: largestPageNumber,
		currentPage: activePageNumber,
		votes,
	};
}
