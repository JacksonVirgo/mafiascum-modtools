import React from 'react';
import Button from '../../../../components/buttons/button';
import { useGameDefinition } from '../../context';

export function ExportTab() {
	const [state] = useGameDefinition();

	const exportGameDefinition = () => {
		const gameDefinition = JSON.stringify(state);
		const blob = new Blob([gameDefinition], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'gameDefinition.json';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	return (
		<section className="grow w-full gap-2 flex flex-col">
			<Button
				label="Export Game Definition"
				onClick={() => {
					exportGameDefinition();
				}}
			/>
		</section>
	);
}
