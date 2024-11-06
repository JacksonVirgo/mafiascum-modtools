import React from 'react';

interface VcButtonProps {
	onClick: () => void;
	label?: string;
}
export default ({ onClick, label = 'VC' }: VcButtonProps) => {
	return (
		<span>
			{' - '}
			<a onClick={onClick} className="hover:cursor-pointer">
				{label}
			</a>
		</span>
	);
};
