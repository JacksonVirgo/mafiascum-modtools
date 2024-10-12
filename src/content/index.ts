import $ from 'jquery';
import { createModal } from './components/vcModal/modal';

import loadVcButtons from './components/vcButton';
import loadMultiIso from './components/multiISO';
import mountHighlightedQuotes from './components/highlightQuotes';

$(async function () {
	const modal = await createModal();
	if (modal) loadVcButtons();
	loadMultiIso();
	mountHighlightedQuotes();
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testPostAutoFooter() {
	const postForm = $('#qr_postform');
	const textarea = postForm.find('textarea.inputbox');
	postForm.on('submit', () => {
		textarea.val(textarea.val() + '\nTest');
	});
}
