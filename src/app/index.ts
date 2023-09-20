import $ from 'jquery';
import { CSS_HIDDEN, createModal } from './modal';
import { getTemplate } from './request';

$(async function () {
	const modal = await createModal();
	if (!modal) return;

	$('body').append(modal);
	const vcButton = await getTemplate('vcButton');
	if (vcButton) {
		$('.author').each((_index, element) => {
			const button = $(vcButton);
			button
				.find('button')
				.first()
				.on('click', async () => {
					modal.removeClass(CSS_HIDDEN);
				});
			$(element).find('a:nth-child(3)').after(button);
		});
	}
});
