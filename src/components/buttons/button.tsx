import React from 'react';

interface ButtonProps {
	label: string;
	onClick?: () => void;
}

export default function Button({ label, onClick }: ButtonProps) {
	const onClickEvent = () => {
		if (onClick) onClick();
	};

	return (
		<button
			className="bg-primary-lighter hover:bg-primary-color hover:border border-white text-white font-semibold py-2 px-4 rounded"
			onClick={onClickEvent}
		>
			{label}
		</button>
	);
}
