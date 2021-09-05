import { AggregatedScore, AllAggregatedScores, HandProbabilities } from '../types';
import { maximumScore } from './constants';
import {
    createRelativeProbabilities,
    getScoreRelativeProbabilities,
    mergeRelativeProbabilities,
    weightRelativeProbabilities
} from './relative-probabilities';

export const createEmptyHandProbabilities = ({
    aggregatedScores
}: {
    aggregatedScores: AllAggregatedScores;
}): HandProbabilities => {
    return {
        equal: createRelativeProbabilities(aggregatedScores, () => 0),
        higher: createRelativeProbabilities(aggregatedScores, () => 0),
        lower: createRelativeProbabilities(aggregatedScores, () => 0),
        overMaximum: 0
    };
};

export const createHandProbabilities = ({
    aggregatedScores,
    handScore
}: {
    aggregatedScores: AllAggregatedScores;
    handScore: number;
}): HandProbabilities => {
    return {
        equal: createRelativeProbabilities(aggregatedScores, (aggregatedScore) =>
            handScore === aggregatedScore.score ? 1 : 0
        ),
        higher: createRelativeProbabilities(aggregatedScores, (aggregatedScore) =>
            handScore <= maximumScore && handScore > aggregatedScore.score ? 1 : 0
        ),
        lower: createRelativeProbabilities(aggregatedScores, (aggregatedScore) =>
            handScore < aggregatedScore.score ? 1 : 0
        ),
        overMaximum: handScore > maximumScore ? 1 : 0
    };
};

export const getEqualToScoreProbability = (
    handProbabilities: HandProbabilities,
    score: number | AggregatedScore
) => {
    return getScoreRelativeProbabilities(handProbabilities.equal, score);
};

export const getHigherThanScoreProbability = (
    handProbabilities: HandProbabilities,
    score: number | AggregatedScore
) => {
    return getScoreRelativeProbabilities(handProbabilities.higher, score);
};

export const getLowerThanScoreProbability = (
    handProbabilities: HandProbabilities,
    score: number | AggregatedScore
) => {
    return getScoreRelativeProbabilities(handProbabilities.lower, score);
};

export const mergeHandProbabilities = (
    a: HandProbabilities,
    b: HandProbabilities
): HandProbabilities => {
    return {
        equal: mergeRelativeProbabilities(a.equal, b.equal),
        higher: mergeRelativeProbabilities(a.higher, b.higher),
        lower: mergeRelativeProbabilities(a.lower, b.lower),
        overMaximum: a.overMaximum + b.overMaximum
    };
};

export const weightHandProbabilities = ({
    handProbabilities,
    weight
}: {
    handProbabilities: HandProbabilities;
    weight: number;
}): HandProbabilities => {
    return {
        equal: weightRelativeProbabilities(handProbabilities.equal, weight),
        higher: weightRelativeProbabilities(handProbabilities.higher, weight),
        lower: weightRelativeProbabilities(handProbabilities.lower, weight),
        overMaximum: handProbabilities.overMaximum * weight
    };
};
