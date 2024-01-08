import $ from 'jquery';
import { createModal } from './components/modal';

import loadVcButtons from './components/vcButton';
import loadMultiIso from './components/multiISO';

$(async function () {
	const modal = await createModal();
	if (modal) loadVcButtons();
	loadMultiIso();
});
