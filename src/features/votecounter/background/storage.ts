import { BackgroundScript } from '../../../builders/background';
import { z } from 'zod';
import {
	GameDefinition,
	GameDefinitionSchema,
	isGameDefinition,
} from '../types/gameDefinition';
import browser from 'webextension-polyfill';
import { load } from 'cheerio';
import { getGameSyncDefinition, syncToOp } from './opSync';

const TAG_PREFIX = 'gameDef-';

export const getGameDefinition = new BackgroundScript('getGameDefinition')
	.input(
		z.object({
			gameId: z.string(),
		}),
	)
	.output(GameDefinitionSchema.nullable())
	.onQuery(async ({ gameId }) => {
		try {
			const tag = TAG_PREFIX + gameId;
			const gameDef = await browser.storage.local.get(tag);
			const response = gameDef[tag];

			if ('isSync' in response) {
				if (response.type == 'thread') {
					const opPostNum = response.opPostNum;
				}
			} else {
				if (!response) return null;
				if (!isGameDefinition(response)) return null;
				return response;
			}
		} catch (err) {
			console.log(err);
			return null;
		}
	});

export const saveGameDefinition = new BackgroundScript('saveGameDefinition')
	.input(
		z.object({
			gameId: z.string(),
			gameDef: GameDefinitionSchema,
		}),
	)
	.output(
		z
			.object({
				savedGameDef: GameDefinitionSchema,
				isSame: z.boolean(),
			})
			.nullable(),
	)
	.onQuery(async ({ gameId, gameDef }) => {
		console.log('Saving Game Def', gameId, gameDef);
		try {
			const tag = TAG_PREFIX + gameId;
			const fetched = await getGameDefinition.query({ gameId });

			if (
				gameDef.days.length == 0 &&
				gameDef.players.length == 0 &&
				gameDef.votes.length == 0
			) {
				console.log('Skipping saving empty game def');
				return null;
			}

			console.log('AHHHHHHH');
			console.log(gameDef);

			let isSame = false;
			if (fetched && isGameDefinition(fetched)) {
				const normalizedFetch = JSON.stringify(
					normalizeObject(fetched),
				).trim();
				const normalizedGameDef = JSON.stringify(
					normalizeObject(gameDef),
				).trim();

				console.log(normalizedGameDef, '\n', normalizedFetch);
				isSame = normalizedGameDef === normalizedFetch;
				console.log(`Is above equal?: ${isSame}`);

				if (isSame)
					return {
						savedGameDef: gameDef,
						isSame: true,
					};
			}
			await browser.storage.local.set({
				[tag]: gameDef,
			});

			if (!isSame) {
				const gameSync = await getGameSyncDefinition.query({
					threadId: gameId,
				});

				if (gameSync) {
					await syncToOp.query({
						threadId: gameId,
						postId: gameSync.opPostNum,
					});
				}
			}

			return {
				savedGameDef: gameDef,
				isSame: false,
			};
		} catch (err) {
			console.log(err);
			return null;
		}
	});

export function normalizeObject(input: { [key: string]: any }): any {
	if (Array.isArray(input)) {
		return input
			.map(normalizeObject)
			.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
	} else if (
		input &&
		typeof input === 'object' &&
		input.constructor === Object
	) {
		const normalizedObject: { [key: string]: any } = {};
		Object.keys(input)
			.sort()
			.forEach((key) => {
				normalizedObject[key] = normalizeObject(input[key]);
			});
		return normalizedObject;
	} else {
		return input;
	}
}
