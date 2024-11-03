import React, { useEffect, useState } from 'react';
import { FlaggedVotes } from './modal';
import {
	ValidatedVote,
	VoteCorrection,
	VoteType,
} from '../types/gameDefinition';
import TextInput from '../../../components/form/TextInput';
import Button from '../../../components/buttons/button';
import { useGameDefinition, useVoteCountStateManager } from '../context';
import $ from 'jquery';

interface ResolveVotes {
	flaggedVotes: FlaggedVotes;
}

export default function ResolveVotes(props: ResolveVotes) {
	const [currentEdit, setCurrentEdit] = useState<ValidatedVote | null>(null);
	return (
		<div className="grow w-full gap-2 flex flex-col">
			{!currentEdit && (
				<ResolveVoteTable
					flaggedVotes={props.flaggedVotes}
					setEdit={setCurrentEdit}
				/>
			)}

			{currentEdit && (
				<EditVote vote={currentEdit} setEdit={setCurrentEdit} />
			)}
		</div>
	);
}

interface ResolveVoteTableProps {
	flaggedVotes: FlaggedVotes;
	setEdit: (vote: ValidatedVote | null) => void;
}

function ResolveVoteTable({ flaggedVotes, setEdit }: ResolveVoteTableProps) {
	const columns = ['Post #', 'Target', 'Corrected', 'Validity'];
	const [state] = useGameDefinition();
	const stateManager = useVoteCountStateManager();

	const [allProblemVotes, setAllProblemVoves] = useState<ValidatedVote[]>([]);
	useEffect(() => {
		updateProblemVotes();
	}, [flaggedVotes]);

	useEffect(() => {
		updateProblemVotes();
	}, [state]);

	const updateProblemVotes = () => {
		const votes = [...flaggedVotes.errors, ...flaggedVotes.warnings].filter(
			(v) => {
				const corrected = state.votes.find(
					(vote) => vote.postNumber === v.post,
				);
				return !corrected;
			},
		);

		setAllProblemVoves(votes);
	};

	return (
		<div className="overflow-auto max-h-96 border !border-secondary-dark text-gray-200 rounded-md">
			<table className="min-w-full divide-y !divide-secondary-dark">
				<thead className="bg-secondary-dark">
					<tr>
						{columns.map((column) => (
							<th
								key={column}
								className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky top-0 z-10 bg-secondary-dark"
							>
								{column}
							</th>
						))}
					</tr>
				</thead>
				<tbody className="bg-primary-lighter divide-y divide-secondary-dark">
					{allProblemVotes.length === 0 ? (
						<tr>
							<td
								colSpan={columns.length}
								className="px-4 py-2 text-sm text-gray-300 text-center"
							>
								No entries
							</td>
						</tr>
					) : (
						allProblemVotes
							.sort((a, b) => b.post - a.post)
							.map((vote, idx) => {
								let validityStr = 'N/A';
								let validityColour = '';
								switch (vote.validity) {
									case VoteCorrection.ACCEPT:
										validityStr = 'Accepted';
										break;
									case VoteCorrection.REJECT:
										validityStr = 'Error';
										validityColour = 'text-red-500';
										break;
									case VoteCorrection.WARN:
										validityStr = 'Warning';
										validityColour = 'text-yellow-500';
										break;
									default:
										validityStr = 'Error';
										validityColour = 'text-red-500';
										break;
								}

								return (
									<tr
										key={idx}
										className="hover:bg-primary-lightest transition-colors duration-200 hover:cursor-pointer"
										onClick={() => {
											if (setEdit) setEdit(vote);
										}}
									>
										<td
											key={`${vote.post}-pn`}
											className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"
										>
											{vote.post}
										</td>

										<td
											key={`${vote.post}-target`}
											className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"
										>
											{vote.rawTarget ?? 'N/A'}
										</td>
										<td
											key={`${vote.post}-corrected`}
											className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"
										>
											{vote.target ?? 'N/A'}
										</td>
										<td
											key={`${vote.post}-validity`}
											className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"
										>
											<span className={validityColour}>
												{validityStr}
											</span>
										</td>
									</tr>
								);
							})
					)}
				</tbody>
			</table>

			<br />

			<div className="flex flex-row justify-center gap-2">
				<Button
					label="Go Back"
					onClick={() => stateManager.setForm()}
				/>
			</div>
		</div>
	);
}

