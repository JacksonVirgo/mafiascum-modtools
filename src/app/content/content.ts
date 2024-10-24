import $ from 'jquery';
import mountQuotehighlighting from '../../features/quoteHighlighting/mount';
import mountMultiISO from '../../features/multiISO/mount';
import mountVoteCounter from '../../features/votecounter/mount';

$(async function () {
	mountVoteCounter();
	mountMultiISO();
	mountQuotehighlighting();
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testPostAutoFooter() {
	const postForm = $('#qr_postform');
	const textarea = postForm.find('textarea.inputbox');
	postForm.on('submit', () => {
		textarea.val(textarea.val() + '\nTest');
	});
}
