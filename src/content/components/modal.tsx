import React, {
	createRef,
	forwardRef,
	useImperativeHandle,
	useState,
} from 'react';

import $ from 'jquery';
import { convertYamlToJson } from '../../utils/file';
import { isGameDefinition } from '../../types/gameDefinition';
import { formatVoteCountData, startVoteCount } from '../votecount';
import { z } from 'zod';
import { getTemplate } from '../request';
import { FileInput } from './form/FileInput';
import NumberInput from './form/NumberInput';
import LoadingSpinner from './indicators/LoadingSpinner';
import { renderReact } from '../../utils/react';

let yamlString: string | undefined;

export const CSS_HIDDEN = 'me_hidden';

export async function createModal() {
	const pageTemplate = await getTemplate('vc_popup.html');
	if (!pageTemplate) return null;

	const modal = renderReact(<Modal ref={modalRef} />);

	const page = $(pageTemplate);
	page.addClass(CSS_HIDDEN);

	addFileUploadLogic(page);

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
			if (!isGameDefinition(parsedJSON))
				return console.error('Invalid game definition.');
			if (parsedJSON.startFrom && !parsedJSON.startAt)
				parsedJSON.startAt = parsedJSON.startFrom;

			const startPost =
				parseInt($('#me_start').val() as string) ?? undefined;
			const endPost = parseInt($('#me_end').val() as string) ?? undefined;
			parsedJSON.startAt = isNaN(startPost)
				? parsedJSON.startAt ?? 0
				: startPost;
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
			if (err instanceof z.ZodError)
				console.error('Validation errors: ', err.errors);
			else console.error('An unexpected error occurred: ', err);
		}
	});

	$('body').append(modal);

	return modal;
}

function addFileUploadLogic(page: JQuery<HTMLElement>) {
	const gameDefInput = page.find('#me_game_def');
	gameDefInput.on('change', (e) => {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			try {
				const yaml = e.target?.result as string;
				yamlString = yaml; // Phase this out

				const json = convertYamlToJson(yaml);
				if (!isGameDefinition(json))
					return console.error('Invalid game definition.');

				const startPost = (json.startAt || json.startFrom) ?? 0;
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

enum ModalState {
	Form,
	Loading,
	Response,
}

interface ModalHandle {
	show: () => void;
	hide: () => void;
}
const modalRef = createRef<ModalHandle>();
export const modalManager = {
	show: () => {
		console.log('Entered SHOW', !!modalRef.current);
		if (modalRef.current) {
			modalRef.current.show();
		}
	},
	hide: () => {
		if (modalRef.current) {
			modalRef.current.hide();
		}
	},
};

export const Modal = forwardRef((_props, ref) => {
	const [isVisible, setIsVisible] = useState(false);
	const [currentState, _] = useState(ModalState.Form);

	useImperativeHandle(ref, () => ({
		show: () => {
			console.log('Opening modal');
			setIsVisible(true);
		},
		hide: () => setIsVisible(false),
	}));

	return (
		<div
			id="me_votecount"
			className={`tw-fixed tw-top-0 tw-left-0 tw-w-screen tw-h-screen tw-bg-[rgba(0, 0, 0, 0.3)] tw-backdrop-blur-sm tw-z-[50] tw-flex tw-flex-col tw-justify-center tw-items-center ${
				isVisible ? '' : '!tw-hidden'
			}`}
		>
			<div className="tw-aspect-[3/2] tw-h-1/2 tw-max-h-1/2 tw-flex tw-flex-col tw-bg-primary-color tw-p-4 tw-rounded-[15px] tw-border-2 tw-border-white tw-justify-center tw-items-center">
				{currentState == ModalState.Loading && <LoadingSpinner />}
				{currentState == ModalState.Form && <ModalForm />}
			</div>

			{/* {currentState == ModalState.Loading && <LoadingSpinner />}
			{currentState == ModalState.Form && (
				
			)}
			{currentState == ModalState.Response && (
				<div
					id="me_vc_results"
					className={
						currentState === ModalState.Response ? '' : CSS_HIDDEN
					}
				>
					<div className="me_exit_button_wrapper">
						<span id="me_exit_vc_popup">❌</span>
					</div>
					<p>To redo this form, refresh the page.</p>
					<textarea></textarea>
				</div>
			)} */}
		</div>
	);
});

export const ModalForm = () => {
	return (
		<form className="tw-border-2 tw-border-white tw-grow tw-w-full tw-flex tw-flex-row">
			<nav>
				<ul className="tw-list-none">
					<li className="focused" data-section="general">
						General
					</li>
				</ul>
			</nav>

			<div className="tw-flex tw-flex-col tw-gap-0">
				<section data-section="general" className="focused tw-grow">
					<FileInput
						name="me_game_def"
						label="Import Definition File:"
						accept=".yaml,.yml"
					/>

					<NumberInput
						name="me_start"
						label="Start from Post #"
						placeholder="Default = 0"
					/>

					<NumberInput
						name="me_end"
						label="End at Post #"
						placeholder="Default = none"
					/>
				</section>

				<div className="tw-shrink">
					<button>Generate Votecount</button>
				</div>
			</div>
		</form>
	);
};
