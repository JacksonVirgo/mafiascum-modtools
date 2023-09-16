import { z } from 'zod';

export const PageDataRequestSchema = z.object({
	action: z.literal('getPageData'),
	url: z.string(),
});

export function isPageDataRequest(obj: unknown): obj is z.infer<typeof PageDataRequestSchema> {
	try {
		const parse = PageDataRequestSchema.parse(obj);
		if (parse) return true;
		return false;
	} catch (err) {
		console.log(err);
		return false;
	}
}

export const MemberVerificationRequestSchema = z.object({
	action: z.literal('verifyMember'),
	username: z.string(),
});

export function isMemberVerificationRequest(obj: unknown): obj is z.infer<typeof MemberVerificationRequestSchema> {
	try {
		const parse = MemberVerificationRequestSchema.parse(obj);
		if (parse) return true;
		return false;
	} catch (err) {
		console.log(err);
		return false;
	}
}
