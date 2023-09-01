export function getUrlParams(url: string) {
	const urlParams = new URLSearchParams(url);
	const params = new Map<string, string>();
	for (const [key, value] of urlParams) {
		params.set(key, value);
	}
	return params;
}
