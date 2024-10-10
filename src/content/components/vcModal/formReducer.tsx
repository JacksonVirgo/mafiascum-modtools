import { GameDefinition } from '../../../types/newGameDefinition';

export const initialFormState: GameDefinition = {
	days: [],
	players: [],
	votes: [],
};

type SetFullGameDef = {
	type: 'SET_FULL_GAME_DEF';
	gameDef: GameDefinition;
};

type AddDay = {
	type: 'ADD_DAY';
	day: { dayNumber: number; startPost?: number; endPost?: number };
};

type UpdateDay = {
	type: 'UPDATE_DAY';
	dayNumber: number;
	day: Partial<{
		dayNumber: number;
		startPost?: number;
		endPost?: number;
	}>;
};

type RemoveDay = {
	type: 'REMOVE_DAY';
	dayNumber: number;
};

export type GameAction = SetFullGameDef | AddDay | UpdateDay | RemoveDay;

export function vcFormReducer(state: GameDefinition, action: GameAction) {
	switch (action.type) {
		case 'SET_FULL_GAME_DEF':
			return action.gameDef;
		case 'ADD_DAY':
			return { ...state, days: [...state.days, action.day] };
		case 'UPDATE_DAY':
			return {
				...state,
				days: state.days.map((day) => {
					if (day.dayNumber !== action.dayNumber) return day;
					return {
						...day,
						...action.day,
					};
				}),
			};
		case 'REMOVE_DAY':
			return {
				...state,
				days: state.days.filter(
					(day) => day.dayNumber !== action.dayNumber,
				),
			};
	}
}
