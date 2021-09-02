import { Dictionary, AggregatedScore, RelativeProbabilities } from '../types';

export const createRelativeProbabilities = (
    aggregatedScores: Dictionary<AggregatedScore>,
    opponentRelativeGetter: (score: number) => number
): RelativeProbabilities => {
    return Object.values(aggregatedScores).reduce<RelativeProbabilities>((reduced, next) => {
        return {
            ...reduced,
            [next.scores]: opponentRelativeGetter(next.score)
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
