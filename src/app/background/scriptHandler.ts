import getPageData from '../../features/votecounter/background/getPageData';
import {
	getGameDefinition,
	saveGameDefinition,
} from '../../features/votecounter/background/storage';
import { getQuoteHighlighting } from '../../features/quoteHighlighting/background/storage';
export async function loadScripts() {
	getPageData.ensureLoaded();
	getGameDefinition.ensureLoaded();
	saveGameDefinition.ensureLoaded();
	getQuoteHighlighting.ensureLoaded();
}
