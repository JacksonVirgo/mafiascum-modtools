import $ from 'jquery';
import { getQuoteHighlighting } from './background/storage';

export default async () => {
	const highlightQuotes = await getQuoteHighlighting.query({});
	if (!highlightQuotes) return;

	const username = $('#username_logged_in .username').first().text();
	if (!username) return;

	$('.post blockquote').each((_, el) => {
		const quote = $(el);
		const cite = quote.find('cite').first();
		const citedUsername = cite.find('a').last().text();

		if (citedUsername === username) {
			quote.css('border-left', '2px solid yellow');
		}
	});
};
