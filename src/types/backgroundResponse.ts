import { z } from 'zod';
import { GameDefinitionSchema } from './gameDefinition';

export const ErrorResponse = z.object({
	status: z.union([z.literal(400), z.literal(500)]),
	message: z.string(),
});

//#region PAGE DATA
export const VoteSchema = z.object({
	author: z.string(),
	post: z.number(),
	index: z.number(), // For when there is multiple votes per post
	vote: z.string(),
});
export type Vote = z.infer<typeof VoteSchema>;

export const PageDataSchema = z.object({
	action: z.literal('pageData'),
	status: z.literal(200),
	pageTitle: z.string(),
	lastPage: z.number(),
	currentPage: z.number(),
	votes: z.array(VoteSchema),
});

export function isPageDataResponse(
	obj: unknown,
): obj is z.infer<typeof PageDataSchema> {
	try {
		const parse = PageDataSchema.parse(obj);
		if (parse) return true;
		return false;
	} catch (err) {
		console.log(err);
		return false;
	}
}

//#endregion

//#region MEMBER VERIFICATION
export const MemberVerification = z.object({
	action: z.literal('verifyMember'),
	status: z.literal(200),
	username: z.string(),
	verified: z.boolean(),
});
export function isMemberVerificationResponse(
	obj: unknown,
): obj is z.infer<typeof MemberVerification> {
	try {
		const parse = MemberVerification.parse(obj);
		if (parse) return true;
		return false;
	} catch (err) {
		console.log(err);
		return false;
	}
}
//#endregion

//#region GET SAVED GAME DEF

export const GetSavedGameDef = z.object({
	action: z.literal('getSavedGameDef'),
	status: z.literal(200),
	savedGameDef: GameDefinitionSchema,
});

export function isGetSavedGameDefResponse(
	obj: unknown,
): obj is z.infer<typeof GetSavedGameDef> {
	try {
		const parse = GetSavedGameDef.parse(obj);
		if (parse) return true;
		return false;
	} catch (err) {
		console.log(err);
		return false;
	}
}

//#endregion

//#region SAVE GAME DEF

export const SaveGameDef = z.object({
	action: z.literal('saveGameDef'),
	status: z.literal(200),
	savedGameDef: GameDefinitionSchema,
});

export function isSaveGameDefResponse(
	obj: unknown,
): obj is z.infer<typeof SaveGameDef> {
	try {
		const parse = SaveGameDef.parse(obj);
		if (parse) return true;
		return false;
	} catch (err) {
		console.log(err);
		return false;
	}
}

//#endregion

export const AnyResponseSchema = z.union([
	ErrorResponse,
	PageDataSchema,
	MemberVerification,
	GetSavedGameDef,
	SaveGameDef,
]);
export type AnyResponse = z.infer<typeof AnyResponseSchema>;
