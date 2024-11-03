import { BackgroundScript } from '../../../builders/background';
import { z } from 'zod';
import { type Cheerio, load } from 'cheerio';
import { Element as DomHandlerElement } from 'domhandler';

const postSchema = z.object({
	author: z.string(),
	postNumber: z.number(),
	votes: z.array(
		z.object({
			value: z.string(),
			index: z.number(),
		}),
	),
});

export type Post = z.infer<typeof postSchema>;

export default new BackgroundScript('getPageData')
	.input(
		z.object({
			url: z.string().url(),
		}),
	)
	.output(
		z
			.object({
				title: z.string(),
				lastPage: z.number(),
				currentPage: z.number(),
				posts: z.array(postSchema),
			})
			.nullable(),
	)
	.onQuery(async ({ url }) => {
		return await fetchPage(url);
	});

type CElement = Cheerio<DomHandlerElement>;

export async function fetchPage(url: string) {
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

		const posts: z.infer<typeof postSchema>[] = [];

		$('.post').each((index, element) => {
			const post: Post = {
				author: $(element).find('.author > strong').text(),
				postNumber: start + index,
				votes: [],
			};

			const content = $(element).find('.content').first();

			let voteIndex = 0;

			const checkElementAsVote = (
				element: CElement,
				permitBold: boolean = true,
			) => {
				if (element.hasClass('bbvote')) return true;
				if (
					permitBold &&
					element.attr('style')?.includes('font-weight:bold')
				) {
					// lack of space between : and 'bold' is intentional.
					// view=print mode removes the space
					if (
						element.text().startsWith('VOTE:') ||
						element.text().startsWith('UNVOTE:')
					) {
						return true;
					}
				}
				return false;
			};

			const scanChildren = (
				element: CElement,
				withinSpoiler: boolean = false,
			) => {
				if (checkElementAsVote(element, !withinSpoiler)) {
					post.votes.push({
						value: element.text(),
						index: voteIndex++,
					});
					console.log(
						'Found vote',
						element.text(),
						voteIndex,
						withinSpoiler,
					);
					return;
				}

				if (element.is('fieldset')) return; // area tag
				if (element.is('blockquote')) return; // quote
				if (element.hasClass('codebox')) return; // codeblock
				if (element.hasClass('quotecontent')) return; // spoiler= tag
				const title = element.attr('title');
				const tag =
					'This text is hidden to prevent spoilers; to reveal, highlight it with your cursor.';

				if (title == tag) {
					withinSpoiler = true;
				}
				element.children().each((_, element) => {
					return scanChildren($(element), withinSpoiler);
				});
			};

			scanChildren(content);
			posts.push(post);
		});

		return {
			title,
			lastPage: largestPageNumber,
			currentPage: activePageNumber,
			posts,
		};
	} catch (err) {
		console.error(err);
		return null;
	}
}
