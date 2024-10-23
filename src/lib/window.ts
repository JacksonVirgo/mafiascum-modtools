export enum InstanceType {
	Background = 'background',
	Popup = 'popup',
	Content = 'content',
}

export function getInstanceType() {
	if (isBackground()) return InstanceType.Background;
	return InstanceType.Content;
}

// Rough band-aid solution, should be removed in the future as popups
// are seen as a bg script in this instance
const isBackground = () => location.protocol === 'chrome-extension:';
