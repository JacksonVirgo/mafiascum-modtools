import { z } from 'zod';
import { BackgroundScript } from '../../../builders/background';
import { GameDefinition, isGameDefinition } from '../types/gameDefinition';
import { getGameDefinition } from './storage';
import browser from 'webextension-polyfill';
import {
	CachedDefinition,
	isCachedDefinition,
	SyncSchema,
} from '../types/subdefs/syncDef';
import { load } from 'cheerio';
const SYNC_TAG_PREFIX = 'syncDef-';

export const getGameSyncDefinition = new BackgroundScript(
	'getGameSyncDefinition',
)
	.input(
		z.object({
			threadId: z.string(),
		}),
	)
	.output(CachedDefinition.nullable())
	.onQuery(async ({ threadId }) => {
		try {
			const tag = SYNC_TAG_PREFIX + threadId;
			const gameDef = await browser.storage.local.get(tag);
			const response = gameDef[tag];

			if (!response) return null;
			if (!isCachedDefinition(response)) return null;
			return response;
		} catch (err) {
			console.log(err);
			return null;
		}
	});

export const saveGameSyncDefinition = new BackgroundScript(
	'saveGameSyncDefinition',
)
	.input(z.object({ threadId: z.string(), syncDef: SyncSchema }))
	.output(
		z
			.object({
				savedSyncDef: CachedDefinition,
				isSame: z.boolean(),
			})
			.nullable(),
	)
	.onQuery(async (saveData) => {
		const { threadId, syncDef } = saveData;
		// const { opPostNum, type } = syncDef;
		try {
			const tag = SYNC_TAG_PREFIX + threadId;
			const fetched = await getGameSyncDefinition.query({
				threadId,
			});

			if (isCachedDefinition(fetched)) {
				const isSame =
					JSON.stringify(fetched) === JSON.stringify(syncDef);
				if (isSame)
					return {
						savedSyncDef: syncDef,
						isSame: true,
					};
			}
			await browser.storage.local.set({
				[tag]: syncDef,
			});

			return {
				savedSyncDef: syncDef,
				isSame: false,
			};
		} catch (err) {
			console.log(err);
			return null;
		}
	});

export const syncFromOp = new BackgroundScript('syncGameDefFromOP')
	.input(
		z.object({
			threadId: z.string(),
			postNum: z.number(),
		}),
	)
	.output(z.boolean())
	.onQuery(async ({ postNum, threadId }) => {
		try {
			const opDef = await fetchOpDefinition(postNum);
			if (!opDef) return false;

			const res = await getGameDefinition.query({
				gameId: threadId,
			});

			console.log(res);

			return true;
		} catch (err) {
			console.log(err);
			return false;
		}
	});

export const syncToOp = new BackgroundScript('syncGameDefToOP')
	.input(
		z.object({
			threadId: z.string(),
			postId: z.number(),
		}),
	)
	.output(z.boolean())
	.onQuery(async ({ postId, threadId }) => {
		try {
			const url = `https://forum.mafiascum.net/posting.php?mode=edit&p=${postId}&mafia_engine_sync_op=${threadId}`;
			await browser.tabs.create({
				url: url,
				active: true,
			});
			return false;
		} catch (err) {
			console.log(err);
			return false;
		}
	});

export async function fetchOpDefinition(
	postNumber: number,
): Promise<GameDefinition | null> {
	try {
		const url = `https://forum.mafiascum.net/viewtopic.php?p=${postNumber}&ppp=1#${postNumber}`;

		const response = await fetch(url);
		if (response.status !== 200)
			throw new Error(`Page not found for ${url}`);
		const html = await response.text();

		const $ = load(html);

		const firstPost = $('.post').first();

		const content = firstPost.find('.content').first();

		const spoilers = content.find('.quotetitle');

		for (const spoiler of spoilers) {
			const title = $(spoiler).find('b').first().text();
			const cutOut = title
				.substring('Spoiler:'.length, title.length)
				.trim();

			if (cutOut == 'MakingSureThisNameIsFullyUnique Settings') {
				const spoilerContent = $(spoiler).next();
				const codebox = spoilerContent
					.find('.codebox > pre > code')
					.first();
				const text = codebox.text();

				if (!text) continue;
				if (text.trim() == '') continue;

				const json = JSON.parse(text);
				if (isGameDefinition(json)) {
					console.log('Loaded', json);
					return json;
				}
			}
		}
		return null;
	} catch (err) {
		console.log('Fetch OP Settings', err);
		return null;
	}
}

export async function updateOpDefinition(
	postNum: number,
	gameDef: GameDefinition,
) {
	try {
		await browser.storage.local.set({
			[postNum]: gameDef,
		});

		/*
			1. Store the def in a temporary storage location, that isn't
				where the typical game def is stored
			2. Open new browser tab on the edit page of the post
				With a particular (and assuredly unique) URL param
			3. Add a client-side script that when the URL param exists
				To request the cached def from storage and update the page
				with that data
			4. Delete the temporary storage
			5. Close the tab
		*/
	} catch (err) {
		console.log(err);
		return null;
	}
}
