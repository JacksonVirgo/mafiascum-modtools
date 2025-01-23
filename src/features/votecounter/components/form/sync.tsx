import React, { useState } from 'react';
import Button from '../../../../components/buttons/button';
import { FileInput } from '../../../../components/form/FileInput';
import { GameDefinition, isGameDefinition } from '../../types/gameDefinition';
import { useGameDefinition } from '../../context';
import NumberInput from '../../../../components/form/NumberInput';

export function SyncTab() {
	const [_state, dispatch] = useGameDefinition();

	const [postNumber, setPostNumber] = useState(0);

	return (
		<section className="grow w-full gap-2 flex flex-col">
			<div className="flex flex-col gap-2">
				<p className="px-4">
					When you set up a sync, assuming you have edit permissions,
					VC settings will be added to the selected post (unless it
					already exists). When you change settings, it will be
					reflected in that post. Whenever you refresh the page, you
					will sync the extension to the selected post.
				</p>

				<p>
					You can sync even as a player, you will fetch the latest
					settings but will not be able to change them.
				</p>

				<p className="px-4 text-red-500">
					If sync has been set up by someone else, you will lose all
					data for this thread and sync to what is there.
				</p>

				<NumberInput
					name="postnum"
					label="Post Number"
					defaultValue={0}
					onChange={(value) => setPostNumber(value)}
				/>

				<Button
					label="Sync Settings"
					onClick={() => {
						// 1. Check if settings already exists in the selected post
						// 2. If it does, sync to it.
						// 3. If it doesn't, attempt to create it
						// 4. If failed, show error message
						// 5. If successful, show a success message and prompt to refresh
						//
						// -------
						//
						// Don't do all this in this function, silly
						// Also why did I do inline comments here? Cuz I'm cool that's why
						//
						// -------
						//
						// Stretch Goals
						// - Option to remove syncing to a post
					}}
				/>
			</div>
		</section>
	);
}
