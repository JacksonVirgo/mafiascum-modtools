import React from 'react';

interface VcButtonProps {
    onClick: () => void
}
export default ({onClick}: VcButtonProps) => {
	return (
		<span>
			{' - '}
			<button onClick={onClick} className="text-white">
				VC
			</button>
		</span>
	);
};
