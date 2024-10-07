import { StringSimilarityCompareFunc } from '../stringCorrection';

const trigramSimilarity: StringSimilarityCompareFunc = (
	first,
	second,
): number => {
	const normalize = (str: string): string => {
		return str.toLowerCase().replace(/\s+/g, '');
	};

	const generateTrigrams = (str: string): Set<string> => {
		const trigrams = new Set<string>();
		for (let i = 0; i < str.length - 2; i++) {
			trigrams.add(str.slice(i, i + 3));
		}
		return trigrams;
	};

	const trigrams1 = generateTrigrams(normalize(first));
	const trigrams2 = generateTrigrams(normalize(second));

	const intersection = new Set(
		[...trigrams1].filter((trigram) => trigrams2.has(trigram)),
	);
	const similarity =
		intersection.size / Math.max(trigrams1.size, trigrams2.size);

	return similarity;
};

export default trigramSimilarity;
