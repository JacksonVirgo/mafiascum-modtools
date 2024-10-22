import browser from 'webextension-polyfill';
const storage = browser.storage.sync || browser.storage.local;
const HIGHLIGHT = 'highlightQuotes';

export const getHighlight = async () => {
	try {
		const { highlightQuotes } = await storage.get(HIGHLIGHT);
		if (typeof highlightQuotes !== 'string') {
			return null;
		}
		return highlightQuotes;
	} catch (error) {
		console.error('Error fetching highlightQuotes:', error);
	}
};
