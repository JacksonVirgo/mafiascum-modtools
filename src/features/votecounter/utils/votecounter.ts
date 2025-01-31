import {
	GameDefinition,
	ValidatedVote,
	VoteCorrection,
	VoteType,
} from '../types/gameDefinition';
import $ from 'jquery';
import { findBestMatch } from '../../../lib/stringSimilarity';
import { getThreadData } from './thread';
import { Post } from '../background/getPageData';

const CORRECTION_ERROR_THRESHOLD = 0.88;
const CORRECTION_WARN_THRESHOLD = 0.95;
const THREAD_ID_REGEX = /t=([0-9]+)/;

const UNVOTE = 'unvote';
const UNVOTE_TAG = 'UNVOTE:';
const VOTE_TAG = 'VOTE:';

export type VoteCountOptions = {
	targetPostNumber?: number;
};
export async function startVoteCount(
	gameDefinition: GameDefinition,
	options: VoteCountOptions = {},
) {
	try {
		const relativeUrl = fetchRelativeUrl();
		if (!relativeUrl) throw new Error('No thread relative url found.');

		const threadId = getThreadFromRelativeUrl(relativeUrl);
		if (!threadId) throw new Error('No thread id found.');

		let endPost = 0;
		let startPost = 0;

		if (options.targetPostNumber) {
			const day = getDayOfPost(gameDefinition, options.targetPostNumber);
			endPost = options.targetPostNumber;
			startPost = day?.startPost ?? 0;
		} else {
			const lastDay = getLastDay(gameDefinition);
			endPost = lastDay?.endPost ?? 0;
			startPost = lastDay?.startPost ?? 0;
		}

		const threadData = await getThreadData(threadId, startPost, endPost);
		if (!threadData) throw new Error('Could not fetch thread data.');

		const aliasLegend = new Map<string, string>();
		for (const player of gameDefinition.players) {
			aliasLegend.set(player.current.toLowerCase(), player.current);
			for (const alias of [...player.aliases, ...player.previous]) {
				aliasLegend.set(alias.toLowerCase(), player.current);
			}
		}

		const gameData: GameData = {
			gameDefinition,
			aliasLegend,
			start: startPost,
			end: endPost,
		};

		const validVotes = threadData.posts
			.filter((v) => isPostValid(v, gameData))
			.map((v) => validatePost(v, gameData))
			.sort((a, b) => a.post - b.post);

		const votecount = countVotes(validVotes, gameData);
		const formattedVotecount = formatVotecount(votecount, gameData);

		return {
			votecount,
			formatted: formattedVotecount,
		};
	} catch (err) {
		console.log(err);
		return null;
	}
}

export function fetchRelativeUrl() {
	const threadRelativeUrl = $('h2').first().find('a').first().attr('href');
	if (!threadRelativeUrl) return null;
	return threadRelativeUrl;
}

export function getThreadFromRelativeUrl(relativeUrl: string) {
	const t = relativeUrl.match(THREAD_ID_REGEX);
	if (!t) return null;
	const withoutPrefix = t.shift()?.slice('t='.length).trim();
	if (!withoutPrefix) return null;
	return withoutPrefix;
}

function getLastDay(gameDefinition: GameDefinition) {
	if (gameDefinition.days.length <= 0) return null;
	return gameDefinition.days.reduce((pre, cur) => {
		if (cur.dayNumber > pre.dayNumber) return cur;
		return pre;
	}, gameDefinition.days[0]);
}

function getDayOfPost(gameDefinition: GameDefinition, postNumber: number) {
	for (const checkDay of gameDefinition.days) {
		if (checkDay.startPost && postNumber <= checkDay.startPost) continue;
		if (checkDay.endPost && postNumber >= checkDay.endPost) continue;
		return checkDay;
	}
	return null;
}

interface GameData {
	gameDefinition: GameDefinition;
	aliasLegend: Map<string, string>;
	start: number;
	end?: number;
}

