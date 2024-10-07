import React from 'react';

interface FileInputProps {
	name: string;
	label: string;
	accept: string;
	onChange?: (value: string | undefined) => void;
}
export function FileInput({ name, label, accept, onChange }: FileInputProps) {
	return (
		<div>
			<label htmlFor={name}>{label}</label>
			<input
				type="file"
				id={name}
				name={name}
				accept={accept}
				onChange={(e) => {
					if (!onChange) return;
					if (!e.target.files) return;
					const file = e.target.files[0];
					if (!file) return;
					const reader = new FileReader();
					let response: string | undefined;
					reader.onloadend = () => {
						if (!reader.result) return;
						response = reader.result.toString();
					};
					reader.readAsText(file);
					onChange(response);
				}}
			/>
		</div>
	);
}
