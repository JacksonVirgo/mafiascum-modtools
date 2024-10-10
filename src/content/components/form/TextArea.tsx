import React from 'react';

interface TextAreaProps {
	name: string;
	label: string;
	placeholder?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;

	className?: string;
	withoutLabel?: boolean;
}

export default function TextArea({
	name,
	label,
	placeholder,
	defaultValue,
	withoutLabel = false,
	className = '',
	onChange,
}: TextAreaProps) {
	return (
		<div className={`flex flex-col box-border p-0 m-0 ${className}`}>
			{!withoutLabel && (
				<label htmlFor={name} className="text-base w-full">
					{label}
				</label>
			)}
			<textarea
				id={name}
				name={name}
				placeholder={placeholder}
				defaultValue={defaultValue}
				className="p-2 grow w-4/5 max-w-4/5 !bg-primary-lighter text-white rounded-sm border border-primary-lightest hover:!border-primary-lightest focus:!border-secondary-color focus:outline-none resize-none"
				onChange={(e) => {
					if (!onChange) return;
					onChange(e.target.value);
				}}
			></textarea>
		</div>
	);
}
