// This file will be renamed to gameDefinition.ts in the future

import { z } from 'zod';

export const GameDefinitionSchema = z.object({
	days: z
		.object({
			dayNumber: z.number(),
			startPost: z.number(),
			endPost: z.number().optional(),
		})
		.array(),
	players: z
		.object({
			current: z.string(),
			previous: z.string().array(),
			aliases: z.string().array(),
			diedAt: z.number().optional(),
		})
		.array(),
	votes: z
		.object({
			postNumber: z.number(),
			ignore: z.boolean().optional(), // Used to have the tool ignore this vote
			target: z.string().nullish(), // Used to fix who the target is if an issue arises
		})
		.array(),
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
