import React, {
	createRef,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useState,
} from 'react';

import $ from 'jquery';
import LoadingSpinner from '../indicators/LoadingSpinner';
import { renderReact } from '../../../utils/react';
import Button from '../buttons/button';
import { ModalForm } from './form';

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

	useEffect(() => {
		document.body.style.overflow = isVisible ? 'hidden' : 'auto';
	}, [isVisible]);

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
