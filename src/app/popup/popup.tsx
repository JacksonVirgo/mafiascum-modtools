import React from 'react';
import { createRoot } from 'react-dom/client';
import '../main.css';

const MainPage = () => {
	return (
		<div className="w-96 h-96 bg-slate-700 flex flex-col justify-start items-start p-5 text-white">
			<h1 className="text-white text-2xl underline font-extrabold pb-3">
				Config
			</h1>
			<div className="flex flex-row justify-start">
				<span>No Options</span>
			</div>
		</div>
	);
};

const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
root.render(<MainPage />);
