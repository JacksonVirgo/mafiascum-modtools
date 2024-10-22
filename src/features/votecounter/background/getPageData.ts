import { BackgroundScript } from '../../../builders/background';
import { z } from 'zod';
import { load } from 'cheerio';

interface Vote {
	author: string;
	post: number;
	index: number;
	vote: string;
}

export default new BackgroundScript('getPageData')
	.input(
		z.object({
			url: z.string().url(),
		}),
	)
	.onQuery(async ({ url }) => {
		try {
			const response = await fetch(url);
			if (response.status !== 200)
				throw new Error(`Page not found for ${url}`);
			const html = await response.text();

			const qs = new URLSearchParams(url);
			const start = parseInt(qs.get('start') ?? '0');

			const $ = load(html);
			const title = $('h2').first().text();

			const pagination = $('.page-number:first > strong');

			let largestPageNumber: number = 1;
			let activePageNumber: number = 1;

			pagination.each((_index, element) => {
				const text = $(element).text();
				const num = parseInt(text);
				const active = _index === 0;
				if (isNaN(num)) throw new Error(`Invalid page number: ${text}`);
				if (num.toString() !== text)
					throw new Error(`Invalid page number: ${text}`);
				if (active) {
					activePageNumber = num;
				} else {
					largestPageNumber = num;
				}
			});

			const votes: Vote[] = [];

			$('.post').each((_index, element) => {
				const author = $(element).find('.author > strong').text();
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
		} catch (err) {
			console.error(err);
			return null;
		}
	});
