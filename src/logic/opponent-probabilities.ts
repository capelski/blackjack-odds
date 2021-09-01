import {
    Dictionary,
    AggregatedScore,
    RelativeProbabilities,
    OpponentProbabilities
} from '../types';

export const createOpponentProbabilities = (
    aggregatedScores: Dictionary<AggregatedScore>,
    opponentRelativeGetter: (score: number) => RelativeProbabilities
): OpponentProbabilities => {
    return Object.values(aggregatedScores).reduce<OpponentProbabilities>((reduced, next) => {
        const opponentRelative: RelativeProbabilities =
            reduced[next.score] || opponentRelativeGetter(next.score);
        return {
            ...reduced,
            [next.score]: opponentRelative
        };
    }, {});
};

export const mergeOpponentProbabilities = (
    a: OpponentProbabilities,
    b: OpponentProbabilities
): OpponentProbabilities => {
    return Object.keys(a).reduce<OpponentProbabilities>((reduced, nextKey) => {
        return {
            ...reduced,
            [nextKey]: {
                equal: a[nextKey].equal + b[nextKey].equal,
                higher: a[nextKey].higher + b[nextKey].higher,
                lower: a[nextKey].lower + b[nextKey].lower,
                score: a[nextKey].score
            }
        };
    }, {});
};
