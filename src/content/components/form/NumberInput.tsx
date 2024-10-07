import React from 'react';

interface NumberInputProps {
	name: string;
	label: string;
	placeholder?: string;
}
export default function NumberInput({
	name,
	label,
	placeholder,
}: NumberInputProps) {
	return (
		<div>
			<label htmlFor={name}>{label}</label>
			<input
				type="number"
				id={name}
				name={name}
				placeholder={placeholder}
			/>
		</div>
	);
}
