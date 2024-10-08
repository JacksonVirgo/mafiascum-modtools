import React, { useEffect, useReducer, useState } from 'react';
import { z } from 'zod';
import { isGameDefinition } from '../../../types/gameDefinition';
import { convertYamlToJson } from '../../../utils/file';
import { startVoteCount, formatVoteCountData } from '../../votecount';
import Button from '../buttons/button';
import { FileInput } from '../form/FileInput';
import NumberInput from '../form/NumberInput';
import { modalManager } from './modal';
import { initialFormState, vcFormReducer } from './formReducer';

interface ModalFormProps {
	onResponse: (res: string) => void;
}

export const ModalForm = ({ onResponse }: ModalFormProps) => {
	const [yamlStr, setYamlStr] = useState<string | undefined>();
	const [startNumber, setStartNumber] = useState<number | undefined>();
	const [endNumber, setEndNumber] = useState<number | undefined>();

	const [state, _dispatch] = useReducer(vcFormReducer, initialFormState);

	useEffect(() => {
		// Save form state to api.storage
	}, [state]);

	const onSubmit = async () => {
		if (!yamlStr) return;

		try {
			const json = convertYamlToJson(yamlStr);
			if (!isGameDefinition(json))
				return console.error('Invalid game definition.');

			json.startAt = startNumber
				? startNumber
				: json.startAt ?? json.startFrom ?? 0;
			json.endAt = endNumber ? endNumber : json.endAt ?? undefined;

			modalManager.setLoading();

			const vc = await startVoteCount(json);
			console.log('Calculated Votes', vc);
			if (!vc) return console.error('Failed to calculate votes');
			const format = formatVoteCountData(vc);

			modalManager.setResponse(format);

			if (format) onResponse(format);
			else console.error('Set response to show it failed');
		} catch (err) {
			if (err instanceof z.ZodError)
				console.error('Validation errors: ', err);
			else console.error('An unexpected error occurred: ', err);
		}
	};
	return (
		<form
			className="border-2 border-white grow w-full flex flex-row"
			onSubmit={(e) => e.preventDefault()}
		>
			<nav className="bg-primary-lighter p-4 rounded-sm">
				<ul className="list-none">
					<li className="focused" data-section="general">
						General
					</li>
				</ul>
			</nav>

			<div className="flex flex-col gap-0 grow justify-center p-4">
				<section
					data-section="general"
					className="focused grow w-full gap-2 flex flex-col"
				>
					<FileInput
						name="me_game_def"
						label="Import Definition File:"
						accept=".yaml,.yml"
						onChange={(val) => {
							console.log('Changed', val);
							setYamlStr(val);
						}}
					/>

					<NumberInput
						name="me_start"
						label="Start from Post #"
						placeholder="Default = 0"
						onChange={setStartNumber}
					/>

					<NumberInput
						name="me_end"
						label="End at Post #"
						placeholder="Default = none"
						onChange={setEndNumber}
					/>
				</section>

				<div className="shrink flex flex-row items-center justify-center">
					<Button label="Generate Votecount" onClick={onSubmit} />
				</div>
			</div>
		</form>
	);
};
