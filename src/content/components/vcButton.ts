import $ from 'jquery';
import { getTemplate } from '../request';

export default async () => {
	const pageTemplate = await getTemplate('vc_form.html');
	if (!pageTemplate) return null;

	$('.post').each((_, postElement) => {
		const post = $(postElement);
		const author = post.find('.author').first();
		const button = $('<span class="mafia-engine-vc"> - <button>VC</button></span>');

		const fillerDiv = $(pageTemplate);
		fillerDiv.insertBefore(post);

		button
			.find('button')
			.first()
			.on('click', async () => {
				if (fillerDiv.hasClass('me_hidden')) {
					fillerDiv.removeClass('me_hidden');
				} else {
					// TODO: Remount to get up to date information
					fillerDiv.addClass('me_hidden');
				}
			});
		author.find('a:nth-child(3)').after(button);
	});
};
