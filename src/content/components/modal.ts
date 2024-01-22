import $ from 'jquery';
import { convertJsonToYaml, convertYamlToJson } from '../../utils/file';
import { isGameDefinition } from '../../types/gameDefinition';
import { formatVoteCountData, startVoteCount } from '../votecount';
import { z } from 'zod';
import { getTemplate } from '../request';
import { trpc } from '..';

type JQueryElement = JQuery<HTMLElement>;

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

	addNewPlayerForm(page);

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

function addVisibilityLogic(page: JQueryElement) {
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

function addFileUploadLogic(page: JQueryElement) {
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

				refreshForm(page, yaml);
				gameDefInput.val('');
			} catch (err) {
				console.error(err);
			}
		};
		reader.readAsText(file);
	});
}

function refreshForm(page: JQueryElement, yaml: string = '') {
	const gameDef = convertYamlToJson(yaml);
	const navList = page.find('#me_vc_form_list');
	const inputFields = page.find('.me_input_fields');

	page.find('.me_input_fields')
		.find('section')
		.each((_, el) => {
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
		const newSection = createPlayerSection({
			username: v,
		});
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

	const usernameInput = page.find('#me_add_user_username');
	const replacementInput = page.find('#me_add_user_replacement');
	const deathInput = page.find('#me_add_user_death');
	const aliasInput = page.find('#me_add_user_aliases');

	usernameInput.val('');
	replacementInput.val('');
	deathInput.val('');
	aliasInput.val('');
}

type PlayerSection = {
	username: string;
	replacing?: string;
	diedAt?: number;
	aliases?: string[];
};
function createPlayerSection(player: PlayerSection) {
	const dataSection = `player-${player.username.split(' ').join('_').toLowerCase()}`;

	const wrapper = $('<div></div>');
	const usernameForm = $('<div></div>');
	usernameForm.append($(`<label for="dynamic-${dataSection}">Username</label>`));
	usernameForm.append($(`<input type="text" id="dynamic-${dataSection}" name="dynamic-${dataSection}" value="${player.username}" />`));

	wrapper.append(usernameForm);

	const newSection = $(`<section data-section="${dataSection}" class="dynamic form-section"></section>`);
	newSection.append(wrapper);

	return newSection;
}

function addNewPlayerForm(page: JQueryElement) {
	const addNewPlayerButton = page.find('#me_add_new_player');

	const usernameInput = page.find('#me_add_user_username');
	const replacementInput = page.find('#me_add_user_replacement');
	const deathInput = page.find('#me_add_user_death');
	const aliasInput = page.find('#me_add_user_aliases');

	addNewPlayerButton.on('click', async (e) => {
		e.preventDefault();
		let username = usernameInput.val()?.toString();
		if (!username) return;
		username = username.trim();

		const replacement = replacementInput.val()?.toString();
		const deathPostStr = deathInput.val()?.toString();
		const deathPost = deathPostStr ? parseInt(deathPostStr) : NaN;
		const aliases = (aliasInput.val()?.toString() ?? '')
			.split(',')
			.map((v) => v.trim())
			.filter((v) => v != '');

		const currentURL = window.location.href;
		const pageData = await trpc.getPageData.query({ url: currentURL });
		const threadId = pageData?.threadId;
		if (!threadId) return;
		const initialFormData = await trpc.getGameDefinition.query({ thread: threadId });
		if (!initialFormData) return;

		const gameDef = convertYamlToJson(initialFormData);
		const validated = isGameDefinition(gameDef);
		if (!validated) return;

		console.log('Validated');

		if (gameDef.players.includes(username)) return;
		gameDef.players.push(username);

		if (deathPost) {
			if (!gameDef.dead) gameDef.dead = {};
			gameDef.dead[username] = deathPost;
		}

		if (replacement) {
			if (!gameDef.replacements) gameDef.replacements = {};
			gameDef.replacements[replacement] = [username];
		}

		if (aliases && aliases.length > 0) {
			if (!gameDef.aliases) gameDef.aliases = {};
			gameDef.aliases[username] = aliases;
		}

		const newYaml = convertJsonToYaml(gameDef);
		console.log(newYaml);
		if (!newYaml) return;

		await trpc.syncGameDefinition.mutate({ thread: threadId, data: newYaml });

		refreshForm(page, newYaml);
	});
}