interface EditVoteProps {
	vote: ValidatedVote;
	setEdit: (vote: ValidatedVote | null) => void;
}
function EditVote({ vote, setEdit }: EditVoteProps) {
	const [target, setTarget] = useState(vote.target ?? '');
	const [state, dispatch] = useGameDefinition();

	return (
		<div className="flex flex-col gap-2">
			<ValidatedVoteTable vote={vote} />

			<TextInput
				name={'corrected-target'}
				label="Corrected Target"
				defaultValue={target}
				onChange={(value) => setTarget(value)}
			/>

			<br />

			<div className="flex flex-row justify-center gap-2">
				<Button
					label="Save"
					onClick={() => {
						const fetchedVote = state.votes.find(
							(v) => v.postNumber === vote.post,
						);

						const newVote = {
							postNumber: vote.post,
							target: target ?? undefined,
							ignore: fetchedVote?.ignore ?? false,
						};

						console.log(newVote);

						if (fetchedVote) {
							dispatch({
								type: 'UPDATE_VOTE',
								postNumber: vote.post,
								vote: newVote,
							});
						} else {
							dispatch({
								type: 'ADD_VOTE',
								postNumber: vote.post,
								vote: newVote,
							});
						}

						setEdit(null);
					}}
				/>
				<Button label="Discard Changes" onClick={() => setEdit(null)} />
				<Button
					label="Delete"
					onClick={() => {
						dispatch({
							type: 'REMOVE_VOTE',
							postNumber: vote.post,
						});

						setEdit(null);
					}}
				/>
			</div>
		</div>
	);
}

interface TableProps {
	vote: ValidatedVote;
}

function ValidatedVoteTable({ vote }: TableProps) {
	const { author, post, target, type, rawTarget, validity } = vote;

	// prettier-ignore
	const validityStr =
		validity === VoteCorrection.ACCEPT
			? 'Accepted'
			: validity == VoteCorrection.REJECT
				? 'Error'
				: 'Warning';

	const getPostURL = (post: number) => {
		const threadRelativeUrl = $('h2')
			.first()
			.find('a')
			.first()
			.attr('href');
		if (!threadRelativeUrl) return null;
		const regex = /t=([0-9]+)/;
		const tVal = threadRelativeUrl.match(regex);
		if (!tVal) return null;
		const threadId = tVal[1];
		if (!threadId) return null;

		const url = `https://forum.mafiascum.net/viewtopic.php?t=${threadId}&ppp=1&start=${post}`;

		return url;
	};

	const Row = ({
		header,
		data,
		url,
	}: {
		header: string;
		data: string | number;
		url?: string | null;
	}) => {
		return (
			<tr className="!border-b !border-white last:!border-b-0">
				<td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
					{header}
					{':'}
				</td>
				<td className="px-4 py-2 whitespace-nowrap text-sm bg-primary-lightest text-gray-300 w-full">
					{url && (
						<a
							href={url}
							target="_blank"
							rel="noreferrer"
							className="hover:underline"
						>
							{data}
						</a>
					)}
					{!url && data}
				</td>
			</tr>
		);
	};

	return (
		<div className="overflow-auto max-h-96 border !border-secondary-dark text-gray-200 rounded-md">
			<table className="min-w-full divide-y !divide-secondary-dark">
				<tbody className="bg-primary-lighter divide-y divide-secondary-dark">
					<Row header="Author" data={author} />
					<Row header="Post" data={post} url={getPostURL(post)} />
					<Row
						header="Type"
						data={type == VoteType.UNVOTE ? 'Unvote' : 'Vote'}
					/>
					<Row header="Raw Target" data={rawTarget ?? 'N/A'} />
					<Row header="Target" data={target ?? 'N/A'} />
					<Row header="Validity" data={validityStr} />
				</tbody>
			</table>
		</div>
	);
}
