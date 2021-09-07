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
        canHit: true,
        equal: createRelativeProbabilities(aggregatedScores, () => 0),
        higher: createRelativeProbabilities(aggregatedScores, () => 0),
        lower: createRelativeProbabilities(aggregatedScores, () => 0),
        overMaximum: 0
    };
};

export const createHandProbabilities = ({
    allAggregatedScores,
    canHit,
    handScore
}: {
    allAggregatedScores: AllAggregatedScores;
    canHit: boolean;
    handScore: number;
}): HandProbabilities => {
    return {
        canHit,
        equal: createRelativeProbabilities(allAggregatedScores, (aggregatedScore) =>
            handScore === aggregatedScore.score ? 1 : 0
        ),
        higher: createRelativeProbabilities(allAggregatedScores, (aggregatedScore) =>
            handScore <= maximumScore && handScore > aggregatedScore.score ? 1 : 0
        ),
        lower: createRelativeProbabilities(allAggregatedScores, (aggregatedScore) =>
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
        canHit: true,
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
        canHit: handProbabilities.canHit,
        equal: weightRelativeProbabilities(handProbabilities.equal, weight),
        higher: weightRelativeProbabilities(handProbabilities.higher, weight),
        lower: weightRelativeProbabilities(handProbabilities.lower, weight),
        overMaximum: handProbabilities.overMaximum * weight
    };
};
