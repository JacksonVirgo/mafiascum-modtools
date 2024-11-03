import React, {
	forwardRef,
	useEffect,
	useImperativeHandle,
	useState,
} from 'react';

import $ from 'jquery';
import LoadingSpinner from '../../../components/indicators/LoadingSpinner';
import { renderReact } from '../../../lib/react';
import Button from '../../../components/buttons/button';
import { ModalForm } from './form';
import { ValidatedVote } from '../types/gameDefinition';
import TextArea from '../../../components/form/TextArea';
import ResolveVotes from './resolveVotes';
import GameDefinitionContext, {
	modalRef,
	stateManager,
	useVoteCountStateManager,
} from '../context';

export const CSS_HIDDEN = 'me_hidden';

export function createModal() {
	const modal = renderReact(<Modal />);
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

export const Modal = () => {
	return (
		<GameDefinitionContext>
			<ModalInner ref={modalRef} />
		</GameDefinitionContext>
	);
};

export const ModalInner = forwardRef((_props, ref) => {
	const [isVisible, setIsVisible] = useState(false);
	const [currentState, setCurrentState] = useState(ModalState.Form);
	const [response, setResponse] = useState<string | undefined>();
	const [flaggedVotes, setFlaggedVotes] = useState<FlaggedVotes>({
		warnings: [],
		errors: [],
	});

	const [postNumber, setPostNumber] = useState<number | undefined>();

	const [error, setError] = useState<string | undefined>();
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
		setError: (str: string) => {
			setError(str);
			setCurrentState(ModalState.Error);
		},
		setPostNum: (postNum: number) => {
			setPostNumber(postNum);
		},
	}));

	useEffect(() => {
		document.body.style.overflow = isVisible ? 'hidden' : 'auto';
	}, [isVisible]);

	const onResponse = (res: string) => {
		setResponse(res);
	};

	return (
		<GameDefinitionContext>
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
						<ModalForm postNumber={postNumber} />
					)}
					{currentState == ModalState.Response && (
						<ModalResponse
							format={response}
							flaggedVotes={flaggedVotes}
						/>
					)}
					{currentState == ModalState.ResolvingVotes && (
						<ResolveVotes flaggedVotes={flaggedVotes} />
					)}
					{currentState == ModalState.Error && (
						<div className="grow flex flex-col justify-center items-center">
							<span className="text-red-500">Error: {error}</span>

							<Button
								label="Go Home"
								onClick={() => stateManager.setForm()}
							/>
						</div>
					)}
				</div>
			</div>
		</GameDefinitionContext>
	);
});

interface ModalResponseProps {
	format?: string;
	flaggedVotes?: FlaggedVotes;
}
export const ModalResponse = ({
	format,
	flaggedVotes: flagged,
}: ModalResponseProps) => {
	const [flaggedVotes, setFlaggedVotes] = useState<ValidatedVote[]>([]);
	const stateManager = useVoteCountStateManager();
	const copyToClipboard = () => {
		if (!format) return;
		navigator.clipboard.writeText(format);
	};

	const goBack = () => {
		stateManager.setForm();
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
								stateManager.setResolvingVotes(flagged);
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
