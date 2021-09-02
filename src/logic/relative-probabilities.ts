import { AggregatedScore, AllAggregatedScores, RelativeProbabilities } from '../types';

export const createRelativeProbabilities = (
    aggregatedScores: AllAggregatedScores,
    probabilityGetter: (aggregatedScore: AggregatedScore) => number
): RelativeProbabilities => {
    return Object.values(aggregatedScores).reduce<RelativeProbabilities>((reduced, next) => {
        return {
            ...reduced,
            [next.scores]: probabilityGetter(next)
        };
    }, {});
};

export const getScoreRelativeProbabilities = (
    relativeProbabilities: RelativeProbabilities,
    score: number | AggregatedScore
) => {
    return relativeProbabilities[typeof score === 'number' ? String(score) : score.scores];
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
