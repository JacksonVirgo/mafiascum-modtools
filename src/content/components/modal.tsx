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
import { FileInput } from './form/FileInput';
import NumberInput from './form/NumberInput';
import LoadingSpinner from './indicators/LoadingSpinner';
import { renderReact } from '../../utils/react';

export const CSS_HIDDEN = 'me_hidden';

export async function createModal() {
	const modal = renderReact(<Modal ref={modalRef} />);
	$('body').append(modal);
	return modal;
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
			setIsVisible(true);
		},
		hide: () => setIsVisible(false),
	}));

	return (
		<div
			id="me_votecount"
			className={`fixed top-0 left-0 w-screen h-screen bg-[rgba(0, 0, 0, 0.3)] backdrop-blur-sm z-[50] flex flex-col justify-center items-center ${
				isVisible ? '' : '!hidden'
			}`}
		>
			<div className="aspect-[3/2] h-1/2 max-h-1/2 flex flex-col bg-primary-color p-4 rounded-[15px] border-2 border-white justify-center items-center">
				{currentState == ModalState.Loading && <LoadingSpinner />}
				{currentState == ModalState.Form && <ModalForm />}
				{currentState == ModalState.Response && (
					<div>{'Not yet implemented'}</div>
				)}
			</div>

			{/* {currentState == ModalState.Response && (
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
	const [yamlStr, setYamlStr] = useState<string | undefined>();
	const [startNumber, setStartNumber] = useState<number | undefined>();
	const [endNumber, setEndNumber] = useState<number | undefined>();

	const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!yamlStr) return;

		try {
			const json = convertYamlToJson(yamlStr);
			if (!isGameDefinition(json))
				return console.error('Invalid game definition.');
			if (!json.startAt && !json.startFrom) json.startAt = json.startFrom;

			json.startAt = startNumber ? startNumber : json.startAt ?? 0;
			json.endAt = endNumber ? endNumber : json.endAt ?? undefined;

			// Change modal state to loading

			const vc = await startVoteCount(json);
			console.log('Calculated Votes', vc);
			if (!vc) return console.error('Failed to calculate votes');
			const format = formatVoteCountData(vc);

			// Change modal state to response

			if (format) console.log('Set response', format);
			else console.error('Set response to show it failed');
		} catch (err) {
			if (err instanceof z.ZodError)
				console.error('Validation errors: ', err);
			else console.error('An unexpected error occurred: ', err);
		}
	};
	return (
		<form
			className="border-2 border-white grow w-full flex flex-row"
			onSubmit={onSubmit}
		>
			<nav>
				<ul className="list-none">
					<li className="focused" data-section="general">
						General
					</li>
				</ul>
			</nav>

			<div className="flex flex-col gap-0">
				<section data-section="general" className="focused grow">
					<FileInput
						name="me_game_def"
						label="Import Definition File:"
						accept=".yaml,.yml"
						onChange={setYamlStr}
					/>

					<NumberInput
						name="me_start"
						label="Start from Post #"
						placeholder="Default = 0"
						onChange={setStartNumber}
					/>

					<NumberInput
						name="me_end"
						label="End at Post #"
						placeholder="Default = none"
						onChange={setEndNumber}
					/>
				</section>

				<div className="shrink">
					<button>Generate Votecount</button>
				</div>
			</div>
		</form>
	);
};
