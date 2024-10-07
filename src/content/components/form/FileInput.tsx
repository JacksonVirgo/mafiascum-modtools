import React from 'react';

interface FileInputProps {
	name: string;
	label: string;
	accept: string;
}
export function FileInput({ name, label, accept }: FileInputProps) {
	return (
		<div>
			<label htmlFor={name}>{label}</label>
			<input type="file" id={name} name={name} accept={accept} />
		</div>
	);
}
