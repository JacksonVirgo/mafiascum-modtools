import browser from 'webextension-polyfill';
import { verifyMember } from './requests/verifyMember';
import { getPageData } from './requests/getPageData';
import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import { createChromeHandler } from '../utils/trpc/adapter';

const t = initTRPC.create({
	isServer: false,
	allowOutsideOfServer: true,
});

const appRouter = t.router({
	verifyMember: t.procedure
		.input(
			z.object({
				username: z.string(),
			})
		)
		.query(async ({ input: { username } }) => {
			const isVerified = await verifyMember(username);
			return isVerified;
		}),

	getPageData: t.procedure
		.input(
			z.object({
				url: z.string().url(),
			})
		)
		.query(async ({ input: { url } }) => {
			const pageData = await getPageData(url);
			if (!pageData) return null;

			const { title, lastPage, currentPage, votes } = pageData;
			if (!(pageData.title && lastPage && currentPage)) return null;

			return {
				pageTitle: title,
				lastPage,
				currentPage,
				votes,
			};
		}),

	getHighlightQuotes: t.procedure.query(async () => {
		let highlight: string | null = null;
		const storage = browser.storage.sync || browser.storage.local;
		const fetchedData = await storage.get(['highlightedQuotes']);
		highlight = fetchedData['highlightQuotes'] ?? 'off';
		return highlight === 'on';
	}),
});

export type AppRouter = typeof appRouter;

createChromeHandler({ router: appRouter });
