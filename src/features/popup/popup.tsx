import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import browser from 'webextension-polyfill';

import './popup.css';

const storage = browser.storage.sync || browser.storage.local;
const HIGHLIGHT = 'highlightQuotes';

const MainPage = () => {
	const [isHighlight, setHighlight] = useState<boolean | null>(null);

	useEffect(() => {
		getHighlight();
	}, []);

	const getHighlight = async () => {
		try {
			const { highlightQuotes } = await storage.get(HIGHLIGHT);
			if (typeof highlightQuotes !== 'string') {
				console.log(typeof highlightQuotes, highlightQuotes);
				setHighlight(false);
				return;
			}
			setHighlight(highlightQuotes === 'on');
		} catch (error) {
			console.error('Error fetching highlightQuotes:', error);
		}
	};

	const updateHighlight = async (newValue: boolean) => {
		try {
			setHighlight(newValue);
			await storage.set({ [HIGHLIGHT]: newValue ? 'on' : 'off' });
		} catch (error) {
			console.error('Error updating highlightQuotes:', error);
		}
	};

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const isChecked = e.target.checked;
		updateHighlight(isChecked);
	};

	if (isHighlight === null) return <div>Loading...</div>;

	return (
		<div className="w-96 h-96 bg-slate-700 flex flex-col justify-start items-start p-5 text-white">
			<h1 className="text-white text-2xl underline font-extrabold pb-3">
				Config
			</h1>
			<div className="flex flex-row justify-start">
				<input
					type="checkbox"
					id="highlight"
					name="highlight"
					checked={isHighlight}
					onChange={handleCheckboxChange}
				/>
				<label htmlFor="highlight">Highlight Quotes</label>
			</div>

			<div>{isHighlight}</div>
		</div>
	);
};

const container = document.createElement('div');
document.body.appendChild(container);
const root = createRoot(container);
root.render(<MainPage />);
