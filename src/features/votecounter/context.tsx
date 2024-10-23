import React, { createContext, Dispatch, useReducer } from 'react';
import { GameDefinition } from './types/gameDefinition';
import { GameAction, initialFormState, vcFormReducer } from './reducer';

const VoteCountContext = createContext<GameDefinition>(initialFormState);
const VoteCountDispatch = createContext<Dispatch<GameAction>>(() => {});


export function useGameDefinition(): [GameDefinition, Dispatch<GameAction>] {
	return [React.useContext(VoteCountContext), React.useContext(VoteCountDispatch)];
}

interface ContextProps {
    children: React.ReactNode;
}

export default function GameDefinitionContext({ children }: ContextProps) {
	const [state, dispatch] = useReducer(vcFormReducer, initialFormState);
	return (
		<VoteCountContext.Provider value={state}>
			<VoteCountDispatch.Provider value={dispatch}>
				{children}
			</VoteCountDispatch.Provider>
		</VoteCountContext.Provider>
	);
}