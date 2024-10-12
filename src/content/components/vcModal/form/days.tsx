import React, { useEffect, useState } from 'react';
import { ReducerProps } from '../modal';
import Button from '../../buttons/button';
import { Day } from '../../../../types/newGameDefinition';
import NumberInput from '../../form/NumberInput';

export function DaysTab({ state, dispatch }: ReducerProps) {
	const [currentEdit, setCurrentEdit] = useState<Day | null>(null);
	const setEdit = (day: Day) => {
		setCurrentEdit(day);
	};

	return (
		<section className="grow w-full gap-2 flex flex-col">
			{!currentEdit && (
				<DayTableView
					state={state}
					dispatch={dispatch}
					setEdit={setEdit}
				/>
			)}

			{currentEdit && (
				<EditDay
					state={state}
					dispatch={dispatch}
					day={currentEdit}
					setCurrentEdit={setCurrentEdit}
				/>
			)}
		</section>
	);
}

interface EditDayProps extends ReducerProps {
	day: Day;
	setCurrentEdit: (day: Day | null) => void;
}

function EditDay({ dispatch, day, setCurrentEdit }: EditDayProps) {
	const [dayNumber, setDayNumber] = useState(day.dayNumber);
	const [startPost, setStartPost] = useState(day.startPost);
	const [endPost, setEndPost] = useState(day.endPost);

	useEffect(() => {
		console.log(dayNumber, startPost, endPost);
	});

	return (
		<div className="flex flex-col gap-2">
			<NumberInput
				name="dayNumber"
				label="Day Number"
				defaultValue={day.dayNumber}
				onChange={(value) => setDayNumber(value)}
			/>
			<NumberInput
				name="startPost"
				label="Start Post Number"
				defaultValue={day.startPost}
				onChange={(value) => setStartPost(value)}
			/>
			<NumberInput
				name="endPost"
				label="End Post Number"
				defaultValue={day.endPost}
				onChange={(value) => setEndPost(value)}
			/>

			<br />

			<div className="flex flex-row justify-center gap-2">
				<Button
					label="Save"
					onClick={() => {
						dispatch({
							type: 'UPDATE_DAY',
							dayNumber: day.dayNumber,
							day: {
								dayNumber,
								startPost,
								endPost,
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
							type: 'REMOVE_DAY',
							dayNumber: day.dayNumber,
						});

						setCurrentEdit(null);
					}}
				/>
			</div>
		</div>
	);
}

interface DayTableViewProps extends ReducerProps {
	setEdit: (day: Day) => void;
}
function DayTableView({ state, dispatch, setEdit }: DayTableViewProps) {
	const columns = ['Day', 'Start Post #', 'End Post #'];
	const [newDay, setNewDay] = useState<number>(
		state.days.reduce((max, day) => Math.max(max, day.dayNumber), 0) + 1,
	);

	return (
		<>
			<div className="flex flex-row gap-2">
				<NumberInput
					label="Day #"
					name="dayNumber"
					withoutLabel={true}
					placeholder="New Day #"
					className="grow"
					defaultValue={newDay}
					onChange={(value) => setNewDay(value)}
				/>
				<Button
					label="Add Day"
					onClick={() => {
						dispatch({
							type: 'ADD_DAY',
							day: {
								dayNumber: newDay,
								startPost: undefined,
								endPost: undefined,
							},
						});
					}}
				/>
			</div>

			<DayTable
				data={state.days.map((day) => day)}
				columns={columns}
				editRow={(day) => {
					setEdit(day);
				}}
			/>
		</>
	);
}

interface TableProps {
	data: Day[];
	columns: string[];
	editRow?: (day: Day) => void;
}

export default function DayTable({ data, columns, editRow }: TableProps) {
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
							.sort((a, b) => b.dayNumber - a.dayNumber)
							.map((day, idx) => {
								console.log(day);

								const dayStartExists =
									day.startPost !== undefined &&
									day.startPost >= 0;
								const dayEndExists =
									day.endPost !== undefined &&
									day.endPost >= 0;

								return (
									<tr
										key={idx}
										className="hover:bg-primary-lightest transition-colors duration-200 hover:cursor-pointer"
										onClick={() => {
											if (editRow) editRow(day);
										}}
									>
										<td
											key={`${day.dayNumber}-dn`}
											className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"
										>
											{day.dayNumber}
										</td>
										<td
											key={`${day.dayNumber}-sp`}
											className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"
										>
											{!dayStartExists
												? 'Unset'
												: day.startPost}
										</td>
										<td
											key={`${day.dayNumber}-ep`}
											className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"
										>
											{!dayEndExists
												? 'Unset'
												: day.endPost}
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
