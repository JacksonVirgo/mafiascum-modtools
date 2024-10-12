function normalizeString(str: string) {
	return str.toLowerCase().replace(/\s+/g, '');
}

export function compareStrings(first: string, second: string) {
	first = first.replace(/\s+/g, '');
	second = second.replace(/\s+/g, '');
	if (first === second) return 1; // identical or empty
	if (first.length < 2 || second.length < 2) return 0; // if either is a 0-letter or 1-letter string
	const firstBigrams = new Map();
	for (let i = 0; i < first.length - 1; i++) {
		const bigram = first.substring(i, i + 2);
		const count = firstBigrams.has(bigram)
			? firstBigrams.get(bigram) + 1
			: 1;
		firstBigrams.set(bigram, count);
	}
	let intersectionSize = 0;
	for (let i = 0; i < second.length - 1; i++) {
		const bigram = second.substring(i, i + 2);
		const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0;
		if (count > 0) {
			firstBigrams.set(bigram, count - 1);
			intersectionSize++;
		}
	}
	return (2.0 * intersectionSize) / (first.length + second.length - 2);
}

export type SimilarityRating = {
	rating: number;
	value: string;
};
export function findBestMatch(rawTarget: string, options: string[]) {
	if (options.length === 0) return null;
	const target = normalizeString(rawTarget);
	const ratings: SimilarityRating[] = options.map((v) => {
		const normalized = normalizeString(v);
		const rating = compareStrings(target, normalized);
		return {
			rating: rating,
			value: v,
		};
	});
	const bestMatch = ratings.reduce((a, b) => (a.rating > b.rating ? a : b));
	return { ratings: ratings, bestMatch: bestMatch };
}
