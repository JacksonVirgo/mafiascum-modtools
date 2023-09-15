import { GameDefinition, ValidatedVote, VoteCorrection, VoteType } from '../types/gameDefinition';
import { getUrlParams } from '../utils/url';
import { getThreadData } from './thread';
import stringSimilarity from 'string-similarity';
import $ from 'jquery';

const CORRECTION_ACCEPT_THRESHOLD = 0.88;
const CORRECTION_WARN_THRESHOLD = 0.95;

export async function startVoteCount(gameDefinition: GameDefinition | null) {
	// Do proper error handling later
	if (!gameDefinition) return console.error('No game definition provided.');
	if (!gameDefinition.players) return console.error('No players provided.');

	const startTime = Date.now();

	const val = $('#page-body > h2 > a').attr('href')?.split('?');
	if (!val) return console.error('Could not get url params.');
	if (val.length < 2) return console.error('Could not get url params.');

	const params = getUrlParams(val[1]);
	if (!params) return console.error('Could not get url params.');
	const threadId = params.get('t');
	if (!threadId) return console.error('Could not get thread id.');

	const threadData = await getThreadData(threadId);
	if (!threadData) return console.error('Could not fetch page data.');

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
			let isAuthorDead = false;
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

			console.log(aliasLegend);

			const totalVotables = Array.from(aliasLegend.keys());
			totalVotables.push('unvote');

			const closestMatch = stringSimilarity.findBestMatch(vote.target.toLowerCase(), totalVotables).bestMatch;

			let validatedName = closestMatch.target;
			if (validatedName != 'unvote') validatedName = aliasLegend.get(validatedName) ?? validatedName;
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

	let warnings: number[] = [];
	let errors: number[] = [];

	for (const vote of currentVotes) {
		const { author, post, target, rawTarget, type, validity } = vote;

		// Check if one of the wagons has reached a majority
		let isMajorityReached: boolean | undefined;
		for (const [_, wagonVotes] of Object.entries(wagons)) {
			if (wagonVotes.length >= majority) {
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
				if (wagon !== target) wagons[wagon] = wagons[wagon].filter((v) => v.author !== author);
			}

			if (!wagons[target]) wagons[target] = [];
			const alreadyExists = wagons[target].some((v) => v.author === author);
			if (!alreadyExists) wagons[target].push(vote);
		}
	}

	console.log(currentVotes);

	return {
		threadData,
		gameDefinition,
		wagons,
		majority,
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

function formatVoteCountData(gameDefinition: GameDefinition, threadData: any) {}
