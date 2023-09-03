import $ from 'jquery';
import { createModal } from './fg/modal';

let modalReference: JQuery<HTMLElement> = createModal();

$(async function () {
	$('body').append(modalReference);
	$('.author').each((_index, element) => {
		const data = $('<span class="mafia-engine-vc"> - <button>VC</button></span>').on('click', async () => {
			modalReference.removeClass('mafia-engine-modal-closed');
		});
		$(element).find('a:nth-child(3)').after(data);
	});
});
