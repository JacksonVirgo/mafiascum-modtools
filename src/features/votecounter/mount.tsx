import React from 'react';
import $ from 'jquery';
import { renderReact } from '../../lib/react';
import VcButton from './components/VcButton';
import { createModal } from './components/modal';
import { stateManager } from './context';
import {
	fetchRelativeUrl,
	getThreadFromRelativeUrl,
} from './utils/votecounter';
import { getPageData } from './utils/thread';

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
					<VcButton
						onClick={() => {
							const updatePostNum = () => {
								const postNumberRaw = post
									.find('span.post-number-bolded')
									.first()
									.text();
								if (!postNumberRaw) return;
								const postNumber = parseInt(
									postNumberRaw.substring(1),
								);
								if (isNaN(postNumber)) return;
								stateManager.setPostNum(postNumber);
							};
							updatePostNum();
							stateManager.show();
						}}
						label="VC"
					/>,
				),
			);

			if (debug) mountPostButton(post, targetElement);
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

	const onClick = async () => {
		const relativeUrl = fetchRelativeUrl();
		if (!relativeUrl) throw new Error('No thread relative url found.');

		const threadId = getThreadFromRelativeUrl(relativeUrl);
		if (!threadId) throw new Error('No thread id found.');

		const pageData = await getPageData({
			threadId,
			take: 1,
			skip: postNumber,
		});

		if (!pageData) throw new Error('Could not fetch page data.');

		console.log(pageData.posts);
		const post = pageData.posts.find((p) => p.postNumber === postNumber);
		if (!post) throw new Error('Could not find post.');

		console.log(`[ DEBUG #${postNumber}]`, post);
	};

	targetElement.after(
		renderReact(<VcButton onClick={onClick} label="DEBUG" />),
	);
}
