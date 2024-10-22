import React from 'react';

interface NumberInputProps {
	name: string;
	label: string;
	placeholder?: string;
	defaultValue?: number;
	onChange?: (value: number) => void;

	className?: string;
	withoutLabel?: boolean;
}
export default function NumberInput({
	name,
	label,
	placeholder,
	defaultValue,
	onChange,

	className,
	withoutLabel = false,
}: NumberInputProps) {
	return (
		<div className={`flex flex-col ${className}`}>
			{!withoutLabel && (
				<label htmlFor={name} className="text-base">
					{label}
				</label>
			)}
			<input
				type="number"
				id={name}
				name={name}
				placeholder={placeholder}
				defaultValue={defaultValue}
				className="p-2 !bg-primary-lighter text-white rounded-sm border border-primary-lightest hover:!border-primary-lightest focus:!border-secondary-color focus:outline-none"
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
