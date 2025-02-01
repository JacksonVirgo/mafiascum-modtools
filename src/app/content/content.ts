import $ from 'jquery';
import mountQuotehighlighting from '../../features/quoteHighlighting/mount';
import mountMultiISO from '../../features/multiISO/mount';
import mountVoteCounter from '../../features/votecounter/mount';
import { fetchUsingDebugMode } from '../popup/debug';
import mountAutoFooter from '../../features/autoFooter/mount';
import { getGameDefinition } from '../../features/votecounter/background/storage';
import {
	getGameSyncDefinition,
	syncFromOp,
} from '../../features/votecounter/background/opSync';

$(async function () {
	await mountFeatures();
});

export const SPOILER_NAME = 'MakingSureThisNameIsFullyUnique Settings';

async function mountFeatures() {
	const isUsingDebugMode = (await fetchUsingDebugMode()) ?? false;

	try {
		const sq = new URLSearchParams(window.location.href);
		const syncSignal = sq.get('mafia_engine_sync_op');
		const editTextArea = $('#message');

		if (syncSignal) {
			if (editTextArea.length >= 0) {
				const gameDef = await getGameDefinition.query({
					gameId: syncSignal,
				});

				if (gameDef) {
					const text = editTextArea.text();

					const FIRST_SPLIT_TOKEN = `[spoiler=${SPOILER_NAME}]`;
					const SECOND_SPLIT_TOKEN = '[/spoiler]';

					const firstSplitArray = text.split(FIRST_SPLIT_TOKEN);
					if (firstSplitArray.length < 2) return;

					const beforeTokenContent = firstSplitArray.shift();
					let workingContent =
						firstSplitArray.join(FIRST_SPLIT_TOKEN) +
						FIRST_SPLIT_TOKEN;

					const secondSplitArray =
						workingContent.split(SECOND_SPLIT_TOKEN);

					const _contentToReplace = secondSplitArray.shift();

					const afterTokenContent =
						SECOND_SPLIT_TOKEN +
						secondSplitArray.join(SECOND_SPLIT_TOKEN);

					const stringifiedGameDef = JSON.stringify(gameDef);

					const modifiedContent = `VCs in this game will be generated using [url=https://forum.mafiascum.net/viewtopic.php?t=91528]JacksonVirgo's Browser Extension Vote-Counter[/url]. We will be updating our settings here, should you wish to generate your own vote counts. [code]${stringifiedGameDef}[/code]`;

					workingContent =
						beforeTokenContent +
						FIRST_SPLIT_TOKEN +
						modifiedContent +
						afterTokenContent;

					editTextArea.val(workingContent);

					const submitBtn = $(
						'#postform > div.panel.bg2 > div > fieldset > input.default-submit-action',
					);

					submitBtn.trigger('click');
				}
			} else {
				console.log(
					'Could not find textarea to edit. Aboring OP editing',
				);
			}

			window.close();
			return;
		}
	} catch (err) {
		console.log(err);
		return;
	}
	const threadId = 12551;

	const gameSync = await getGameSyncDefinition.query({
		threadId: threadId.toString(),
	});

	if (gameSync) {
		const data = await syncFromOp.query({
			threadId: threadId.toString(),
			postNum: gameSync.opPostNum,
		});
		if (isUsingDebugMode)
			console.log('[DEBUG] Sync from OP: ', data ? 'SUCCESS' : 'FAILED');
	}

	mountVoteCounter(isUsingDebugMode);
	mountMultiISO();
	mountQuotehighlighting();
	mountAutoFooter();
}
