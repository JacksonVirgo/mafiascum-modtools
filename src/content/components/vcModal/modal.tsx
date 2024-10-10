import React, {
	createRef,
	forwardRef,
	useEffect,
	useImperativeHandle,
	useState,
} from 'react';

import $ from 'jquery';
import LoadingSpinner from '../indicators/LoadingSpinner';
import { renderReact } from '../../../utils/react';
import Button from '../buttons/button';
import { ModalForm } from './form';
import {
	Day,
	GameDefinition,
	ValidatedVote,
	VoteCorrection,
	VoteType,
} from '../../../types/newGameDefinition';
import { getThreadData } from '../../thread';
import { stringSimilarityAlgs } from '../../../utils/stringCorrection';

export const CSS_HIDDEN = 'me_hidden';

export async function createModal() {
	const modal = renderReact(<Modal ref={modalRef} />);
	$('body').append(modal);
	return modal;
}

enum ModalState {
	Form,
	Loading,
	Response,
}

interface ModalHandle {
	show: () => void;
	hide: () => void;
	setForm: () => void;
	setLoading: () => void;
	setResponse: (res: string) => void;
}
const modalRef = createRef<ModalHandle>();
export const modalManager = {
	show: () => {
		if (modalRef.current) {
			modalRef.current.show();
		}
	},
	hide: () => {
		if (modalRef.current) {
			modalRef.current.hide();
		}
	},
	setForm: () => {
		if (modalRef.current) {
			modalRef.current.setForm();
		}
	},
	setLoading: () => {
		if (modalRef.current) {
			modalRef.current.setLoading();
		}
	},
	setResponse: (res: string) => {
		if (modalRef.current) {
			modalRef.current.setResponse(res);
		}
	},
};

export const Modal = forwardRef((_props, ref) => {
	const [isVisible, setIsVisible] = useState(false);
	const [currentState, setCurrentState] = useState(ModalState.Form);
	const [response, setResponse] = useState<string | undefined>();

	useImperativeHandle(ref, () => ({
		show: () => setIsVisible(true),
		hide: () => setIsVisible(false),
		setForm: () => setCurrentState(ModalState.Form),
		setLoading: () => setCurrentState(ModalState.Loading),
		setResponse: (str: string) => {
			setResponse(str);
			setCurrentState(ModalState.Response);
		},
	}));

	useEffect(() => {
		document.body.style.overflow = isVisible ? 'hidden' : 'auto';
	}, [isVisible]);

	const onResponse = (res: string) => {
		setResponse(res);
	};

	return (
		<div
			id="me_votecount"
			className={`fixed top-0 left-0 w-screen h-screen bg-[rgba(0, 0, 0, 0.3)] backdrop-blur-sm z-[50] flex flex-col justify-center items-center ${
				isVisible ? '' : '!hidden'
			}`}
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					setIsVisible(false);
				}
			}}
		>
			<div className="aspect-[3/2] h-1/2 max-h-1/2 flex flex-col bg-primary-color rounded-[15px] border-2 border-white justify-center items-center p-4">
				<div className="w-full shrink flex flex-row items-center align-middle justify-center border-b-2 border-white">
					<span className="grow text-white text-lg font-bold">
						Votecounter
					</span>
					<div className="text-right">
						<span
							className="hover:cursor-pointer"
							onClick={() => setIsVisible(false)}
						>
							❌
						</span>
					</div>
				</div>

				<hr className="w-full" />

				{currentState == ModalState.Loading && (
					<div className="grow flex flex-col justify-center items-center">
						<LoadingSpinner />
					</div>
				)}
				{currentState == ModalState.Form && (
					<ModalForm onResponse={onResponse} />
				)}
				{currentState == ModalState.Response && (
					<ModalResponse format={response} />
				)}
			</div>
		</div>
	);
});

interface ModalResponseProps {
	format?: string;
}
export const ModalResponse = ({ format }: ModalResponseProps) => {
	const copyToClipboard = () => {
		if (!format) return;
		navigator.clipboard.writeText(format);
	};

	const goBack = () => {
		modalManager.setForm();
	};

	return (
		<div className="border-2 border-white grow w-full flex flex-col gap-2">
			<textarea
				className="grow h-full w-full resize-none"
				readOnly
				value={format}
			></textarea>

			<div className="shrink flex flex-row items-center justify-center gap-2">
				<Button label="Go back" onClick={goBack} />
				<Button label="Copy to clipboard" onClick={copyToClipboard} />
			</div>
		</div>
	);
};

const CORRECTION_ACCEPT_THRESHOLD = 0.88;
const CORRECTION_WARN_THRESHOLD = 0.95;

type VoteCount = NonNullable<Awaited<ReturnType<typeof startVoteCount>>>;

