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
	ping: t.procedure.query(() => {
		return 200;
	}),
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

			const { title, lastPage, currentPage, votes, threadId } = pageData;
			if (!(pageData.title && lastPage && currentPage && threadId)) return null;

			return {
				pageTitle: title,
				lastPage,
				currentPage,
				votes,
				threadId: threadId,
			};
		}),

	getHighlightQuotes: t.procedure.query(async () => {
		let highlight: string | null = null;
		const storage = browser.storage.sync || browser.storage.local;
		const fetchedData = await storage.get(['highlightedQuotes']);
		highlight = fetchedData['highlightQuotes'] ?? 'off';
		return highlight === 'on';
	}),

	syncGameDefinition: t.procedure
		.input(
			z.object({
				thread: z.string(),
				data: z.string(),
			})
		)
		.mutation(async ({ input: { thread, data } }) => {
			const storage = browser.storage.sync || browser.storage.local;
			const storingData: Record<string, unknown> = {};
			storingData[`vc_game_def_${thread}`] = data;
			await storage.set(storingData);
			return storingData;
		}),

	getGameDefinition: t.procedure
		.input(
			z.object({
				thread: z.string(),
			})
		)
		.query(async ({ input: { thread } }) => {
			const storage = browser.storage.sync || browser.storage.local;
			const fetchedData = await storage.get([`vc_game_def_${thread}`]);
			const data = fetchedData[`vc_game_def_${thread}`];
			if (typeof data != 'string') return null;
			return data;
		}),
});

export type AppRouter = typeof appRouter;

createChromeHandler({ router: appRouter });
