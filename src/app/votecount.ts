import { GameDefinition, ValidatedVote, VoteCorrection, VoteType } from '../types/gameDefinition';
import { getUrlParams } from '../utils/url';
import { getThreadData } from './thread';
import stringSimilarity from 'string-similarity';
import $ from 'jquery';
import { isMemberVerificationResponse } from '../types/backgroundResponse';
import { sendBackgroundRequest } from './request';

const CORRECTION_ACCEPT_THRESHOLD = 0.88;
const CORRECTION_WARN_THRESHOLD = 0.95;

const UNVOTE_TAG = 'unvote';
const NO_ELIMINATION_TAG = 'no elimination';

type VoteCount = NonNullable<Awaited<ReturnType<typeof startVoteCount>>>;

export async function validateGameDefinition(gameDefinition: GameDefinition) {
	const playerVerification = new Map<string, boolean>();
	for (const player of gameDefinition.players) {
		try {
			const verification = await sendBackgroundRequest({ action: 'verifyMember', username: player });
			if (!isMemberVerificationResponse(verification)) playerVerification.set(player, false);
			else playerVerification.set(player, verification.verified);
		} catch (err) {
			console.error(err);
			playerVerification.set(player, false);
		}
	}

	return {
		players: playerVerification,
	};
}

export async function startVoteCount(gameDefinition: GameDefinition | null) {
	// Do proper error handling later

	const error = (message: string) => {
		console.error(message);
		return null;
	};

	if (!gameDefinition) return error('No game definition provided.');
	if (!gameDefinition.players) return error('No players provided.');

	const startTime = Date.now();

	const val = $('#page-body > h2 > a').attr('href')?.split('?');
	if (!val) return error('Could not get url params.');
	if (val.length < 2) return error('Could not get url params.');

	const params = getUrlParams(val[1]);
	if (!params) return error('Could not get url params.');
	const threadId = params.get('t');
	if (!threadId) return error('Could not get thread id.');

	const threadData = await getThreadData(threadId);
	if (!threadData) return error('Could not fetch page data.');

	const fetchTime = Date.now();

	const startFrom = gameDefinition?.startFrom ?? 0;
	const endAt = gameDefinition?.endAt;

	const currentVotes = threadData.votes
		.filter((vote) => {
			if (vote.post === undefined) return false;
			const isAfterStart = vote.post >= startFrom;
			const isBeforeEnd = endAt === undefined || vote.post <= endAt;
			if (!(isAfterStart && isBeforeEnd)) return false;

			// Check if author is a player
			const isAuthorPlayer = gameDefinition?.players.some((v) => v.toLowerCase() === vote.author.toLowerCase());
			if (!isAuthorPlayer) return false;

			// Check if author is dead
			const isAuthorDead = false;
			for (const [key, value] of Object.entries(gameDefinition?.dead ?? {}))
				if (vote.author.toLowerCase() === key.toLowerCase() && value <= vote.post) return false;
			if (isAuthorDead) return false;

			return true;
		})
		.map((v) => {
			const vote: ValidatedVote = {
				type: VoteType.VOTE,
				author: v.author,
				target: v.vote,
				post: v.post,
				validity: VoteCorrection.REJECT,
			};

			if (vote.target?.startsWith('UNVOTE:')) {
				vote.type = VoteType.UNVOTE;
				vote.target = v.vote.slice(7).trim();
			} else if (vote.target?.startsWith('VOTE:')) {
				vote.type = VoteType.VOTE;
				vote.target = v.vote.slice(5).trim();
			}

			if (vote.target === undefined) return vote;

			const aliasLegend = new Map<string, string>();
			gameDefinition?.players.forEach((v) => {
				aliasLegend.set(v.toLowerCase(), v);
			});

			if (gameDefinition.aliases) {
				for (const alias in gameDefinition.aliases) {
					const aka = gameDefinition.aliases[alias];
					aka.forEach((v) => {
						aliasLegend.set(v.toLowerCase(), alias);
					});
				}
			}
			const totalVotables = Array.from(aliasLegend.keys());
			totalVotables.push(UNVOTE_TAG);
			if (!gameDefinition.disable?.includes('No Elimination')) totalVotables.push(NO_ELIMINATION_TAG);

			const closestMatch = stringSimilarity.findBestMatch(vote.target.toLowerCase(), totalVotables).bestMatch;

			let validatedName = closestMatch.target;
			if (validatedName != UNVOTE_TAG && validatedName != NO_ELIMINATION_TAG) validatedName = aliasLegend.get(validatedName) ?? validatedName;
			vote.target = validatedName;

			if (closestMatch.rating >= CORRECTION_ACCEPT_THRESHOLD) vote.validity = VoteCorrection.ACCEPT;
			else if (closestMatch.rating >= CORRECTION_WARN_THRESHOLD) vote.validity = VoteCorrection.WARN;
			else vote.validity = VoteCorrection.REJECT;
			return vote;
		})
		.sort((a, b) => {
			const aPost = a.post;
			const bPost = b.post;
			return aPost - bPost;
		});

	const wagons: Record<string, ValidatedVote[]> = {};

	const allPlayers = gameDefinition?.players ?? [];
	const livingPlayers = allPlayers.filter((p) => {
		if (gameDefinition.dead && gameDefinition.dead[p]) return false;
		return true;
	});

	const majority = Math.floor(livingPlayers.length / 2) + 1;

	const warnings: number[] = [];
	const errors: number[] = [];

	for (const vote of currentVotes) {
		const { author, post, target, type, validity } = vote;

		// Check if one of the wagons has reached a majority
		let isMajorityReached: boolean | undefined;
		for (const [wagon, wagonVotes] of Object.entries(wagons)) {
			const maj = wagon == NO_ELIMINATION_TAG ? Math.ceil(livingPlayers.length / 2) : majority;
			if (wagonVotes.length >= maj) {
				isMajorityReached = true;
				break;
			}
		}
		if (isMajorityReached) break;

		// Log errors and warnings so that the host/s know what to check
		if (validity === VoteCorrection.REJECT) errors.push(post);
		else if (validity === VoteCorrection.WARN) warnings.push(post);

		if (type === VoteType.UNVOTE) {
			for (const wagon in wagons) {
				wagons[wagon] = wagons[wagon].filter((v) => v.author !== author);
			}
		} else if (type === VoteType.VOTE) {
			if (!target) continue;
			for (const wagon in wagons) {
				if (wagon !== target || target == UNVOTE_TAG) wagons[wagon] = wagons[wagon].filter((v) => v.author !== author);
			}

			if (!wagons[target]) wagons[target] = [];
			const alreadyExists = wagons[target].some((v) => v.author === author);
			if (!alreadyExists) wagons[target].push(vote);
		}
	}

	const notVoting = livingPlayers.filter((p) => {
		for (const entry of Object.entries(wagons)) {
			if (entry[1].some((v) => v.author === p)) return false;
		}
		return true;
	});

	return {
		threadData,
		gameDefinition,
		wagons,
		majority,
		notVoting,
		livingPlayers,
		logs: {
			warnings,
			errors,
		},
		timers: {
			startTime: startTime,
			fetchTime,
		},
	};
}

