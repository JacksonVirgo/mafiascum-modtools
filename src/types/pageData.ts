import { z } from 'zod';

export const PageDataRequestSchema = z.object({
	action: z.literal('getPageData'),
	url: z.string(),
});

export type PageDataRequest = z.infer<typeof PageDataRequestSchema>;
export function isPageDataRequest(data: unknown): data is PageDataRequest {
	try {
		const parse = PageDataRequestSchema.parse(data);
		if (parse) return true;
		return false;
	} catch (err) {
		return false;
	}
}

export const VoteSchema = z.object({
	author: z.string(),
	post: z.number(),
	index: z.number(), // For when there is multiple votes per post
	vote: z.string(),
});

export type Vote = z.infer<typeof VoteSchema>;

export const PageDataSchema = z.object({
	status: z.literal(200),
	pageTitle: z.string(),
	lastPage: z.number(),
	currentPage: z.number(),
	votes: z.array(VoteSchema),
});

export type PageData = z.infer<typeof PageDataSchema>;

export const ErrorResponseSchema = z.object({
	status: z.union([z.literal(400), z.literal(500)]),
	message: z.string(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const PageDataResponseSchema = z.union([PageDataSchema, ErrorResponseSchema]);
export type PageDataResponse = z.infer<typeof PageDataResponseSchema>;

export function isPageDataResponse(data: unknown): data is PageDataResponse {
	try {
		const parse = PageDataResponseSchema.parse(data);
		if (parse) return true;
		return false;
	} catch (err) {
		return false;
	}
}
