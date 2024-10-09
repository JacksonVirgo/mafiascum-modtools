import { GameDefinition } from '../../types/newGameDefinition';
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
	const tag = `gameDef-${gameId}`;
	try {
		await browser.storage.local.set({
			[tag]: gameDef,
		});
		return true;
	} catch (err) {
		return false;
	}
}

export async function loadGameDef(gameId: string) {
	try {
		const gameDef = await browser.storage.local.get(gameId);
		return gameDef[gameId];
	} catch (err) {
		return null;
	}
}
