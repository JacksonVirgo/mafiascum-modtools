import browser from 'webextension-polyfill';
import { AnyResponse } from '../types/backgroundResponse';
import { verifyMember } from './requests/verifyMember';
import { getPageData } from './requests/getPageData';
import { MemberVerificationRequestValidator, PageRequestValidator } from '../types/backgroundRequests';
import { ZodError } from 'zod';

function sendResponse(response: AnyResponse) {
	return Promise.resolve(response);
}

browser.runtime.onMessage.addListener(async (request) => {
	try {
		const action = request.action;
		if (action === 'verifyMember') {
			const { username } = MemberVerificationRequestValidator.parse(request);
			const verified = await verifyMember(username);
			return sendResponse({ action: 'verifyMember', status: 200, username, verified });
		} else if (action == 'getPageData') {
			const { url } = PageRequestValidator.parse(request);
			const pageData = await getPageData(url);
			if (!pageData) return sendResponse({ status: 500, message: 'Could not fetch data from URL' });

			const { title, lastPage, currentPage, votes } = pageData;
			if (!pageData.title) return sendResponse({ status: 500, message: 'Could not find page title.' });
			if (!lastPage) return sendResponse({ status: 500, message: 'Could not find largest page number.' });
			if (!currentPage) return sendResponse({ status: 500, message: 'Could not find active page number.' });

			return sendResponse({
				action: 'pageData',
				status: 200,
				pageTitle: title,
				lastPage,
				currentPage,
				votes,
			});
		} else {
			return sendResponse({ status: 400, message: 'Invalid request, unknown action' });
		}
	} catch (err) {
		console.log(err);
		if (err instanceof ZodError) {
			return sendResponse({ status: 400, message: 'Invalid input' });
		} else {
			return sendResponse({ status: 500, message: 'Unexpected error' });
		}
	}
});
