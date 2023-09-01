import $ from 'jquery';

$(function () {
	console.log('Mafia Engine has loaded.');
	console.log('This should only be called on forum.mafiascum.net');

	chrome.runtime.sendMessage({ action: 'getData' }, (response) => {
		if (chrome.runtime.lastError) return console.error(chrome.runtime.lastError);
		console.log('Background Script:', response.message);
	});
});
