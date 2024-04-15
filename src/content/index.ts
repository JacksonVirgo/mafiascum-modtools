import $ from 'jquery';
import { createModal } from './components/modal';
import { mount } from './components/configParser';

import loadVcButtons from './components/vcButton';
import loadMultiIso from './components/multiISO';
import mountHighlightedQuotes from './components/highlightQuotes';

$(async function () {
	const modal = await createModal();
	if (modal) loadVcButtons();
	mount();
	// load react
	// loadMultiIso();
	// mountHighlightedQuotes();
});
