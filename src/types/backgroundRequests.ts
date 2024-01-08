import { z } from 'zod';

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

export const AnyRequestSchema = z.union([PageRequestValidator, MemberVerificationRequestValidator, GetHighlightQuotes]);
export type AnyRequest = z.infer<typeof AnyRequestSchema>;
