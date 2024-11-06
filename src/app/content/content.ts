import $ from 'jquery';
import mountQuotehighlighting from '../../features/quoteHighlighting/mount';
import mountMultiISO from '../../features/multiISO/mount';
import mountVoteCounter from '../../features/votecounter/mount';
import { fetchUsingDebugMode } from '../popup/debug';
import mountAutoFooter from '../../features/autoFooter/mount';

$(async function () {
	await mountFeatures();
});

async function mountFeatures() {
	const isUsingDebugMode = (await fetchUsingDebugMode()) ?? false;

	mountVoteCounter(isUsingDebugMode);
	mountMultiISO();
	mountQuotehighlighting();
	mountAutoFooter();
}
