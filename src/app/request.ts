import { AnyRequest } from '../types/backgroundRequests';
import browser from 'webextension-polyfill';
export async function sendBackgroundRequest(request: AnyRequest) {
	return await browser.runtime.sendMessage(request);
}
