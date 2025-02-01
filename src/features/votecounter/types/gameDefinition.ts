import { z } from 'zod';
import { wrapZod } from '../utils/zodWrapper';

export const { schema: DaySchema, validate: isDay } = wrapZod(
	z.object({
		dayNumber: z.number(),
		startPost: z.number().optional(),
		endPost: z.number().optional(),
	}),
);

export type Day = z.infer<typeof DaySchema>;

export const { schema: PlayerSchema, validate: isPlayer } = wrapZod(
	z.object({
		current: z.string(),
		previous: z.string().array(),
		aliases: z.string().array(),
		diedAt: z.number().optional(),
	}),
);

export type Player = z.infer<typeof PlayerSchema>;

export const { schema: VoteSchema, validate: isVote } = wrapZod(
	z.object({
		postNumber: z.number(),
		ignore: z.boolean().optional(), // Should tool ignore this vote
		target: z.string().nullish(), // The corrected target, if applicable
	}),
);

export type Vote = z.infer<typeof VoteSchema>;

export const { schema: GameDefinitionSchema, validate: isGameDefinition } =
	wrapZod(
		z.object({
			days: DaySchema.array(),
			players: PlayerSchema.array(),
			votes: VoteSchema.array(),
		}),
	);

export type GameDefinition = z.infer<typeof GameDefinitionSchema>;

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
