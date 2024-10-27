import React from 'react';
import { createRoot } from 'react-dom/client';
import '../main.css';

import QuoteHighlighting from '../../features/quoteHighlighting/mountPopup';
import PopupEnableDebug from './debug';

const MainPage = () => {
	return (
		<div className="w-96 h-96 bg-primary-color flex flex-col justify-center items-center text-white p-4">
			<div className="grow bg-primary-lighter flex flex-col justify-start items-start rounded-md self-stretch p-4 pt-2">
				<h1 className="text-white text-2xl underline font-extrabold pb-2">
					Config
				</h1>
				<div className="flex flex-col justify-start">
					<QuoteHighlighting />
					<PopupEnableDebug />
				</div>
			</div>
		</div>
	);
};

const container = document.createElement('div');
container.classList.add('popup-reset');
document.body.classList.add('popup-reset', 'popup');
document.body.appendChild(container);
const root = createRoot(container);
root.render(<MainPage />);
