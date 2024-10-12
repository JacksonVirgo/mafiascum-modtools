import { z } from 'zod';
import { GameDefinitionSchema } from './gameDefinition';

export const PageRequestValidator = z.object({
	action: z.literal('getPageData'),
	url: z.string(),
});

export const MemberVerificationRequestValidator = z.object({
	action: z.literal('verifyMember'),
	username: z.string(),
});

export const GetHighlightQuotes = z.object({
	action: z.literal('getHighlightQuotes'),
});

export const GetSavedGameDef = z.object({
	action: z.literal('getSavedGameDef'),
	gameId: z.string(),
});

export const SaveGameDef = z.object({
	action: z.literal('saveGameDef'),
	gameId: z.string(),
	gameDef: GameDefinitionSchema,
});

export const AnyRequestSchema = z.union([
	PageRequestValidator,
	MemberVerificationRequestValidator,
	GetHighlightQuotes,
	GetSavedGameDef,
	SaveGameDef,
]);
export type AnyRequest = z.infer<typeof AnyRequestSchema>;
