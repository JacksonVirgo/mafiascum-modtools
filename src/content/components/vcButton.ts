import $ from 'jquery';
import { CSS_HIDDEN } from './modal';

export default () => {
	$('.author').each((_index, element) => {
		const button = $('<span class="mafia-engine-vc"> - <button>VC</button></span>');
		button
			.find('button')
			.first()
			.on('click', async () => {
				$('#mafia-engine-modal-page').removeClass(CSS_HIDDEN);
			});
		$(element).find('a:nth-child(3)').after(button);
	});
};
