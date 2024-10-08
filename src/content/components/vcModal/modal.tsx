import React, {
	createRef,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useState,
} from 'react';

import $ from 'jquery';
import { convertYamlToJson } from '../../../utils/file';
import { isGameDefinition } from '../../../types/gameDefinition';
import { formatVoteCountData, startVoteCount } from '../../votecount';
import { z } from 'zod';
import { FileInput } from '../form/FileInput';
import NumberInput from '../form/NumberInput';
import LoadingSpinner from '../indicators/LoadingSpinner';
import { renderReact } from '../../../utils/react';
import Button from '../buttons/button';

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
	setForm: () => void;
	setLoading: () => void;
	setResponse: (res: string) => void;
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
	setForm: () => {
		if (modalRef.current) {
			modalRef.current.setForm();
		}
	},
	setLoading: () => {
		if (modalRef.current) {
			modalRef.current.setLoading();
		}
	},
	setResponse: (res: string) => {
		if (modalRef.current) {
			modalRef.current.setResponse(res);
		}
	},
};

export const Modal = forwardRef((_props, ref) => {
	const [isVisible, setIsVisible] = useState(false);
	const [currentState, setCurrentState] = useState(ModalState.Form);
	const [response, setResponse] = useState<string | undefined>();

	useImperativeHandle(ref, () => ({
		show: () => setIsVisible(true),
		hide: () => setIsVisible(false),
		setForm: () => setCurrentState(ModalState.Form),
		setLoading: () => setCurrentState(ModalState.Loading),
		setResponse: (_: string) => setCurrentState(ModalState.Response),
	}));

	const onResponse = (res: string) => {
		setResponse(res);
	};

	return (
		<div
			id="me_votecount"
			className={`fixed top-0 left-0 w-screen h-screen bg-[rgba(0, 0, 0, 0.3)] backdrop-blur-sm z-[50] flex flex-col justify-center items-center ${
				isVisible ? '' : '!hidden'
			}`}
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					setIsVisible(false);
				}
			}}
		>
			<div className="aspect-[3/2] h-1/2 max-h-1/2 flex flex-col bg-primary-color rounded-[15px] border-2 border-white justify-center items-center p-4">
				<div className="w-full shrink flex flex-row items-center align-middle justify-center border-b-2 border-white">
					<span className="grow text-white text-lg font-bold">
						Votecounter
					</span>
					<div className="text-right">
						<span
							className="hover:cursor-pointer"
							onClick={() => setIsVisible(false)}
						>
							❌
						</span>
					</div>
				</div>

				<hr className="w-full" />

				{currentState == ModalState.Loading && (
					<div className="grow flex flex-col justify-center items-center">
						<LoadingSpinner />
					</div>
				)}
				{currentState == ModalState.Form && (
					<ModalForm onResponse={onResponse} />
				)}
				{currentState == ModalState.Response && (
					<ModalResponse format={response} />
				)}
			</div>
		</div>
	);
});

interface ModalFormProps {
	onResponse: (res: string) => void;
}

export const ModalForm = ({ onResponse }: ModalFormProps) => {
	const [yamlStr, setYamlStr] = useState<string | undefined>();
	const [startNumber, setStartNumber] = useState<number | undefined>();
	const [endNumber, setEndNumber] = useState<number | undefined>();

	const onSubmit = async () => {
		if (!yamlStr) return;

		try {
			const json = convertYamlToJson(yamlStr);
			if (!isGameDefinition(json))
				return console.error('Invalid game definition.');

			json.startAt = startNumber
				? startNumber
				: json.startAt ?? json.startFrom ?? 0;
			json.endAt = endNumber ? endNumber : json.endAt ?? undefined;

			modalManager.setLoading();

			const vc = await startVoteCount(json);
			console.log('Calculated Votes', vc);
			if (!vc) return console.error('Failed to calculate votes');
			const format = formatVoteCountData(vc);

			modalManager.setResponse(format);

			if (format) onResponse(format);
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
			onSubmit={(e) => e.preventDefault()}
		>
			<nav className="bg-primary-lighter p-4 rounded-sm">
				<ul className="list-none">
					<li className="focused" data-section="general">
						General
					</li>
				</ul>
			</nav>

			<div className="flex flex-col gap-0 grow justify-center p-4">
				<section
					data-section="general"
					className="focused grow w-full gap-2 flex flex-col"
				>
					<FileInput
						name="me_game_def"
						label="Import Definition File:"
						accept=".yaml,.yml"
						onChange={(val) => {
							console.log('Changed', val);
							setYamlStr(val);
						}}
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

				<div className="shrink flex flex-row items-center justify-center">
					<Button label="Generate Votecount" onClick={onSubmit} />
				</div>
			</div>
		</form>
	);
};

interface ModalResponseProps {
	format?: string;
}
export const ModalResponse = ({ format }: ModalResponseProps) => {
	const copyToClipboard = () => {
		if (!format) return;
		navigator.clipboard.writeText(format);
	};

	const goBack = () => {
		modalManager.setForm();
	};

	return (
		<div className="border-2 border-white grow w-full flex flex-col gap-2">
			<textarea
				className="grow h-full w-full resize-none"
				readOnly
				value={format}
			></textarea>

			<div className="shrink flex flex-row items-center justify-center gap-2">
				<Button label="Go back" onClick={goBack} />
				<Button label="Copy to clipboard" onClick={copyToClipboard} />
			</div>
		</div>
	);
};
