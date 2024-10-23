import { BackgroundScript } from '../../../builders/background';
import { z } from 'zod';
import {
	GameDefinitionSchema,
	isGameDefinition,
} from '../types/gameDefinition';
import browser from 'webextension-polyfill';

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

			console.log('Of', gameDef);
			console.log('Loaded', response);

			if (!response) return null;
			if (!isGameDefinition(response)) return null;
			return response;
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
			console.log('FETCHED', fetched);
			if (isGameDefinition(fetched)) {
				const isSame =
					JSON.stringify(fetched) === JSON.stringify(gameDef);
				if (isSame)
					return {
						savedGameDef: gameDef,
						isSame: true,
					};
			}
			await browser.storage.local.set({
				[tag]: gameDef,
			});
			return {
				savedGameDef: gameDef,
				isSame: false,
			};
		} catch (err) {
			console.log(err);
			return null;
		}
	});
