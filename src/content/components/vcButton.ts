import $ from 'jquery';

export default async () => {
	$('.post').each((_, postElement) => {
		const post = $(postElement);
		const author = post.find('.author').first();
		const button = $(
			'<span class="mafia-engine-vc"> - <button>VC</button></span>',
		);

		button
			.find('button')
			.first()
			.on('click', async () => {
				const dialog = $('#me_votecount');
				if (!dialog) return;
				dialog.toggleClass('me_hidden');
				$('body').toggleClass('me_stop_scroll');
			});

		author.find('a:nth-child(3)').after(button);
	});
};
