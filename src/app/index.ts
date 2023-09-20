import $ from 'jquery';
import { CSS_HIDDEN, createModal } from './modal';

$(async function () {
	const modal = await createModal();
	if (!modal) return;

	$('body').append(modal);
	$('.author').each((_index, element) => {
		const button = $('<span class="mafia-engine-vc"> - <button>VC</button></span>');
		button
			.find('button')
			.first()
			.on('click', async () => {
				modal.removeClass(CSS_HIDDEN);
			});
		$(element).find('a:nth-child(3)').after(button);
	});
});
