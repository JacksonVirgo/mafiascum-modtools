import {
	GameDefinition,
	isGameDefinition,
} from '../../types/newGameDefinition';
import browser from 'webextension-polyfill';

const TAG_PREFIX = 'gameDef-';
export function generateTag(gameId: string) {
	return TAG_PREFIX + gameId;
}

export function parseTag(tag: string) {
	if (!tag.startsWith(TAG_PREFIX)) return null;
	const newTag = tag.slice(TAG_PREFIX.length);
	return newTag;
}

export async function saveGameDef(gameId: string, gameDef: GameDefinition) {
	const tag = generateTag(gameId);
	try {
		const fetched = await loadGameDef(gameId);
		if (isGameDefinition(fetched)) {
			const isSame = JSON.stringify(fetched) === JSON.stringify(gameDef);
			if (isSame) return true;
		}

		await browser.storage.local.set({
			[tag]: gameDef,
		});

		return true;
	} catch (err) {
		return false;
	}
}

export async function loadGameDef(gameId: string) {
	const tag = generateTag(gameId);
	try {
		const gameDef = await browser.storage.local.get(tag);
		const response = gameDef[tag];
		if (!response) return null;
		if (!isGameDefinition(response)) return null;
		return response;
	} catch (err) {
		return null;
	}
}
