import { z } from 'zod';

export const GameDefinitionSchema = z.object({
	players: z.array(z.string()),
	aliases: z.record(z.array(z.string())).optional(),
	replacements: z.record(z.array(z.string())).optional(),
	ignore: z.array(z.string()).optional(),
	dead: z.record(z.number()).optional(),
	startAt: z.number().optional(),
	endAt: z.number().optional(),
	disable: z.array(z.string()).optional(),

	// ALIASES
	startFrom: z.number().optional(), // alias for startAt
});

export type GameDefinition = z.infer<typeof GameDefinitionSchema>;

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
	validity: VoteCorrection;
};
