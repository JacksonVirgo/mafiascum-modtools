import $ from 'jquery';
import { convertYamlToJson } from '../utils/file';
import { validateGameDefinition } from '../types/gameDefinition';

let yamlString: string | undefined;

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

			.append(
				$('<form class="mafia-engine-form"/>')
					.append($('<label for="mafia-engine-yaml">Paste in game definition file</label>'))
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
					.append(
						$('<input type="submit" value="Load Game Definition"/>').on('click', (e) => {
							e.preventDefault();
							console.log('Form Submitted', yamlString);

							if (!yamlString) return;
							const parsedJSON = convertYamlToJson(yamlString);

							const gameDefinition = validateGameDefinition(parsedJSON);
							if (!gameDefinition) return console.error('Invalid game definition.');
							console.log(gameDefinition);
						})
					)
			)
	);

	return page.append(modal);
}
