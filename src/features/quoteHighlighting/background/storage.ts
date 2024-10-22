import { BackgroundScript } from '../../../builders/background';
import { z } from 'zod';
import {
	GameDefinitionSchema,
	isGameDefinition,
} from '../../../types/gameDefinition';
import browser from 'webextension-polyfill';

const TAG = 'quoteHighlighting';

export const getQuoteHighlighting = new BackgroundScript('getHighlightQuotes')
	.input(z.object({}))
	.output(z.boolean())
	.onQuery(async () => {
		try {
			const setting = await browser.storage.local.get(TAG);
			if (!setting[TAG]) return false;
			return setting[TAG] == 'on';
		} catch (err) {
			console.log(err);
			return false;
		}
	});

const d = getQuoteHighlighting.query({});
