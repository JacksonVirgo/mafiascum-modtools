import React, { useState } from 'react';
import Button from '../../../../components/buttons/button';
import { Vote } from '../../types/gameDefinition';
import NumberInput from '../../../../components/form/NumberInput';
import TextInput from '../../../../components/form/TextInput';
import Checkbox from '../../../../components/form/Checkbox';
import { useGameDefinition } from '../../context';

export function VotesTab() {
	const [currentEdit, setCurrentEdit] = useState<Vote | null>(null);
	const setEdit = (vote: Vote) => {
		setCurrentEdit(vote);
	};

	return (
		<section className="grow w-full gap-2 flex flex-col">
			{!currentEdit && <VoteTableView setEdit={setEdit} />}

			{currentEdit && (
				<EditVote vote={currentEdit} setCurrentEdit={setCurrentEdit} />
			)}
		</section>
	);
}

interface EditVoteProps {
	vote: Vote;
	setCurrentEdit: (vote: Vote | null) => void;
}

function EditVote({ vote, setCurrentEdit }: EditVoteProps) {
	const [postNumber, setPostNumber] = useState(vote.postNumber);
	const [ignore, setIgnore] = useState(vote.ignore);
	const [target, setTarget] = useState(vote.target);
	const [_state, dispatch] = useGameDefinition();

	return (
		<div className="flex flex-col gap-2">
			<NumberInput
				name="voteNumber"
				label="Post Number"
				defaultValue={vote.postNumber}
				onChange={(value) => setPostNumber(value)}
			/>

			<TextInput
				name="target"
				label="New Target"
				defaultValue={vote.target ?? undefined}
				onChange={(value) => setTarget(value)}
			/>

			<Checkbox
				name="ignore"
				label="Ignore"
				checked={ignore}
				onChange={(value) => setIgnore(value)}
			/>

			<br />

			<div className="flex flex-row justify-center gap-2">
				<Button
					label="Save"
					onClick={() => {
						dispatch({
							type: 'UPDATE_VOTE',
							postNumber: vote.postNumber,
							vote: {
								...vote,
								postNumber,
								ignore,
								target,
							},
						});

						setCurrentEdit(null);
					}}
				/>
				<Button
					label="Discard Changes"
					onClick={() => setCurrentEdit(null)}
				/>
				<Button
					label="Delete"
					onClick={() => {
						dispatch({
							type: 'REMOVE_VOTE',
							postNumber: vote.postNumber,
						});

						setCurrentEdit(null);
					}}
				/>
			</div>
		</div>
	);
}

interface VoteTableViewProps {
	setEdit: (vote: Vote) => void;
}
function VoteTableView({ setEdit }: VoteTableViewProps) {
	const columns = ['Post Number', 'New Target', 'Ignored?'];
	const [newVote, setNewVote] = useState<number>(0);
	const [state, dispatch] = useGameDefinition();

	return (
		<>
			<div className="flex flex-row gap-2">
				<NumberInput
					label="Vote #"
					name="voteNumber"
					withoutLabel={true}
					placeholder="New Vote #"
					className="grow"
					onChange={(value) => setNewVote(value)}
				/>
				<Button
					label="Add Vote"
					onClick={() => {
						dispatch({
							type: 'ADD_VOTE',
							postNumber: newVote,
						});
					}}
				/>
			</div>

			<VoteTable
				data={state.votes.map((vote) => vote)}
				columns={columns}
				editRow={(vote) => {
					setEdit(vote);
				}}
			/>
		</>
	);
}

interface TableProps {
	data: Vote[];
	columns: string[];
	editRow?: (vote: Vote) => void;
}

export default function VoteTable({ data, columns, editRow }: TableProps) {
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
					{data.length === 0 ? (
						<tr>
							<td
								colSpan={columns.length}
								className="px-4 py-2 text-sm text-gray-300 text-center"
							>
								No entries
							</td>
						</tr>
					) : (
						data
							.sort((a, b) => b.postNumber - a.postNumber)
							.map((vote, idx) => (
								<tr
									key={idx}
									className="hover:bg-primary-lightest transition-colors duration-200 hover:cursor-pointer"
									onClick={() => {
										if (editRow) editRow(vote);
									}}
								>
									<td
										key={`${vote.postNumber}-vn`}
										className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"
									>
										{vote.postNumber}
									</td>
									<td
										key={`${vote.postNumber}-ep`}
										className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"
									>
										{vote.target
											? vote.target
											: 'Unchanged'}
									</td>
									<td
										key={`${vote.postNumber}-sp`}
										className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"
									>
										{vote.ignore ? 'Ignored' : ''}
									</td>
								</tr>
							))
					)}
				</tbody>
			</table>
		</div>
	);
}
