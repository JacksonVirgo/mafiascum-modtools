import browser from 'webextension-polyfill';
import { loadScripts } from './scriptHandler';
import { loadScript } from '../../builders/background';

browser.runtime.onMessage.addListener(async (request: unknown) => {
	try {
		if (!request) return Promise.resolve(null);
		if (typeof request != 'object') return Promise.resolve(null);
		if (!('mafiaEngineAction' in request)) return Promise.resolve(null);
		const action = request.mafiaEngineAction;
		if (typeof action != 'string') return Promise.resolve(null);

		const script = loadScript(action);
		if (!script) return Promise.resolve(null);

		const response = await script.query(request);
		if (response) {
			return response;
		}

		return Promise.resolve(null);
	} catch (err) {
		console.log(err);
		return Promise.resolve(null);
	}
});

(async () => {
	await loadScripts();
})();
