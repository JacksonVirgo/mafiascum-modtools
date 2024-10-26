import { BackgroundScript } from '../../../builders/background';
import { z } from 'zod';
import browser from 'webextension-polyfill';

const TAG = 'quoteHighlighting';

export const getQuoteHighlighting = new BackgroundScript('getHighlightQuotes')
	.input(z.object({}))
	.output(z.boolean())
	.onQuery(async () => {
		return await fetchQuoteHighlighting();
	});

export const fetchQuoteHighlighting = async () => {
	try {
		const setting = await browser.storage.local.get(TAG);
		if (!setting) return false;
		return setting[TAG] == 'on';
	} catch (err) {
		console.log(err);
		return false;
	}
};

export const saveQuoteHighlighting = async (enabled: boolean) => {
	try {
		await browser.storage.local.set({ [TAG]: enabled ? 'on' : 'off' });
	} catch (err) {
		console.log(err);
	}
};
