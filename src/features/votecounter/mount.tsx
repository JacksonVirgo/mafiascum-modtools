import React from 'react';
import $ from 'jquery';
import { renderReact } from '../../lib/react';
import VcButton from './components/VcButton';
import { createModal } from './components/modal';
import { stateManager } from './context';

export default async (debug: boolean = false) => {
	const modal = createModal();
	if (modal) {
		$('.post').each((_, postElement) => {
			const post = $(postElement);
			const author = post.find('.author').first();
			const targetElement = author.find('a:nth-child(3)');
			if (targetElement.length <= 0) return;
			targetElement.after(
				renderReact(
					<VcButton onClick={stateManager.show} label="VC" />,
				),
			);

			if (debug) {
				mountPostButton(post, targetElement);
			}
		});
	}
};

function mountPostButton(
	post: JQuery<HTMLElement>,
	targetElement: JQuery<HTMLElement>,
) {
	const postNumberRaw = post.find('span.post-number-bolded').first().text();
	if (!postNumberRaw) return;
	const postNumber = parseInt(postNumberRaw.substring(1));
	if (isNaN(postNumber)) return;

	targetElement.after(
		renderReact(<VcButton onClick={stateManager.show} label="DEBUG" />),
	);
}
