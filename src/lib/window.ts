import browser from 'webextension-polyfill';

export enum InstanceType {
	Background,
	Popup,
	Content,
}

export function getInstanceType() {
	if (typeof browser !== 'undefined' && browser.runtime) {
		return InstanceType.Content;
	} else if (typeof window !== 'undefined' && window.top) {
		return InstanceType.Popup;
	} else {
		return InstanceType.Background;
	}
}
