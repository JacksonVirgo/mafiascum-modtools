import React, { useState } from 'react';
import { Player } from '../../types/gameDefinition';
import Button from '../../../../components/buttons/button';
import NumberInput from '../../../../components/form/NumberInput';
import TextArea from '../../../../components/form/TextArea';
import TextInput from '../../../../components/form/TextInput';
import { useGameDefinition } from '../../context';

export function PlayersTab() {
	const [currentEdit, setCurrentEdit] = useState<Player | null>(null);
	const setEdit = (player: Player) => {
		setCurrentEdit(player);
	};
	return (
		<section className="grow w-full gap-2 flex flex-col">
			{!currentEdit && <PlayerTableView setEdit={setEdit} />}

			{currentEdit && (
				<EditPlayer
					player={currentEdit}
					setCurrentEdit={setCurrentEdit}
				/>
			)}
		</section>
	);
}

interface PlayerTableViewProps {
	setEdit: (player: Player) => void;
}

export function PlayerTableView({ setEdit }: PlayerTableViewProps) {
	const [state, dispatch] = useGameDefinition();
	const [newUsername, setNewUsername] = useState<string>('');
	return (
		<section className="grow w-full gap-2 flex flex-col">
			<div className="flex flex-row gap-2">
				<TextInput
					label="Username"
					name="username"
					withoutLabel={true}
					placeholder="New Player's Username"
					className="grow"
					onChange={(value) => setNewUsername(value)}
				/>
				<Button
					label="Add Player"
					onClick={() => {
						const existing = state.players.find((p) => {
							return p.current === newUsername;
						});

						if (!existing)
							dispatch({
								type: 'ADD_PLAYER',
								username: newUsername,
							});
						else {
							// TODO: Show error
						}
					}}
				/>
			</div>

			<PlayerTable
				data={state.players}
				columns={['Username', 'Aliases', 'Replacements', 'Status']}
				editRow={(player) => {
					setEdit(player);
				}}
			/>
		</section>
	);
}

interface TableProps {
	data: Player[];
	columns: string[];
	editRow?: (player: Player) => void;
}

export default function PlayerTable({ data, columns, editRow }: TableProps) {
	const parseTableNum = (num: number) => {
		if (num != 0) return num;
		else return '-';
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
						data.sort().map((player, idx) => (
							<tr
								key={idx}
								className="hover:bg-primary-lightest transition-colors duration-200 hover:cursor-pointer"
								onClick={() => {
									if (editRow) editRow(player);
								}}
							>
								<td
									key={`${player.current}-un`}
									className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"
								>
									{player.current}
								</td>
								<td
									key={`${player.current}-alias`}
									className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"
								>
									{parseTableNum(player.aliases.length)}
								</td>
								<td
									key={`${player.current}-previous`}
									className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"
								>
									{parseTableNum(player.previous.length)}
								</td>
								<td
									key={`${player.current}-died`}
									className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"
								>
									{player.diedAt
										? `Died at ${player.diedAt}`
										: '-'}
								</td>
							</tr>
						))
					)}
				</tbody>
			</table>
		</div>
	);
}

interface EditPlayerProps {
	player: Player;
	setCurrentEdit: (player: Player | null) => void;
}

export function EditPlayer({ player, setCurrentEdit }: EditPlayerProps) {
	const [_state, dispatch] = useGameDefinition();

	const [username, setUsername] = useState(player.current);
	const [aliases, setAliases] = useState(player.aliases);
	const [previous, setPrevious] = useState(player.previous);
	const [diedAt, setDiedAt] = useState(player.diedAt);

	return (
		<div className="flex flex-col gap-2">
			<TextInput
				label="Username"
				name="username"
				defaultValue={username}
				onChange={(value) => setUsername(value)}
			/>

			<NumberInput
				label="Died At"
				name="diedAt"
				defaultValue={diedAt}
				onChange={(value) => setDiedAt(value)}
			/>

			<div className="grid grid-cols-2 gap-2">
				<div className="flex flex-col gap-2 grow">
					<TextArea
						name="aliases"
						label="Aliases (seperate by new line)"
						defaultValue={player.aliases.join('\n')}
						className="h-60"
						onChange={(value) =>
							setAliases(
								value.split('\n').filter((v) => {
									return v.replace(/\s/g, '') !== '';
								}),
							)
						}
					/>
				</div>
				<div className="flex flex-col gap-2 grow">
					<TextArea
						name="previous"
						label="Replacements (seperate by new line)"
						defaultValue={player.previous.join('\n')}
						className="h-60"
						onChange={(value) =>
							setPrevious(
								value.split('\n').filter((v) => {
									return v.replace(/\s/g, '') !== '';
								}),
							)
						}
					/>
				</div>
			</div>

			<div className="flex flex-row justify-center gap-2">
				<Button
					label="Save"
					onClick={() => {
						dispatch({
							type: 'UPDATE_PLAYER',
							username: player.current,
							player: {
								...player,
								current: username,
								aliases,
								previous,
								diedAt,
							},
						});
						setCurrentEdit(null);
					}}
				/>
				<Button
					label="Discard Changes"
					onClick={() => {
						setCurrentEdit(null);
					}}
				/>
				<Button
					label="Delete"
					onClick={() => {
						dispatch({
							type: 'REMOVE_PLAYER',
							username: player.current,
						});
						setCurrentEdit(null);
					}}
				/>
			</div>
		</div>
	);
}
