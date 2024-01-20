import $ from 'jquery';
import { createModal } from './components/modal';

import loadVcButtons from './components/vcButton';
import loadMultiIso from './components/multiISO';
import mountHighlightedQuotes from './components/highlightQuotes';

import { createTRPCProxyClient } from '@trpc/client';
import browser from 'webextension-polyfill';
import type { AppRouter } from '../background/background';
import { chromeLink } from '../utils/trpc/link';

const port = browser.runtime.connect();
export const trpc = createTRPCProxyClient<AppRouter>({
	links: [
		chromeLink({
			port,
		}),
	],
});
$(async function () {
	const modal = await createModal();
	if (modal) loadVcButtons();
	loadMultiIso();
	mountHighlightedQuotes();
});
