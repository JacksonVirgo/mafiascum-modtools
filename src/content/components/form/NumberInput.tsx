import React from 'react';

interface NumberInputProps {
	name: string;
	label: string;
	placeholder?: string;
	defaultValue?: number;
	onChange?: (value: number) => void;
}
export default function NumberInput({
	name,
	label,
	placeholder,
	defaultValue,
	onChange,
}: NumberInputProps) {
	return (
		<div className="flex flex-col">
			<label htmlFor={name} className="text-base">
				{label}
			</label>
			<input
				type="number"
				id={name}
				name={name}
				placeholder={placeholder}
				defaultValue={defaultValue}
				onChange={(e) => {
					if (!onChange) return;
					const value = Number(e.target.value);
					if (Number.isNaN(value)) return;
					onChange(value);
				}}
			/>
		</div>
	);
}
