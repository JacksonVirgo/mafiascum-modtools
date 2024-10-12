import React, {
	createRef,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useReducer,
	useState,
} from 'react';

import $ from 'jquery';
import LoadingSpinner from '../indicators/LoadingSpinner';
import { renderReact } from '../../../utils/react';
import Button from '../buttons/button';
import { ModalForm } from './form';
import { ValidatedVote } from '../../../types/gameDefinition';
import TextArea from '../form/TextArea';
import { vcFormReducer, initialFormState, GameAction } from './formReducer';
import ResolveVotes from './resolveVotes';
import {
	isGetSavedGameDefResponse,
	isSaveGameDefResponse,
} from '../../../types/backgroundResponse';
import { sendBackgroundRequest } from '../../request';

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
	ResolvingVotes,
	Error,
}

export type FlaggedVotes = {
	warnings: ValidatedVote[];
	errors: ValidatedVote[];
};

interface ModalHandle {
	show: () => void;
	hide: () => void;
	setForm: () => void;
	setLoading: () => void;
	setResponse: (res: string, logs: FlaggedVotes) => void;
	setResolvingVotes: (logs: FlaggedVotes) => void;
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
	setResponse: (res: string, logs: FlaggedVotes) => {
		if (modalRef.current) {
			modalRef.current.setResponse(res, logs);
		}
	},
	setResolvingVotes: (logs: FlaggedVotes) => {
		if (modalRef.current) {
			modalRef.current.setResolvingVotes(logs);
		}
	},
};

export interface ReducerProps {
	state: typeof initialFormState;
	dispatch: React.Dispatch<GameAction>;
}

export const Modal = forwardRef((_props, ref) => {
	const [isVisible, setIsVisible] = useState(false);
	const [currentState, setCurrentState] = useState(ModalState.Form);
	const [response, setResponse] = useState<string | undefined>();
	const [flaggedVotes, setFlaggedVotes] = useState<FlaggedVotes>({
		warnings: [],
		errors: [],
	});

	const [state, dispatch] = useReducer(vcFormReducer, initialFormState);

	useImperativeHandle(ref, () => ({
		show: () => setIsVisible(true),
		hide: () => setIsVisible(false),
		setForm: () => setCurrentState(ModalState.Form),
		setLoading: () => setCurrentState(ModalState.Loading),
		setResponse: (str: string, logs: FlaggedVotes) => {
			setResponse(str);
			setFlaggedVotes(logs);
			setCurrentState(ModalState.Response);
		},
		setResolvingVotes: (logs: FlaggedVotes) => {
			setFlaggedVotes(logs);
			setCurrentState(ModalState.ResolvingVotes);
		},
	}));

	useEffect(() => {
		document.body.style.overflow = isVisible ? 'hidden' : 'auto';
	}, [isVisible]);

	const loadGameDef = async () => {
		const threadRelativeUrl = $('h2')
			.first()
			.find('a')
			.first()
			.attr('href');
		if (!threadRelativeUrl) return setCurrentState(ModalState.Error);

		const regex = /t=([0-9]+)/;

		const tVal = threadRelativeUrl.match(regex);
		if (!tVal) return setCurrentState(ModalState.Error);

		const threadId = tVal[1];
		if (!threadId) return setCurrentState(ModalState.Error);

		const res = await sendBackgroundRequest({
			action: 'getSavedGameDef',
			gameId: threadId,
		});

		console.log('Loaded Game Def', threadId, res);
		if (!isGetSavedGameDefResponse(res))
			return setCurrentState(ModalState.Error);

		dispatch({ type: 'SET_FULL_GAME_DEF', gameDef: res.savedGameDef });
		setCurrentState(ModalState.Form);
	};

	const saveGameDef = async () => {
		const threadRelativeUrl = $('h2')
			.first()
			.find('a')
			.first()
			.attr('href');
		if (!threadRelativeUrl) return setCurrentState(ModalState.Error);

		const regex = /t=([0-9]+)/;

		const tVal = threadRelativeUrl.match(regex);
		if (!tVal) return setCurrentState(ModalState.Error);

		const threadId = tVal[1];
		if (!threadId) return setCurrentState(ModalState.Error);

		const res = await sendBackgroundRequest({
			action: 'saveGameDef',
			gameId: threadId,
			gameDef: state,
		});

		console.log('Saved Game Def', threadId, res);
		if (!isSaveGameDefResponse(res))
			return setCurrentState(ModalState.Error);

		setCurrentState(ModalState.Form);
	};

	useEffect(() => {
		// This currently saves a game def even on an initial load.
		// Later make sure it only saves if an actual change has been made
		// And not just an initial load
		saveGameDef();
	}, [state]);

	useEffect(() => {
		loadGameDef();
	}, []);

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
					<ModalForm
						onResponse={onResponse}
						state={state}
						dispatch={dispatch}
					/>
				)}
				{currentState == ModalState.Response && (
					<ModalResponse
						format={response}
						flaggedVotes={flaggedVotes}
						state={state}
						dispatch={dispatch}
					/>
				)}
				{currentState == ModalState.ResolvingVotes && (
					<ResolveVotes
						flaggedVotes={flaggedVotes}
						state={state}
						dispatch={dispatch}
					/>
				)}
			</div>
		</div>
	);
});

interface ModalResponseProps extends ReducerProps {
	format?: string;
	flaggedVotes?: FlaggedVotes;
}
export const ModalResponse = ({
	format,
	flaggedVotes: flagged,
	state,
	dispatch,
}: ModalResponseProps) => {
	const [flaggedVotes, setFlaggedVotes] = useState<ValidatedVote[]>([]);

	const copyToClipboard = () => {
		if (!format) return;
		navigator.clipboard.writeText(format);
	};

	const goBack = () => {
		modalManager.setForm();
	};

	useEffect(() => {
		if (!flagged) return;
		setFlaggedVotes([...flagged.warnings, ...flagged.errors]);
	}, [flagged]);

	return (
		<div className="border-2 border-white grow w-full flex flex-col gap-2">
			{flaggedVotes.length > 0 && (
				<div>
					<div className="text-base text-red-400 font-bold">
						{flaggedVotes.length > 1 &&
							`There are ${flaggedVotes.length} flagged votes:`}
						{flaggedVotes.length == 1 &&
							`There is ${flaggedVotes.length} flagged vote:`}
					</div>
					<div className="flex flex-row">
						<Button
							label="Resolve Issues"
							onClick={() => {
								if (!flagged) return;
								modalManager.setResolvingVotes(flagged);
							}}
						/>
					</div>
				</div>
			)}

			<TextArea
				label="Formatted Output"
				defaultValue={format}
				name="format"
				className="grow h-full w-full resize-none"
				readOnly={true}
			/>

			<div className="shrink flex flex-row items-center justify-center gap-2">
				<Button label="Go back" onClick={goBack} />
				<Button label="Copy to clipboard" onClick={copyToClipboard} />
			</div>
		</div>
	);
};
