import $ from 'jquery';
import { convertYamlToJson } from '../utils/file';
import { GameDefinition, validateGameDefinition } from '../types/gameDefinition';
import { startVoteCount } from './votecount';

let yamlString: string | undefined;
let formattedVoteCount: string | undefined;

export function createModal() {
	const page = $('<div class="mafia-engine-modal-page mafia-engine-modal-closed"/>');

	page.on('click', (e) => {
		if (e.target === page[0]) {
			page.addClass('mafia-engine-modal-closed');
		}
	});

	const modal = $('<div class="mafia-engine-modal"/>');

	const header = $('<div class="mafia-engine-modal-header"/>');
	header.append($('<span class="exit">❌</span>').on('click', () => page.addClass('mafia-engine-modal-closed')));
	modal.append(header);

	modal.append(
		$('<div class="mafia-engine-modal-content"/>')
			.append($('<h1>Vote Count</h1>'))
			.append(
				$('<p>Welcome to the Mafia Scum vote-count tool made by JacksonVirgo<br/>To start, please select where the game definition is</p>')
			)
	);

	const spinner = createSpinner();
	modal.append(spinner);

	const form = createForm((def: GameDefinition) => {
		onFormSubmit(def);
	});

	const response = createResponse();
	modal.append(response);
	const responseTextarea = response.find('textarea');

	const onFormSubmit = async (def: GameDefinition) => {
		spinner.removeClass('spinner-hidden');
		form.addClass('mafia-engine-form-hidden');
		response.addClass('response-hidden');

		const vc = await startVoteCount(def);
		if (!vc) return console.error('Error starting vote count.');

		const data = vc.voteCount
			.map((v) => {
				const { author, vote, post } = v;
				return `${author} posted "${vote}" on post ${post}`;
			})
			.join('\n');

		spinner.addClass('spinner-hidden');
		form.addClass('mafia-engine-form-hidden');

		responseTextarea.val(data ?? 'Error formatting vote count data.');

		response.removeClass('response-hidden');
	};

	modal.append(form);

	return page.append(modal);
}

export function createForm(onSubmit: (def: GameDefinition) => void) {
	const form = $('<form class="mafia-engine-form" id="mafia-engine-form"/>');
	form.append($('<label for="mafia-engine-yaml" class="required">Upload game definition file</label>'))
		.append(
			$('<input type="file" id="mafia-engine-yaml" name="mafia-engine-yaml" accept=".yaml,.yml" />').on('change', (e) => {
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
			})
		)
		.append($('<label for="mafia-engine-yaml">Start From Post #</label>'))
		.append($('<input type="number" id="mafia-engine-start-post" name="mafia-engine-start-post" placeholder="Default = 0" />'))

		.append($('<label for="mafia-engine-yaml">End At Post #</label>'))
		.append($('<input type="number" id="mafia-engine-end-post" name="mafia-engine-end-post" placeholder="Default = none" />'))

		.append(
			$('<input type="submit" value="Load Game Definition"/>').on('click', async (e) => {
				e.preventDefault();
				console.log('Form Submitted', yamlString);

				if (!yamlString) return;
				const parsedJSON = convertYamlToJson(yamlString);

				const gameDefinition = validateGameDefinition(parsedJSON);
				if (!gameDefinition) return console.error('Invalid game definition.');

				const startPost = parseInt($('#mafia-engine-start-post').val() as string) ?? undefined;
				const endPost = parseInt($('#mafia-engine-end-post').val() as string) ?? undefined;

				gameDefinition.startFrom = isNaN(startPost) ? 0 : startPost;
				gameDefinition.endAt = isNaN(endPost) ? undefined : endPost;

				onSubmit(gameDefinition);
			})
		);

	return form;
}

export function createSpinner() {
	const spinner = $('<div class="mafia-engine-spinner spinner-hidden"/>');
	const loadingSpinner = $('<div class="lds-ripple"><div></div><div></div></div>');
	return spinner.append(loadingSpinner);
}

export function createResponse() {
	const response = $('<div class="mafia-engine-response response-hidden"><p>To redo this form, refresh the page.</p><textarea/></div>');
	return response;
}
