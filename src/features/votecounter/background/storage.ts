import { BackgroundScript } from '../../../builders/background';
import { z } from 'zod';
import {
	GameDefinitionSchema,
	isGameDefinition,
} from '../../../types/gameDefinition';
import browser from 'webextension-polyfill';

const TAG_PREFIX = 'gameDef-';

export const getGameDefinition = new BackgroundScript('getGameDefinition')
	.input(
		z.object({
			gameId: z.string(),
		}),
	)
	.onQuery(async ({ gameId }) => {
		try {
			const tag = TAG_PREFIX + gameId;
			const gameDef = await browser.storage.local.get(tag);
			const response = gameDef[tag];
			if (!response) return null;
			if (!isGameDefinition(response)) return null;
			return response;
		} catch (err) {
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
	.onQuery(async ({ gameId, gameDef }) => {
		try {
			const tag = TAG_PREFIX + gameId;
			const fetched = await getGameDefinition.query({ gameId });
			if (isGameDefinition(fetched)) {
				const isSame =
					JSON.stringify(fetched) === JSON.stringify(gameDef);
				if (isSame) return true;
			}
			await browser.storage.local.set({
				[tag]: gameDef,
			});
			return true;
		} catch (err) {
			return false;
		}
	});
