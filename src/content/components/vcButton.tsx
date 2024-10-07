import React from 'react';
import $ from 'jquery';
import { renderReact } from '../../utils/react';
import { modalManager } from './modal';

export default async () => {
	$('.post').each((_, postElement) => {
		const post = $(postElement);
		const author = post.find('.author').first();
		author.find('a:nth-child(3)').after(renderReact(<VcButton />));
	});
};

const VcButton = () => {
	const onClick = () => {
		modalManager.show();
	};

	return (
		<span>
			{' - '}
			<button onClick={onClick} className="tw-text-white">
				VC
			</button>
		</span>
	);
};
