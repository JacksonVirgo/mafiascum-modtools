import diceCoefficient from './stringSimilarity/dice';
import trigramSimilarity from './stringSimilarity/trigrams';

export type StringSimilarityCompareFunc = (
	first: string,
	second: string,
) => number;
export type BestMatchResult = {
	ratings: [string, number][];
	bestMatch: [string, number];
};
export interface StringSimilarity {
	compare: StringSimilarityCompareFunc;
	bestMatch: (value: string, targets: string[]) => BestMatchResult;
}

export enum StringSimilarityAlgs {
	DiceCoefficient = 'dice_coefficient',
	Trigrams = 'trigrams',
}

export const stringSimilarityAlgs: Record<
	StringSimilarityAlgs,
	StringSimilarity
> = {
	dice_coefficient: {
		compare: diceCoefficient,
		bestMatch(value, targets) {
			const ratings: [string, number][] = [];
			let bestMatchIndex = 0;
			for (let i = 0; i < targets.length; i++) {
				const currentTargetString = targets[i];
				const currentRating = diceCoefficient(
					value,
					currentTargetString,
				);
				ratings.push([currentTargetString, currentRating]);
				if (currentRating > ratings[bestMatchIndex][1]) {
					bestMatchIndex = i;
				}
			}
			const bestMatch = ratings[bestMatchIndex];
			return { ratings: ratings, bestMatch: bestMatch };
		},
	},
	trigrams: {
		compare: trigramSimilarity,
		bestMatch(value, targets) {
			const ratings: [string, number][] = [];
			let bestMatchIndex = 0;
			for (let i = 0; i < targets.length; i++) {
				const currentTargetString = targets[i];
				const currentRating = trigramSimilarity(
					value,
					currentTargetString,
				);
				ratings.push([currentTargetString, currentRating]);
				if (currentRating > ratings[bestMatchIndex][1]) {
					bestMatchIndex = i;
				}
			}
			const bestMatch = ratings[bestMatchIndex];
			return { ratings: ratings, bestMatch: bestMatch };
		},
	},
};
