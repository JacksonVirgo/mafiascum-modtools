import { StringSimilarityCompareFunc } from '../stringCorrection';

function normalizeString(str: string) {
	return str.toLowerCase().replace(/\s+/g, '');
}

export function trigramSimilarity(a: string, b: string) {
	const generateTrigrams = (str: string): Set<string> => {
		const trigrams = new Set<string>();
		for (let i = 0; i < str.length - 2; i++) {
			trigrams.add(str.slice(i, i + 3));
		}
		return trigrams;
	};

	const trigrams1 = generateTrigrams(normalizeString(a));
	const trigrams2 = generateTrigrams(normalizeString(b));

	const intersection = new Set(
		[...trigrams1].filter((trigram) => trigrams2.has(trigram)),
	);
	const similarity =
		intersection.size / Math.max(trigrams1.size, trigrams2.size);

	return similarity;
}

export type TrigramRating = {
	rating: number;
	value: string;
};
export function trigramsFindBestMatch(rawTarget: string, options: string[]) {
	if (options.length === 0) return null;
	const target = normalizeString(rawTarget);
	const ratings: TrigramRating[] = options.map((v) => {
		const normalized = normalizeString(v);
		const rating = trigramSimilarity(target, normalized);
		return {
			rating: rating,
			value: v,
		};
	});
	const bestMatch = ratings.reduce((a, b) => (a.rating > b.rating ? a : b));
	return { ratings: ratings, bestMatch: bestMatch };
}
