import React from 'react';
import { ReducerProps } from '../form';

export function PlayersTab({
	state: _state,
	dispatch: _dispatch,
}: ReducerProps) {
	return (
		<section className="grow w-full gap-2 flex flex-col">
			<div>Players Tab</div>
		</section>
	);
}