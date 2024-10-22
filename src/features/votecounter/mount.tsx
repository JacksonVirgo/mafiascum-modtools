import React from 'react';
import $ from 'jquery';
import { renderReact } from '../../lib/react';
import VcButton from './components/VcButton';
import { createModal, modalManager } from './components/modal';

export default async () => {
	const modal = createModal();
	if (modal) {
		$('.post').each((_, postElement) => {
			const post = $(postElement);
			const author = post.find('.author').first();
			author.find('a:nth-child(3)').after(renderReact(<VcButton onClick={() => {
				modalManager.show
			}} />));
		});
	}
};
