import { z } from 'zod';

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

export const AnyResponseSchema = z.union([
	ErrorResponse,
	PageDataSchema,
	MemberVerification,
]);
export type AnyResponse = z.infer<typeof AnyResponseSchema>;
