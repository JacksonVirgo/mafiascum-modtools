import $ from 'jquery';
// import { convertYamlToJson } from '../utils/file';
// import { GameDefinition, isGameDefinition } from '../types/gameDefinition';
// import { formatVoteCountData, startVoteCount } from './votecount';
// import { z } from 'zod';
import { getTemplate } from './request';

// let yamlString: string | undefined;

export const CSS_HIDDEN = 'mafia-engine-hidden';

export async function createModal() {
	const pageTemplate = await getTemplate('gamedef.html');
	if (!pageTemplate) return null;

	const page = $(pageTemplate);
	page.on('click', (e) => {
		if (e.target === page[0]) page.addClass(CSS_HIDDEN);
	});

	return page;
}
