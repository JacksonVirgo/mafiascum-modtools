import React, { useEffect, useState } from 'react';
import Checkbox from '../../components/form/Checkbox';
import { useInitial } from '../../lib/hooks/useInitial';
import browser from 'webextension-polyfill';

const DEBUG_TAG = 'setting_debug';

export async function saveUsingDebugMode(enabled: boolean) {
	try {
		await browser.storage.local.set({
			[DEBUG_TAG]: enabled ? 'on' : 'off',
		});
	} catch (err) {
		console.log(err);
	}
}

export async function fetchUsingDebugMode() {
	try {
		const setting = await browser.storage.local.get(DEBUG_TAG);
		if (!setting) return false;
		return setting[DEBUG_TAG] == 'on';
	} catch (err) {
		console.log(err);
		return null;
	}
}

export default function PopupEnableDebug() {
	const [enabled, setEnabled] = useState<boolean | null>(null);

	useInitial(async () => {
		const isUsingDebug = await fetchUsingDebugMode();
		setEnabled(isUsingDebug);
	});

	useEffect(() => {
		if (enabled == null) return;
		saveUsingDebugMode(enabled);
	}, [enabled]);

	return (
		<>
			{enabled == null && <div>...</div>}
			{enabled != null && (
				<Checkbox
					label="Use Debug Mode"
					name="debug_mode"
					onChange={setEnabled}
					checked={enabled}
				/>
			)}
		</>
	);
}
