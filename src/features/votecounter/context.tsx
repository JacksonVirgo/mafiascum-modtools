import $ from 'jquery';
import React, {
	createContext,
	createRef,
	Dispatch,
	useEffect,
	useReducer,
} from 'react';
import { GameDefinition } from './types/gameDefinition';
import { GameAction, initialFormState, vcFormReducer } from './reducer';
import { FlaggedVotes } from './components/modal';
import { getGameDefinition, saveGameDefinition } from './background/storage';

interface ModalHandle {
	show: () => void;
	hide: () => void;
	setForm: () => void;
	setLoading: () => void;
	setResponse: (res: string, logs: FlaggedVotes) => void;
	setResolvingVotes: (logs: FlaggedVotes) => void;
	setError(res: string): void;
	setPostNum(postNum: number): void;
}

export const modalRef = createRef<ModalHandle>();
export const stateManager = {
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
	setError(res: string) {
		if (modalRef.current) {
			modalRef.current.setError(res);
		}
	},
	setPostNum(postNum: number) {
		if (modalRef.current) {
			modalRef.current.setPostNum(postNum);
		}
	},
};

export interface ExtendedGameDefinition extends GameDefinition {
	isInitial?: boolean;
}

const VoteCountContext = createContext<ExtendedGameDefinition | GameDefinition>(
	initialFormState,
);
const VoteCountDispatch = createContext<Dispatch<GameAction>>(() => {});
const VoteCountStateManager = createContext<typeof stateManager>(stateManager);

export function useGameDefinition(): [GameDefinition, Dispatch<GameAction>] {
	return [
		React.useContext(VoteCountContext),
		React.useContext(VoteCountDispatch),
	];
}

export function useVoteCountStateManager() {
	return React.useContext(VoteCountStateManager);
}

interface ContextProps {
	children: React.ReactNode;
}

const getThreadId = () => {
	const threadRelativeUrl = $('h2').first().find('a').first().attr('href');
	if (!threadRelativeUrl) return null;
	const regex = /t=([0-9]+)/;
	const tVal = threadRelativeUrl.match(regex);
	if (!tVal) return null;
	const threadId = tVal[1];
	if (!threadId) return null;
	return threadId;
};

export default function GameDefinitionContext({ children }: ContextProps) {
	const [state, dispatch] = useReducer(vcFormReducer, initialFormState);

	const loadGameDef = async () => {
		const threadId = getThreadId();
		if (!threadId) return stateManager.setError('Could not find thread');
		const res = await getGameDefinition.query({ gameId: threadId });
		if (!res) return await saveGameDef();

		dispatch({ type: 'SET_FULL_GAME_DEF', gameDef: res });
		stateManager.setForm();
	};

	const saveGameDef = async () => {
		const threadId = getThreadId();
		if (!threadId) return stateManager.setError('Could not find thread');
		const res = await saveGameDefinition.query({
			gameId: threadId,
			gameDef: state,
		});
		if (!res)
			return stateManager.setError('Could not save game definition');
	};

	useEffect(() => {
		loadGameDef();
	}, []);

	useEffect(() => {
		// This currently saves a game def even on an initial load.
		// Later make sure it only saves if an actual change has been made
		// And not just an initial load

		console.log(state);

		if (
			state.days.length == 0 &&
			state.players.length == 0 &&
			state.votes.length == 0
		)
			return;
		console.log('SAVING GAME DEF');
		saveGameDef();
	}, [state]);

	return (
		<VoteCountContext.Provider value={state}>
			<VoteCountDispatch.Provider value={dispatch}>
				<VoteCountStateManager.Provider value={stateManager}>
					{children}
				</VoteCountStateManager.Provider>
			</VoteCountDispatch.Provider>
		</VoteCountContext.Provider>
	);
}
