import React, { useState } from 'react';
import Button from '../../../components/buttons/button';
import { isSaveGameDefResponse } from '../../../types/backgroundResponse';
import $ from 'jquery';
import LoadingSpinner from '../../../components/indicators/LoadingSpinner';
import { DaysTab } from './form/days';
import { PlayersTab } from './form/players';
import { VotesTab } from './form/votes';
import { ExportTab } from './form/export';
import { ImportTab } from './form/import';
import { startVoteCount } from '../../../features/votecounter/votecounter';
import { ReducerProps, modalManager } from './modal';
import { saveGameDefinition } from '../background/storage';

interface ModalFormProps extends ReducerProps {
	onResponse: (res: string) => void;
}

enum ModalLoadingState {
	LOADING,
	LOADED,
	NO_GAME_DEF, // for when there is no game definition
	ERROR,
}

export const ModalForm = ({
	onResponse: _onResponse,
	state,
	dispatch,
}: ModalFormProps) => {
	const [loadState, setLoadState] = useState(ModalLoadingState.LOADED);

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
			{loadState == ModalLoadingState.NO_GAME_DEF && (
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
	state: _state,
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

		const res = saveGameDefinition.query({
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
	IMPORT = 'Import',
	EXPORT = 'Export',
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

	const onSubmit = async () => {
		modalManager.setLoading();
		const vcData = await startVoteCount(state);
		if (!vcData) {
			modalManager.setForm(); // TODO: Add an error page to redirect to
			return;
		}
		modalManager.setResponse(vcData.formatted, vcData.votecount.logs);
	};

	return (
		<>
			<nav className="bg-primary-lighter p-4 rounded-md">
				<ul className="list-none flex flex-col justify-center items-center gap-2 h-full">
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
					<div className="grow"></div>
					<Section
						section={FormSection.IMPORT}
						focused={activeSection == FormSection.IMPORT}
						onClick={sectionChange}
					/>
					<Section
						section={FormSection.EXPORT}
						focused={activeSection == FormSection.EXPORT}
						onClick={sectionChange}
					/>
				</ul>
			</nav>

			<div className="flex flex-col gap-0 grow justify-center p-4">
				{activeSection == FormSection.DAYS && (
					<DaysTab state={state} dispatch={dispatch} />
				)}

				{activeSection == FormSection.PLAYERS && (
					<PlayersTab state={state} dispatch={dispatch} />
				)}

				{activeSection == FormSection.VOTES && (
					<VotesTab state={state} dispatch={dispatch} />
				)}

				{activeSection == FormSection.IMPORT && (
					<ImportTab state={state} dispatch={dispatch} />
				)}

				{activeSection == FormSection.EXPORT && (
					<ExportTab state={state} dispatch={dispatch} />
				)}

				<div className="shrink flex flex-row items-center justify-center">
					<Button label="Generate Votecount" onClick={onSubmit} />
				</div>
			</div>
		</>
	);
};
