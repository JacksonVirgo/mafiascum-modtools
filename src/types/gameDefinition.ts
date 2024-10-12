// This file will be renamed to gameDefinition.ts in the future

import { z } from 'zod';

export const DaySchema = z.object({
	dayNumber: z.number(),
	startPost: z.number().optional(),
	endPost: z.number().optional(),
});

export function isDay(obj: unknown): obj is z.infer<typeof DaySchema> {
	try {
		const parse = DaySchema.parse(obj);
		if (parse) return true;
		return false;
	} catch (err) {
		console.log(err);
		return false;
	}
}

export function isDayArray(obj: unknown): obj is z.infer<typeof DaySchema>[] {
	try {
		const parse = DaySchema.array().parse(obj);
		if (parse) return true;
		return false;
	} catch (err) {
		console.log(err);
		return false;
	}
}

export const PlayerSchema = z.object({
	current: z.string(),
	previous: z.string().array(),
	aliases: z.string().array(),
	diedAt: z.number().optional(),
});

export function isPlayer(obj: unknown): obj is z.infer<typeof PlayerSchema> {
	try {
		const parse = PlayerSchema.parse(obj);
		if (parse) return true;
		return false;
	} catch (err) {
		console.log(err);
		return false;
	}
}

export function isPlayerArray(
	obj: unknown,
): obj is z.infer<typeof PlayerSchema>[] {
	try {
		const parse = PlayerSchema.array().parse(obj);
		if (parse) return true;
		return false;
	} catch (err) {
		console.log(err);
		return false;
	}
}

export const VoteSchema = z.object({
	postNumber: z.number(),
	ignore: z.boolean().optional(), // Used to have the tool ignore this vote
	target: z.string().nullish(), // Used to fix who the target is if an issue arises
});

export function isVote(obj: unknown): obj is z.infer<typeof VoteSchema> {
	try {
		const parse = VoteSchema.parse(obj);
		if (parse) return true;
		return false;
	} catch (err) {
		console.log(err);
		return false;
	}
}

export function isVoteArray(obj: unknown): obj is z.infer<typeof VoteSchema>[] {
	try {
		const parse = VoteSchema.array().parse(obj);
		if (parse) return true;
		return false;
	} catch (err) {
		console.log(err);
		return false;
	}
}

export const GameDefinitionSchema = z.object({
	days: DaySchema.array(),
	players: PlayerSchema.array(),
	votes: VoteSchema.array(),
});

export type GameDefinition = z.infer<typeof GameDefinitionSchema>;
export type Day = z.infer<typeof DaySchema>;
export type Player = z.infer<typeof PlayerSchema>;
export type Vote = z.infer<typeof VoteSchema>;

export function isGameDefinition(obj: unknown): obj is GameDefinition {
	try {
		const parse = GameDefinitionSchema.parse(obj);
		if (parse) return true;
		return false;
	} catch (err) {
		console.log(err);
		console.log('[ GAME DEF ]', obj);
		return false;
	}
}

// Semantic Types
type Username = string;
type PostNumber = number;

export enum VoteType {
	VOTE,
	UNVOTE,
}

export enum VoteCorrection {
	ACCEPT,
	WARN,
	REJECT,
}

export type ValidatedVote = {
	type: VoteType;
	author: Username;
	post: PostNumber;
	target?: Username;
	rawTarget?: string;
	ignore?: boolean;
	validity: VoteCorrection;
};
