import $ from 'jquery';
import { createModal } from './components/vcModal/modal';

import loadVcButtons from './components/vcButton';
import loadMultiIso from './components/multiISO';
import mountHighlightedQuotes from './components/highlightQuotes';

$(async function () {
	const modal = await createModal();
	if (modal) loadVcButtons();
	loadMultiIso();
	mountHighlightedQuotes();
});
