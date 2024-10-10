import React from 'react';
import { ReducerProps } from '../form';
import Button from '../../buttons/button';
import { Day } from '../../../../types/newGameDefinition';

export function DaysTab({ state, dispatch }: ReducerProps) {
	const columns = ['Day', 'Start Post #', 'End Post #'];
	return (
		<section className="grow w-full gap-2 flex flex-col">
			<Button
				label="Add Day"
				onClick={() => {
					dispatch({
						type: 'ADD_DAY',
						day: {
							dayNumber:
								state.days.reduce(
									(max, day) => Math.max(max, day.dayNumber),
									0,
								) + 1,
							startPost: -1,
							endPost: -1,
						},
					});
				}}
			/>
			<DayTable
				data={state.days.map((day) => day)}
				columns={columns}
				editRow={(day) => {
					console.log('Editing', day);
				}}
			/>
		</section>
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
							.map((day, idx) => (
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
										{day.startPost}
									</td>
									<td
										key={`${day.dayNumber}-ep`}
										className="px-4 py-2 whitespace-nowrap text-sm text-gray-300"
									>
										{day.endPost}
									</td>
								</tr>
							))
					)}
				</tbody>
			</table>
		</div>
	);
}
