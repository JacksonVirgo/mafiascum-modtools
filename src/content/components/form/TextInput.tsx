import React from 'react';

interface TextInputProps {
	name: string;
	label: string;
	placeholder?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;

	className?: string;
	withoutLabel?: boolean;
}

export default function TextInput({
	name,
	label,
	placeholder,
	defaultValue,
	withoutLabel = false,
	className = '',
	onChange,
}: TextInputProps) {
	return (
		<div className={`flex flex-col ${className}`}>
			{!withoutLabel && (
				<label htmlFor={name} className="text-base">
					{label}
				</label>
			)}
			<input
				type="text"
				id={name}
				name={name}
				placeholder={placeholder}
				defaultValue={defaultValue}
				className="p-2 !bg-primary-lighter text-white rounded-sm border border-primary-lightest hover:!border-primary-lightest focus:!border-secondary-color focus:outline-none"
				onChange={(e) => {
					if (!onChange) return;
					onChange(e.target.value);
				}}
			/>
		</div>
	);
}
