import $ from 'jquery';
import { convertYamlToJson } from '../../utils/file';
import { isGameDefinition } from '../../types/gameDefinition';
import { formatVoteCountData, startVoteCount } from '../votecount';
import { z } from 'zod';
import { getTemplate } from '../request';
import { trpc } from '..';

let yamlString: string | undefined;

export const CSS_HIDDEN = 'me_hidden';

export async function createModal() {
	const pageTemplate = await getTemplate('vc_popup.html');
	if (!pageTemplate) return null;

	const page = $(pageTemplate);
	page.addClass(CSS_HIDDEN);

	addVisibilityLogic(page);
	addFileUploadLogic(page);
	refreshForm(page);

	const currentURL = window.location.href;
	const pageData = await trpc.getPageData.query({ url: currentURL });
	const initialFormData = pageData ? await trpc.getGameDefinition.query({ thread: pageData.threadId }) : null;
	if (initialFormData) refreshForm(page, initialFormData);

	const vcDataInput = page.find('#me_vc_data');
	vcDataInput.on('input', async () => {
		const value = vcDataInput.val()?.toString();
		const currentURL = window.location.href;
		const pageData = await trpc.getPageData.query({ url: currentURL });
		if (value && pageData?.threadId) {
			await trpc.syncGameDefinition.mutate({ thread: pageData.threadId, data: value });
		}
	});

	const loadingSpinner = page.find('#me_spinner');
	const form = page.find('form');

	const formWrapper = page.find('.wrapper');
	const response = page.find('#me_vc_results');
	const responseTextarea = response.find('textarea');

	form.on('submit', async (e) => {
		e.preventDefault();
		if (!yamlString) return;

		try {
			const parsedJSON = convertYamlToJson(yamlString);
			if (!isGameDefinition(parsedJSON)) return console.error('Invalid game definition.');
			if (parsedJSON.startFrom && !parsedJSON.startAt) parsedJSON.startAt = parsedJSON.startFrom;

			const startPost = parseInt($('#me_start').val() as string) ?? undefined;
			const endPost = parseInt($('#me_end').val() as string) ?? undefined;
			parsedJSON.startAt = isNaN(startPost) ? parsedJSON.startAt ?? 0 : startPost;
			parsedJSON.endAt = isNaN(endPost) ? parsedJSON.endAt : endPost;

			loadingSpinner.removeClass(CSS_HIDDEN);
			formWrapper.addClass(CSS_HIDDEN);
			response.addClass(CSS_HIDDEN);

			const vc = await startVoteCount(parsedJSON);
			console.log('Calculated Votes', vc);
			if (!vc) return console.error('Error starting vote count.');
			const format = formatVoteCountData(vc);

			response.removeClass(CSS_HIDDEN);
			loadingSpinner.addClass(CSS_HIDDEN);
			formWrapper.addClass(CSS_HIDDEN);

			if (format) responseTextarea.val(format);
			else responseTextarea.val('Error formatting vote count data.');
		} catch (err) {
			if (err instanceof z.ZodError) console.error('Validation errors: ', err.errors);
			else console.error('An unexpected error occurred: ', err);
		}
	});

	$('body').append(page);

	return page;
}

function addVisibilityLogic(page: JQuery<HTMLElement>) {
	const exitButton = page.find('#me_exit_vc_popup');

	page.on('click', (e) => {
		if (e.target === page[0]) toggleFormVisibility('invisible');
	});

	if (exitButton) exitButton.on('click', () => toggleFormVisibility('invisible'));
}

/**
 * Sets the visibility of the popup, as well as the scroll-state of the main page
 * @param setManual set the visibility manually, otherwise it just switches state
 */
export function toggleFormVisibility(setManual?: 'visible' | 'invisible') {
	const page = $('#me_votecount');
	if (!page) return;
	if (setManual == undefined) {
		page.toggleClass(CSS_HIDDEN);
		if (page.hasClass(CSS_HIDDEN)) $('body').removeClass('me_stop_scroll');
		else $('body').addClass('me_stop_scroll');
	} else if (setManual === 'visible') {
		page.removeClass(CSS_HIDDEN);
		$('body').addClass('me_stop_scroll');
	} else if (!page.hasClass(CSS_HIDDEN)) {
		page.addClass(CSS_HIDDEN);
		$('body').removeClass('me_stop_scroll');
	}
}

function addFileUploadLogic(page: JQuery<HTMLElement>) {
	const gameDefInput = page.find('#me_game_def');
	const vcDataInput = page.find('#me_vc_data');

	gameDefInput.on('change', (e) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const yaml = e.target?.result?.toString() ?? '';
				yamlString = yaml; // Phase this out

				vcDataInput.val(yaml);
				vcDataInput.trigger('input');

				const json = convertYamlToJson(yaml);
				if (!isGameDefinition(json)) return console.error('Invalid game definition.');

				const startPost = json.startAt ?? 0;
				const endPost = json.endAt ?? undefined;

				$('#me_start').val(startPost);
				if (endPost) $('#me_end').val(endPost);
			} catch (err) {
				console.error(err);
			}
		};
		reader.readAsText(file);
	});
}

function refreshForm(page: JQuery<HTMLElement>, yaml: string = '') {
	const gameDef = convertYamlToJson(yaml);
	const navList = page.find('#me_vc_form_list');
	const inputFields = page.find('.me_input_fields');

	page.find('> section').each((_, el) => {
		const sectionItem = $(el);
		if (sectionItem.hasClass('dynamic')) sectionItem.remove();
	});
	navList.find('li').each((_, el) => {
		const listItem = $(el);
		if (listItem.hasClass('dynamic')) listItem.remove();
	});

	const isGameDef = isGameDefinition(gameDef);
	if (!isGameDef) return;

	gameDef.players.forEach((v) => {
		const inline = `player-${v.split(' ').join('_').toLowerCase()}`;
		const newList = $(`<li data-section="${inline}" class="dynamic">${v}</li>`);
		const newSection = $(`<section data-section="${inline}" class="dynamic form-section"><div>${v}</div></section>`);
		inputFields.append(newSection);
		navList.append(newList);
	});

	const listItems = navList.find('li');
	const sections = inputFields.find('section');
	listItems.each((_, el) => {
		const listItem = $(el);
		listItem.on('click', () => {
			listItems.each((_, el) => {
				$(el).removeClass('focused');
			});
			listItem.addClass('focused');
			const section = listItem.attr('data-section');
			sections.each((_, sectionElement) => {
				const sec = $(sectionElement);
				const secSection = sec.attr('data-section');
				sec.removeClass('focused');
				if (secSection === section) sec.addClass('focused');
			});
		});
	});
}
