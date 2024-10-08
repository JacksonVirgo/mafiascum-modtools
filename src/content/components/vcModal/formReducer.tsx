import { GameDefinition } from '../../../types/newGameDefinition';

export const initialFormState: GameDefinition = {
	days: [],
	players: [],
	votes: [],
};

type AddDay = {
	type: 'ADD_DAY';
	day: { dayNumber: number; startPost: number; endPost?: number };
};

type UpdateDay = {
	type: 'UPDATE_DAY';
	dayNumber: number;
	day: Partial<{
		dayNumber: number;
		startPost: number;
		endPost?: number;
	}>;
};

type RemoveDay = {
	type: 'REMOVE_DAY';
	dayNumber: number;
};

type GameAction = AddDay | UpdateDay | RemoveDay;

export function vcFormReducer(state: GameDefinition, action: GameAction) {
	switch (action.type) {
		case 'ADD_DAY':
			return { ...state, days: [...state.days, action.day] };
		case 'UPDATE_DAY': {
			const newDays = state.days.map((day) => {
				if (day.dayNumber !== action.dayNumber) return day;
				return {
					...day,
					...action.day,
				};
			});

			return {
				...state,
				days: newDays,
			};
		}
		case 'REMOVE_DAY':
			return {
				...state,
				days: state.days.filter(
					(day) => day.dayNumber !== action.dayNumber,
				),
			};
	}
}
