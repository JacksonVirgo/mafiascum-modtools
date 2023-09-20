import $ from 'jquery';
import { convertYamlToJson } from '../utils/file';
import { isGameDefinition } from '../types/gameDefinition';
import { formatVoteCountData, startVoteCount } from './votecount';
import { z } from 'zod';
import { getTemplate } from './request';

let yamlString: string | undefined;

export const CSS_HIDDEN = 'mafia-engine-hidden';

export async function createModal() {
	const pageTemplate = await getTemplate('gamedef.html');
	if (!pageTemplate) return null;

	const page = $(pageTemplate);

	page.addClass(CSS_HIDDEN);

	const exitButton = page.find('.modal > .header > .exit');
	const loadingSpinner = page.find('.modal > .mafia-engine-spinner');
	const form = page.find('.modal > form');
	const response = page.find('.modal > .response');
	const responseTextarea = response.find('textarea');

	loadingSpinner.addClass(CSS_HIDDEN);
	response.addClass(CSS_HIDDEN);
	form.removeClass(CSS_HIDDEN);

	const exitModal = (e: JQuery.ClickEvent) => {
		if (e.target === page[0]) page.addClass(CSS_HIDDEN);
	};
	page.on('click', exitModal);
	exitButton.on('click', exitModal);

	const gameDefinitionUpload = form.find('#mafia-engine-yaml');
	gameDefinitionUpload.on('change', (e) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const yaml = e.target?.result as string;
				yamlString = yaml;
			} catch (err) {
				console.error(err);
			}
		};
		reader.readAsText(file);
	});

	form.on('submit', async (e) => {
		e.preventDefault();
		if (!yamlString) return;

		try {
			const parsedJSON = convertYamlToJson(yamlString);
			if (!isGameDefinition(parsedJSON)) return console.error('Invalid game definition.');

			const startPost = parseInt($('#mafia-engine-start-post').val() as string) ?? undefined;
			const endPost = parseInt($('#mafia-engine-end-post').val() as string) ?? undefined;
			parsedJSON.startFrom = isNaN(startPost) ? parsedJSON.startFrom ?? 0 : startPost;
			parsedJSON.endAt = isNaN(endPost) ? parsedJSON.endAt : endPost;

			loadingSpinner.removeClass(CSS_HIDDEN);
			form.addClass(CSS_HIDDEN);
			response.addClass(CSS_HIDDEN);

			const vc = await startVoteCount(parsedJSON);
			if (!vc) return console.error('Error starting vote count.');
			const format = formatVoteCountData(vc);

			response.removeClass(CSS_HIDDEN);
			loadingSpinner.addClass(CSS_HIDDEN);
			form.addClass(CSS_HIDDEN);

			if (format) responseTextarea.val(format);
			else responseTextarea.val('Error formatting vote count data.');
		} catch (err) {
			if (err instanceof z.ZodError) console.error('Validation errors: ', err.errors);
			else console.error('An unexpected error occurred: ', err);
		}
	});

	return page;
}
