import { AnyRequest } from '../types/backgroundRequests';
import browser from 'webextension-polyfill';
export async function sendBackgroundRequest(request: AnyRequest): Promise<unknown> {
	return await browser.runtime.sendMessage(request);
}

export async function getTemplate(templateName: string) {
	let fileName = `templates/${templateName}`;
	if (!templateName.endsWith('.html')) fileName += '.html';

	try {
		const url = browser.runtime.getURL(fileName);
		console.log(url);

		const data = await fetch(url);
		return await data.text();
	} catch (err) {
		console.log(err);
		return null;
	}
}

export async function loadElement(templateName: string) {
	const template = await getTemplate(templateName);
	if (!template) return null;
	return $(template);
}
