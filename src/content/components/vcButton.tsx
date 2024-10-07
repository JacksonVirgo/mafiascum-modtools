import React from 'react';
import $ from 'jquery';
import { renderReact } from '../../utils/react';

export default async () => {
	$('.post').each((_, postElement) => {
		const post = $(postElement);
		const author = post.find('.author').first();
		author.find('a:nth-child(3)').after(renderReact(<VcButton />));
	});
};

const VcButton = () => {
	const onClick = () => {
		const dialog = $('#me_votecount');
		if (!dialog) return;
		dialog.toggleClass('me_hidden');
		$('body').toggleClass('me_stop_scroll');
	};

	return (
		<span className="mafia-engine-vc">
			{' - '}
			<button onClick={onClick}>VC</button>
		</span>
	);
};