function isPostValid(post: Post, data: GameData) {
	if (post.postNumber === undefined) return false;
	if (post.votes.length === 0) return false;
	if (data.end && post.postNumber > data.end) return false;
	if (post.postNumber < data.start) return false;
	const author = data.gameDefinition.players.find((p) => {
		if (p.current.toLowerCase() === post.author.toLowerCase()) return true;
		if (
			p.previous.find(
				(prev) => prev.toLowerCase() == post.author.toLowerCase(),
			)
		)
			return true;
		return false;
	});
	if (!author) return false;
	if (author.diedAt && author.diedAt <= post.postNumber) return false;
	return true;
}

function validatePost(
	post: Post,
	{ aliasLegend, gameDefinition }: GameData,
): ValidatedVote {
	let lastVote: string | undefined;
	if (post.votes.length > 0)
		lastVote = post.votes.reduce((pre, cur) => {
			return pre.index > cur.index ? pre : cur;
		}).value;

	const vote: ValidatedVote = {
		type: VoteType.VOTE,
		author: post.author,
		target: lastVote,
		post: post.postNumber,
		validity: VoteCorrection.REJECT,
	};

	const manualCorrection = gameDefinition.votes.find((vArr) => {
		return post.postNumber == vArr.postNumber;
	});

	vote.ignore = manualCorrection?.ignore ?? false;

	if (vote.target?.startsWith(UNVOTE_TAG)) {
		vote.type = VoteType.UNVOTE;
		vote.target = 'unvote'; //vote.target.replace(UNVOTE_TAG, '').trim();
		// TODO: Add functionality to handle unvotes being blank or of specific people later, as usesPython has suggested
	} else if (vote.target?.startsWith(VOTE_TAG)) {
		vote.type = VoteType.VOTE;
		vote.target = vote.target.replace(VOTE_TAG, '').trim();
	} else if (vote.target === undefined) return vote;
	vote.rawTarget = vote.target;

	if (manualCorrection) vote.target = manualCorrection.target ?? undefined;
	if (vote.target === undefined) return vote;

	const allVotableTargets = Array.from(aliasLegend.keys());
	allVotableTargets.push(UNVOTE.toLowerCase());

	const closestMatchedTarget = findBestMatch(vote.target, allVotableTargets);
	if (!closestMatchedTarget) return vote;
	const match = closestMatchedTarget.bestMatch;

	const correctedAuthor = aliasLegend.get(vote.author.toLowerCase());
	vote.author = correctedAuthor ?? vote.author;

	const correctedTarget = aliasLegend.get(match.value.toLowerCase());
	vote.target = correctedTarget ?? match.value;

	vote.target = match.value;
	if (match.rating <= CORRECTION_ERROR_THRESHOLD)
		vote.validity = VoteCorrection.REJECT;
	else if (match.rating <= CORRECTION_WARN_THRESHOLD)
		vote.validity = VoteCorrection.WARN;
	else vote.validity = VoteCorrection.ACCEPT;

	if (manualCorrection) vote.validity = VoteCorrection.ACCEPT;

	return vote;
}

