import { load } from 'cheerio';

export async function getPageData(url: string) {
	const response = await fetch(url);
	if (response.status !== 200) return null;
	const html = await response.text();

	const $ = load(html);
	const title = $('h2').first().text();
	const pagination = $('.pagination:first > ul > li');

	// Check page numbers
	let largestPageNumber: number | undefined;
	let activePageNumber: number | undefined;
	pagination.each((_index, element) => {
		const text = $(element).text();
		const active = $(element).hasClass('active');
		const num = parseInt(text);
		if (isNaN(num)) return;
		if (num.toString() !== text) return;
		if (!largestPageNumber || num > largestPageNumber) largestPageNumber = num;
		if (active) activePageNumber = num;
	});

	const votes: {
		author: string;
		post: number;
		index: number;
		vote: string;
	}[] = [];

	$('.post').each((_index, element) => {
		// This is a pretty dodgy selector but works for now
		// Demonstrating how you can check through each post
		const post = $(element).find('.inner > .postprofile > dt:nth-child(2) > a').text();

		const postNumberRaw = $(element).find('.author > a > .post-number-bolded').text().slice(1);
		const postNumber = parseInt(postNumberRaw);
		const posts = new Map<
			number,
			{
				author: string;
				post: number;
				index: number;
				vote: string;
			}[]
		>();

		$(element)
			.find('.inner > .postbody > div > .content > .bbvote')
			.each((_index, element) => {
				const array = posts.get(postNumber) ?? [];
				array.push({
					author: post,
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
