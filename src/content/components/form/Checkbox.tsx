import React from 'react';

interface CheckboxProps {
	name: string;
	label: string;
	checked?: boolean;
	onChange?: (checked: boolean) => void;
	className?: string;

	withoutLabel?: boolean;
}

export default function Checkbox({
	name,
	label,
	checked = false,
	className = '',
	onChange,
	withoutLabel = false,
}: CheckboxProps) {
	return (
		<div className={`flex items-center ${className}`}>
			<input
				type="checkbox"
				id={name}
				name={name}
				checked={checked}
				className="mr-2"
				onChange={(e) => {
					if (!onChange) return;
					onChange(e.target.checked);
				}}
			/>

			{!withoutLabel && (
				<label htmlFor={name} className="text-base">
					{label}
				</label>
			)}
		</div>
	);
}