export async function startVoteCount(gameDefinition: GameDefinition) {
	const error = (message: string) => {
		console.error(message);
		return null;
	};

	if (!gameDefinition) return error('No game definition provided.');
	if (!gameDefinition.players) return error('No players provided.');

	const startTime = Date.now();
	const threadRelativeUrl = $('h2').first().find('a').first().attr('href');
	if (!threadRelativeUrl) return error('No thread relative url found.');

	const regex = /t=([0-9]+)/;

	const tVal = threadRelativeUrl.match(regex);
	if (!tVal) return error('No thread id found.');

	const threadId = tVal[1];
	if (!threadId) return error('No thread id found.');

	const lastDay: Day = gameDefinition.days.reduce((pre, cur) => {
		if (cur.dayNumber > pre.dayNumber) return cur;
		return pre;
	}, gameDefinition.days[0]);

	const { startPost, endPost } = lastDay;

	if (!lastDay || !startPost) return error('No last day found.');

	const threadData = await getThreadData(threadId, startPost);
	if (!threadData) return error('No thread data found.');

	const fetchTime = Date.now() - startTime;
	console.log('Fetch time', fetchTime);

	const aliasLegend = new Map<string, string>();
	gameDefinition?.players.forEach((p) => {
		aliasLegend.set(p.current.toLowerCase(), p.current);
		p.aliases.forEach((a) => {
			aliasLegend.set(a.toLowerCase(), p.current);
		});
		p.previous.forEach((p) => {
			aliasLegend.set(p.toLowerCase(), p);
		});
	});

	const currentVotes = threadData.votes
		.filter((vote) => {
			if (vote.post === undefined) return false;
			const isAfterStart = vote.post >= startPost;
			const isBeforeEnd = endPost === undefined || vote.post <= endPost;
			if (!(isAfterStart && isBeforeEnd)) return false;

			// Check if author is a player
			const isAuthorPlayer = gameDefinition?.players.some(
				(v) => v.current.toLowerCase() === vote.author.toLowerCase(),
			);
			if (!isAuthorPlayer) return false;

			// Check if author exists
			const author = gameDefinition.players.find(
				(v) => v.current.toLowerCase() === vote.author.toLowerCase(),
			);
			if (!author) return false;

			// Check if author died
			if (author.diedAt && author.diedAt >= vote.post) return false;

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

			const totalVotable = Array.from(aliasLegend.keys());
			totalVotable.push('unvote');

			const closestMatch =
				stringSimilarityAlgs.dice_coefficient.bestMatch(
					vote.target.toLowerCase(),
					totalVotable,
				).bestMatch;
			let validatedName = closestMatch[0];
			if (validatedName != 'unvote')
				validatedName = aliasLegend.get(validatedName) ?? validatedName;
			vote.target = validatedName;

			if (closestMatch[1] >= CORRECTION_ACCEPT_THRESHOLD)
				vote.validity = VoteCorrection.ACCEPT;
			else if (closestMatch[1] >= CORRECTION_WARN_THRESHOLD)
				vote.validity = VoteCorrection.WARN;
			else vote.validity = VoteCorrection.REJECT;

			console.log(vote);

			return vote;
		})
		.sort((a, b) => a.post - b.post);

	const wagons: Record<string, ValidatedVote[]> = {};
	const allPlayers = gameDefinition.players;
	const livingPlayers = allPlayers.filter((p) => !p.diedAt);

	const majority = Math.floor(livingPlayers.length / 2) + 1;

	const warnings: number[] = [];
	const errors: number[] = [];

	for (const vote of currentVotes) {
		const { author, post, type, validity } = vote;
		let { target } = vote;

		console.log(
			'Original Target',
			target,
			target ? aliasLegend.get(target?.toLowerCase()) : 'No correction',
		);
		if (target) target = aliasLegend.get(target.toLowerCase()) ?? target;

		let isMajorityReached: boolean | undefined;
		for (const wagon of Object.keys(wagons)) {
			if (wagons[wagon].length >= majority) {
				isMajorityReached = true;
				break;
			}
		}
		if (isMajorityReached) break;

		if (validity === VoteCorrection.WARN) warnings.push(post);
		if (validity === VoteCorrection.REJECT) errors.push(post);

		if (type === VoteType.UNVOTE) {
			for (const wagon in wagons) {
				wagons[wagon] = wagons[wagon].filter(
					(v) => v.author !== author,
				);
			}
		} else if (type === VoteType.VOTE) {
			if (!target) continue;
			for (const wagon in wagons) {
				if (wagon !== target || target == 'unvote')
					wagons[wagon] = wagons[wagon].filter(
						(v) => v.author !== author,
					);
			}

			if (!wagons[target]) wagons[target] = [];
			const alreadyExists = wagons[target].some(
				(v) => v.author === author,
			);
			if (!alreadyExists) wagons[target].push(vote);
		}
	}

	console.log('wagons', wagons);

	const notVoting = livingPlayers
		.filter((p) => {
			for (const wagon in wagons) {
				if (wagons[wagon].some((v) => v.author === p.current))
					return false;
			}
			return true;
		})
		.map((p) => p.current);

	return {
		threadData,
		gameDefinition,
		wagons,
		notVoting,
		majority,
		logs: {
			errors,
			warnings,
		},
		timers: {
			startTime,
			fetchTime,
		},
	};
}

export function formatVoteCountData(voteCount: VoteCount) {
	const wagonStrings: [string, number][] = [];

	for (const wagonHandle in voteCount.wagons) {
		const wagon = voteCount.wagons[wagonHandle];
		if (wagon.length <= 0) continue;

		const calculatedMajority = voteCount.majority;
		const wagonLength = wagon.length;
		const wagonTitle = wagonHandle;
		const wagonStr = `[b]${wagonTitle} (${
			wagon.length
		}/${calculatedMajority})[/b] -> ${wagon
			.map((v) => `${v.author} ([post]${v.post}[/post])`)
			.join(', ')}`;
		wagonStrings.push([wagonStr, wagonLength]);
	}

	const notVotingStr = `[b]Not Voting (${
		voteCount.notVoting.length
	})[/b] -> ${voteCount.notVoting.join(', ')}`;

	wagonStrings.sort((a, b) => b[1] - a[1]);

	return `[area=Current Votes]${wagonStrings
		.map((v) => v[0])
		.join('\n')}\n\n${notVotingStr}[/area]`;
}
