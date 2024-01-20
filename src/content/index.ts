import $ from 'jquery';
import { createModal } from './components/modal';

import loadVcButtons from './components/vcButton';
import loadMultiIso from './components/multiISO';
import mountHighlightedQuotes from './components/highlightQuotes';

import { createTRPCProxyClient } from '@trpc/client';
import browser from 'webextension-polyfill';
import type { AppRouter } from '../background/background';
import { chromeLink } from '../utils/trpc/link';

const pingFunc = async () => {
	await browser.runtime.sendMessage({ action: 'openConnection' });
	setTimeout(() => {
		pingFunc();
	}, 500);
};

export let trpc = connectTRPC();
function connectTRPC() {
	const port = browser.runtime.connect();
	const new_trpc = createTRPCProxyClient<AppRouter>({
		links: [
			chromeLink({
				port,
				onDisconnect() {
					trpc = connectTRPC();
				},
			}),
		],
	});

	pingFunc();

	return new_trpc;
}

$(async function () {
	const modal = await createModal();
	if (modal) loadVcButtons();
	loadMultiIso();
	mountHighlightedQuotes();
});