export type VoteCount = NonNullable<Awaited<ReturnType<typeof countVotes>>>;
export type Wagon = {
	votes: ValidatedVote[];
	reachedAt: number;
};
function countVotes(
	votes: ValidatedVote[],
	{ gameDefinition, aliasLegend, end }: GameData,
) {
	const wagons: Record<string, Wagon> = {};
	const players = gameDefinition.players;
	const livingPlayers = players.filter((p) => {
		if (!p.diedAt) return true;
		if (!end) return false;
		if (p.diedAt > end) return true; // Allow for previous snapshots.
		return true;
	});

	const majority = Math.floor(livingPlayers.length / 2) + 1;

	const warnings: ValidatedVote[] = [];
	const errors: ValidatedVote[] = [];

	for (const vote of votes) {
		const { author, type, validity, ignore, post } = vote;
		let { target } = vote;

		if (ignore) continue;

		if (target) target = aliasLegend.get(target.toLowerCase()) ?? target;
		let isMajorityReached: boolean | undefined;
		for (const wagon of Object.keys(wagons)) {
			const { votes } = wagons[wagon];
			if (votes.length >= majority) {
				isMajorityReached = true;
				break;
			}
		}
		if (isMajorityReached) break;

		if (validity == VoteCorrection.WARN) warnings.push(vote);
		else if (validity == VoteCorrection.REJECT) errors.push(vote);

		if (type == VoteType.UNVOTE) {
			for (const wagon in wagons) {
				const { votes } = wagons[wagon];
				wagons[wagon].votes = votes.filter((v) => v.author !== author);
			}
		} else if (type == VoteType.VOTE) {
			if (!target) continue;
			for (const wagon in wagons) {
				const { votes } = wagons[wagon];
				if (wagon !== target || target == UNVOTE)
					wagons[wagon].votes = votes.filter(
						(v) => v.author !== author,
					);
			}

			if (target.toLowerCase() == UNVOTE.toLowerCase()) continue;

			if (!wagons[target])
				wagons[target] = {
					votes: [],
					reachedAt: 0,
				};

			const alreadyExists = wagons[target].votes.some(
				(v) => v.author === author,
			);
			if (!alreadyExists) {
				wagons[target].votes.push(vote);
				wagons[target].reachedAt = post;
			}
		}
	}

	const playersNotVoting = livingPlayers
		.filter((p) => {
			for (const wagon in wagons) {
				if (wagons[wagon].votes.some((v) => v.author === p.current))
					return false;
			}
			return true;
		})
		.map((p) => p.current);

	return {
		wagons,
		notVoting: playersNotVoting,
		majority,
		votes,
		logs: {
			warnings,
			errors,
		},
	};
}

function formatVotecount(votecount: VoteCount, { gameDefinition }: GameData) {
	const wagonStrings: [string, number][] = [];

	const wagonKeys = Object.keys(votecount.wagons);
	if (gameDefinition.misc?.voteOrdering == 'firstToReach') {
		// Order by wagon size and then reachedAt (plurality ordering)
		wagonKeys.sort((a, b) => {
			const aSize = votecount.wagons[a].votes.length;
			const bSize = votecount.wagons[b].votes.length;
			if (aSize != bSize) return bSize - aSize;

			const aReached = votecount.wagons[a].reachedAt;
			const bReached = votecount.wagons[b].reachedAt;
			return aReached - bReached;
		});
	} else {
		// Order by wagon size
		wagonKeys.sort((a, b) => {
			const aSize = votecount.wagons[a].votes.length;
			const bSize = votecount.wagons[b].votes.length;
			return bSize - aSize;
		});
	}

	wagonKeys.forEach((handle) => {
		const wagon = votecount.wagons[handle];
		if (wagon.votes.length <= 0) return;

		const calculatedMajority = votecount.majority;
		const wagonLength = wagon.votes.length;
		const wagonTitle = handle;
		const wagonStr = `[b]${wagonTitle} (${
			wagonLength
		}/${calculatedMajority})[/b] -> ${wagon.votes
			.map((v) => `${v.author} ([post]${v.post}[/post])`)
			.join(', ')}`;
		wagonStrings.push([wagonStr, wagonLength]);
	});

	const notVotingStr = `[b]Not Voting (${
		votecount.notVoting.length
	})[/b] -> ${votecount.notVoting.join(', ')}`;

	wagonStrings.sort((a, b) => b[1] - a[1]);

	return `[area=Current Votes]${wagonStrings.map((v) => v[0]).join('\n')}\n${
		votecount.notVoting.length > 0 ? '\n' + notVotingStr : ''
	}[/area]`;
}
