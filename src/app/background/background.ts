import browser from 'webextension-polyfill';
import { loadScripts } from './scriptHandler';
import { loadScript } from '../../builders/background';

function sendResponse(request: unknown, response: unknown) {
	console.log('Responding', request, response);
	return Promise.resolve(response);
}

browser.runtime.onMessage.addListener(
	async (request: unknown): Promise<unknown> => {
		try {
			if (!request) return sendResponse(request, null);
			if (typeof request != 'object') return sendResponse(request, null);
			if (!('mafiaEngineAction' in request))
				return sendResponse(request, null);
			const action = request.mafiaEngineAction;
			if (typeof action != 'string') return sendResponse(request, null);

			const script = loadScript(action);
			if (!script) {
				console.log('Unknown action', action);
				return sendResponse(request, null);
			}

			const response = await script.query(request);
			if (response) return response;

			return sendResponse(request, null);
		} catch (err) {
			console.log(err);
			return sendResponse(request, null);
		}
	},
);

(async () => {
	await loadScripts();
})();
