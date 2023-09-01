import $ from 'jquery';
import browser from 'webextension-polyfill';

$(function () {
	console.log('Mafia Engine has loaded.');
	console.log('This should only be called on forum.mafiascum.net');

	browser.runtime
		.sendMessage({ action: 'getData' })
		.then((response) => {
			if (chrome.runtime.lastError) return console.error(chrome.runtime.lastError);
			console.log('Background Script:', response.message);
		})
		.catch((error) => {
			console.error(error);
		});
});
