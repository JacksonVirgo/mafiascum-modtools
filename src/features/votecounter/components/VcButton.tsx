import React from 'react';

interface VcButtonProps {
	onClick: () => void;
	label?: string;
}
export default ({ onClick, label = 'VC' }: VcButtonProps) => {
	return (
		<span>
			{' - '}
			<button onClick={onClick} className="text-white">
				{label}
			</button>
		</span>
	);
};
