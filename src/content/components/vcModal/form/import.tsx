import React, { useState } from 'react';
import { ReducerProps } from '../modal';
import Button from '../../buttons/button';
import { FileInput } from '../../form/FileInput';
import {
	GameDefinition,
	isGameDefinition,
} from '../../../../types/newGameDefinition';

export function ImportTab({ dispatch }: ReducerProps) {
	const [uploadedFile, setUploadedFile] = useState<GameDefinition | null>(
		null,
	);
	return (
		<section className="grow w-full gap-2 flex flex-col">
			<FileInput
				name="upload"
				label="Upload Game Definition"
				accept=".json"
				onChange={(fileData) => {
					if (!fileData) return;
					try {
						const json = JSON.parse(fileData);
						if (!json) return;
						if (!isGameDefinition(json)) return;
						setUploadedFile(json);
					} catch (err) {
						console.log(err);
					}
				}}
			/>

			<div className="flex flex-col gap-2">
				<Button
					label="Save Uploaded File"
					onClick={() => {
						if (!uploadedFile) return;
						dispatch({
							type: 'SET_FULL_GAME_DEF',
							gameDef: uploadedFile,
						});
					}}
				/>
			</div>
		</section>
	);
}
