import React, { useEffect, useReducer, useState } from 'react';
import { z } from 'zod';
import { isGameDefinition } from '../../../types/gameDefinition';
import { convertYamlToJson } from '../../../utils/file';
import { startVoteCount, formatVoteCountData } from '../../votecount';
import Button from '../buttons/button';
import { FileInput } from '../form/FileInput';
import NumberInput from '../form/NumberInput';
import { modalManager } from './modal';
import { GameAction, initialFormState, vcFormReducer } from './formReducer';
import { sendBackgroundRequest } from '../../request';
import {
	isGetSavedGameDefResponse,
	isSaveGameDefResponse,
} from '../../../types/backgroundResponse';
import $ from 'jquery';
import LoadingSpinner from '../indicators/LoadingSpinner';

interface ReducerProps {
	state: typeof initialFormState;
	dispatch: React.Dispatch<GameAction>;
}

interface ModalFormProps {
	onResponse: (res: string) => void;
}

enum ModalLoadingState {
	LOADING,
	LOADED,
	EMPTY, // for when there is no game definition
	ERROR,
}

export const ModalForm = ({ onResponse }: ModalFormProps) => {
	const [yamlStr, setYamlStr] = useState<string | undefined>();
	const [startNumber, setStartNumber] = useState<number | undefined>();
	const [endNumber, setEndNumber] = useState<number | undefined>();

	const [loadState, setLoadState] = useState(ModalLoadingState.LOADING);
	const [state, dispatch] = useReducer(vcFormReducer, initialFormState);

	const saveGameDef = async () => {
		const threadRelativeUrl = $('h2')
			.first()
			.find('a')
			.first()
			.attr('href');
		if (!threadRelativeUrl) return;
		const regex = /t=([0-9]+)/;

		const tVal = threadRelativeUrl.match(regex);
		if (!tVal) return;

		const threadId = tVal[1];
		if (!threadId) return;

		const res = await sendBackgroundRequest({
			action: 'saveGameDef',
			gameId: threadId,
			gameDef: state,
		});

		if (!isSaveGameDefResponse(res)) return;
		if (!res.savedGameDef) return;
	};

	const loadGameDef = async () => {
		const threadRelativeUrl = $('h2')
			.first()
			.find('a')
			.first()
			.attr('href');
		if (!threadRelativeUrl) return setLoadState(ModalLoadingState.ERROR);

		const regex = /t=([0-9]+)/;

		const tVal = threadRelativeUrl.match(regex);
		if (!tVal) return setLoadState(ModalLoadingState.ERROR);

		const threadId = tVal[1];
		if (!threadId) return setLoadState(ModalLoadingState.ERROR);

		const res = await sendBackgroundRequest({
			action: 'getSavedGameDef',
			gameId: threadId,
		});

		console.log('Loaded Game Def', threadId, res);
		if (!isGetSavedGameDefResponse(res))
			return setLoadState(ModalLoadingState.EMPTY);

		dispatch({ type: 'SET_FULL_GAME_DEF', gameDef: res.savedGameDef });
		setLoadState(ModalLoadingState.LOADED);
	};

	useEffect(() => {
		console.log('State Changed', state);
	}, [state]);

	useEffect(() => {
		loadGameDef();
	}, []);

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
			{loadState == ModalLoadingState.LOADING && (
				<div className="grow flex flex-col justify-center items-center">
					<LoadingSpinner />
				</div>
			)}
			{loadState == ModalLoadingState.LOADED && (
				<FormInner state={state} dispatch={dispatch} />
			)}

			{loadState == ModalLoadingState.ERROR && (
				<div className="grow flex flex-col justify-center items-center">
					<span className="text-red-500">
						Error Loading Game Definition
					</span>
				</div>
			)}
			{loadState == ModalLoadingState.EMPTY && (
				<NewGameDef
					state={state}
					dispatch={dispatch}
					setLoadState={setLoadState}
				/>
			)}
		</form>
	);
};

interface NewGameDefProps extends ReducerProps {
	setLoadState: React.Dispatch<React.SetStateAction<ModalLoadingState>>;
}

export const NewGameDef = ({
	state,
	dispatch,
	setLoadState,
}: NewGameDefProps) => {
	const createNewGameDef = async () => {
		setLoadState(ModalLoadingState.LOADING);
		const threadRelativeUrl = $('h2')
			.first()
			.find('a')
			.first()
			.attr('href');
		if (!threadRelativeUrl) return setLoadState(ModalLoadingState.ERROR);

		const regex = /t=([0-9]+)/;

		const tVal = threadRelativeUrl.match(regex);
		if (!tVal) return setLoadState(ModalLoadingState.ERROR);

		const threadId = tVal[1];
		if (!threadId) return setLoadState(ModalLoadingState.ERROR);

		const res = await sendBackgroundRequest({
			action: 'saveGameDef',
			gameId: threadId,
			gameDef: {
				days: [],
				players: [],
				votes: [],
			},
		});

		if (!isSaveGameDefResponse(res) || !res.savedGameDef)
			return setLoadState(ModalLoadingState.ERROR);

		console.log('SAVED', res.savedGameDef);

		dispatch({ type: 'SET_FULL_GAME_DEF', gameDef: res.savedGameDef });
		setLoadState(ModalLoadingState.LOADED);
	};
	return (
		<div className="grow flex flex-col justify-center items-center gap-2">
			<div className="text-red-500">No Game Definition Found</div>
			<Button label="Create One" onClick={createNewGameDef} />
		</div>
	);
};

interface FormInnerProps extends ReducerProps {}

enum FormSection {
	DAYS = 'Days',
	PLAYERS = 'Players',
	VOTES = 'Votes',
}

interface SectionProps {
	focused?: boolean;
	onClick?: (section: FormSection) => void;
	section: FormSection;
}

export const FormInner = ({ state, dispatch }: FormInnerProps) => {
	const [activeSection, setActiveSection] = useState(FormSection.DAYS);

	const Section = ({ section, focused, onClick }: SectionProps) => {
		return (
			<li
				className={`${
					focused ? 'bg-secondary-color text-primary-color' : ''
				} w-full rounded-md p-2 hover:cursor-pointer`}
				onClick={() => {
					if (onClick) onClick(section);
				}}
			>
				{section}
			</li>
		);
	};

	const sectionChange = (section: FormSection) => {
		setActiveSection(section);
	};

	return (
		<>
			<nav className="bg-primary-lighter p-4 rounded-sm">
				<ul className="list-none flex flex-col justify-center items-center gap-2">
					<Section
						section={FormSection.DAYS}
						focused={activeSection == FormSection.DAYS}
						onClick={sectionChange}
					/>
					<Section
						section={FormSection.PLAYERS}
						focused={activeSection == FormSection.PLAYERS}
						onClick={sectionChange}
					/>
					<Section
						section={FormSection.VOTES}
						focused={activeSection == FormSection.VOTES}
						onClick={sectionChange}
					/>
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
						}}
					/>

					<NumberInput
						name="me_start"
						label="Start from Post #"
						placeholder="Default = 0"
						onChange={() => {}}
					/>

					<NumberInput
						name="me_end"
						label="End at Post #"
						placeholder="Default = none"
						onChange={() => {}}
					/>
				</section>

				<div className="shrink flex flex-row items-center justify-center">
					<Button label="Generate Votecount" onClick={() => {}} />
				</div>
			</div>
		</>
	);
};
