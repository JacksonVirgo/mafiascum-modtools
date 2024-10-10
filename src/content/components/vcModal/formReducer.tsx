import { GameDefinition, Player } from '../../../types/newGameDefinition';

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

type AddPlayer = {
	type: 'ADD_PLAYER';
	username: string;
};

type UpdatePlayer = {
	type: 'UPDATE_PLAYER';
	username: string;
	player: Player;
};

type RemovePlayer = {
	type: 'REMOVE_PLAYER';
	username: string;
};

export type GameAction =
	| SetFullGameDef
	| AddDay
	| UpdateDay
	| RemoveDay
	| AddPlayer
	| UpdatePlayer
	| RemovePlayer;

export function vcFormReducer(
	state: GameDefinition,
	action: GameAction,
): GameDefinition {
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
		case 'ADD_PLAYER':
			return {
				...state,
				players: [
					...state.players,
					{ current: action.username, aliases: [], previous: [] },
				],
			};
		case 'UPDATE_PLAYER':
			return {
				...state,
				players: state.players.map((player) => {
					if (player.current !== action.username) return player;
					return action.player;
				}),
			};
		case 'REMOVE_PLAYER':
			return {
				...state,
				players: state.players.filter(
					(player) => player.current !== action.username,
				),
			};
		default:
			return state;
	}
}
