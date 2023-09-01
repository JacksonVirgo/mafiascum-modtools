import $ from 'jquery';
import browser from 'webextension-polyfill';

export function getUrlParams() {
	const urlParams = new URLSearchParams(window.location.search);
	const params = new Map<string, string>();
	for (const [key, value] of urlParams) {
		params.set(key, value);
	}
	return params;
}

$(function () {
	console.log('Mafia Engine has loaded.');
	console.log('This should only be called on forum.mafiascum.net');

	const urlParams = getUrlParams();
	console.log(urlParams);

	if (urlParams.has('t') || urlParams.has('p')) {
		let url = `https://forum.mafiascum.net/viewtopic.php?`; //t=${urlParams.get('t')}&p=${urlParams.get('p')}`
		if (urlParams.has('t')) url += `t=${urlParams.get('t')}`;
		if (urlParams.has('p')) url += `p=${urlParams.get('p')}`;

		browser.runtime
			.sendMessage({ action: 'getPageData', url: url })
			.then((response) => {
				if (browser.runtime.lastError) return console.error(browser.runtime.lastError);
				console.log('Background Script:', response);
			})
			.catch((error) => {
				console.error(error);
			});
	}
});
