export default async () => {
	console.log('[AutoFooter] Mounting');
	if (false) {
		const footerContent = 'Test';
		const postForm = $('#qr_postform');
		const textarea = postForm.find('textarea.inputbox');
		postForm.on('submit', () => {
			textarea.val(textarea.val() + `\n${footerContent}`);
		});
	}
};
