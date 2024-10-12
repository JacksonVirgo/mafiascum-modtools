import React, { useEffect, useState } from 'react';
import { ReducerProps, FlaggedVotes } from './modal';
import { ValidatedVote, VoteCorrection } from '../../../types/gameDefinition';

interface ResolveVotes extends ReducerProps {
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
					state={props.state}
					dispatch={props.dispatch}
				/>
			)}
		</div>
	);
}

interface ResolveVoteTableProps extends ReducerProps {
	flaggedVotes: FlaggedVotes;
	setEdit: (vote: ValidatedVote) => void;
}

function ResolveVoteTable({ flaggedVotes, setEdit }: ResolveVoteTableProps) {
	const columns = ['Post #', 'Target', 'Corrected', 'Validity'];

	const [allProblemVotes, setAllProblemVoves] = useState<ValidatedVote[]>([]);
	useEffect(() => {
		setAllProblemVoves([...flaggedVotes.errors, ...flaggedVotes.warnings]);
	}, [flaggedVotes]);

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
		</div>
	);
}

interface EditVoteProps extends ReducerProps {
	vote: ValidatedVote;
	setEdit: (vote: ValidatedVote) => void;
}
function EditVote({ dispatch, vote }: EditVoteProps) {
	const [target, setTarget] = useState(vote.target ?? '');
	return <div className="flex flex-col gap-2"></div>;
}
