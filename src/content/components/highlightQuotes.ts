import $ from 'jquery';

export default () => {
	const isHighlightingQuotes = localStorage.getItem('highlightQuotes');
	if (!isHighlightingQuotes || isHighlightingQuotes != 'on') return;

	const username = $('#username_logged_in .username').first().text();
	if (!username) return;

	$('.post blockquote').each((i, el) => {
		const quote = $(el);
		const cite = quote.find('cite').first();
		const citedUsername = cite.find('a').last().text();

		if (citedUsername === username) {
			quote.css('border-left', '2px solid yellow');
		}
	});
	// #post_content14038610 > div.content > blockquote:nth-child(1) > div > cite > a:nth-child(2)
};
