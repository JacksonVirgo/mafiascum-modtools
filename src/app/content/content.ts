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
		console.log(syncSignal);
		if (syncSignal) {
			console.log('Here');
			const gameDef = await getGameDefinition.query({
				gameId: syncSignal,
			});

			if (gameDef) {
				let textarea = $('#message');

				const text = textarea.text();

				const FIRST_SPLIT = `[spoiler=${SPOILER_NAME}]`;
				const SECOND_SPLIT = `[/spoiler]`;

				const arr = text.split(`[spoiler=${SPOILER_NAME}]`);
				if (arr.length < 2) return;

				const first = arr.shift();
				let combined = arr.join(`[spoiler=${SPOILER_NAME}]`);

				const secondArr = combined.split('[/spoiler]');
				const second = secondArr.shift();

				combined = secondArr.join('[/spoiler]');

				const stringifiedGameDef = JSON.stringify(gameDef);

				let content = `VCs in this game will be generated using [url=https://forum.mafiascum.net/viewtopic.php?t=91528]JacksonVirgo's Browser Extension Vote-Counter[/url]. We will be updating our settings here, should you wish to generate your own vote counts. [code]${stringifiedGameDef}[/code]`;

				const totalVal =
					first + FIRST_SPLIT + content + SECOND_SPLIT + combined;

				textarea.val(totalVal);

				const submitBtn = $(
					'#postform > div.panel.bg2 > div > fieldset > input.default-submit-action',
				);

				submitBtn.trigger('click');
			}

			// window.close();
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
		console.log(`[DEBUG] Sync from OP: `, data ? 'SUCCESS' : 'FAILED');
	}

	mountVoteCounter(isUsingDebugMode);
	mountMultiISO();
	mountQuotehighlighting();
	mountAutoFooter();
}
