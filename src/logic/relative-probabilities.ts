import { AllAggregatedScores, RelativeProbabilities } from '../types';

export const createRelativeProbabilities = (
    aggregatedScores: AllAggregatedScores,
    probabilityGetter: (score: number) => number
): RelativeProbabilities => {
    return Object.values(aggregatedScores).reduce<RelativeProbabilities>((reduced, next) => {
        return {
            ...reduced,
            [next.scores]: probabilityGetter(next.score)
        };
    }, {});
};

export const mergeRelativeProbabilities = (
    a: RelativeProbabilities,
    b: RelativeProbabilities
): RelativeProbabilities => {
    return Object.keys(a).reduce<RelativeProbabilities>((reduced, nextKey) => {
        return {
            ...reduced,
            [nextKey]: a[nextKey] + b[nextKey]
        };
    }, {});
};
