import { GameDefinition } from '../types/gameDefinition';
import { getUrlParams } from '../utils/url';
import { getThreadData } from './thread';

export async function startVoteCount(gameDefinition: GameDefinition | null) {
	const startTime = Date.now();

	const params = getUrlParams(window.location.search);
	if (!params) return console.error('Could not get url params.');
	const threadId = params.get('t');
	if (!threadId) return console.error('Could not get thread id.');

	const threadData = await getThreadData(threadId);
	if (!threadData) return console.error('Could not fetch page data.');

	const fetchTime = Date.now();

	const startFrom = gameDefinition?.startFrom ?? 0;
	const endAt = gameDefinition?.endAt;

	const currentVotes = threadData.votes.filter((vote) => {
		if (vote.post === undefined) return false;
		const isAfterStart = vote.post >= startFrom;
		const isBeforeEnd = endAt === undefined || vote.post <= endAt;
		return isAfterStart && isBeforeEnd;
	});

	const votes = new Map<string, [number, string]>();

	for (const { author, vote, post } of currentVotes) {
		const existing = votes.get(author);
		if (!existing) {
			votes.set(author, [post, vote]);
			continue;
		}
		if (existing[0] < post) votes.set(author, [post, vote]);
	}

	const voteCount = Array.from(votes.entries()).map(([author, [post, vote]]) => {
		return {
			author,
			post,
			vote,
		};
	});

	return {
		threadData,
		gameDefinition,
		voteCount,
		timers: {
			startTime: startTime,
			fetchTime,
		},
	};
}

function formatVoteCountData(gameDefinition: GameDefinition, threadData: any) {}