export function formatVoteCountData(voteCount: VoteCount) {
	const wagonStrings: [string, number][] = [];

	for (const wagonHandle in voteCount.wagons) {
		const wagon = voteCount.wagons[wagonHandle];
		if (wagon.length <= 0) continue;

		const calculatedMajority = wagonHandle == NO_ELIMINATION_TAG ? Math.ceil(voteCount.livingPlayers.length / 2) : voteCount.majority;
		const wagonLength = wagonHandle == NO_ELIMINATION_TAG ? -1 : wagon.length;
		const wagonTitle = wagonHandle == NO_ELIMINATION_TAG ? 'No Elimination' : wagonHandle;
		const wagonStr = `[b]${wagonTitle} (${wagon.length}/${calculatedMajority})[/b] -> ${wagon
			.map((v) => `${v.author} ([post]${v.post}[/post])`)
			.join(', ')}`;
		wagonStrings.push([wagonStr, wagonLength]);
	}

	const notVotingStr = `[b]Not Voting (${voteCount.notVoting.length})[/b] -> ${voteCount.notVoting.join(', ')}`;

	wagonStrings.sort((a, b) => b[1] - a[1]);

	return `[area=Current Votes]${wagonStrings.map((v) => v[0]).join('\n')}\n\n${notVotingStr}[/area]`;
}
