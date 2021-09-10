import { AggregatedScore, AllAggregatedScores, HandProbabilities } from '../types';
import {
    createRelativeProbabilities,
    getScoreRelativeProbabilities,
    mergeRelativeProbabilities,
    weightRelativeProbabilities
} from './relative-probabilities';
import { isBustScore } from './utils';

export const createEmptyHandProbabilities = ({
    aggregatedScores
}: {
    aggregatedScores: AllAggregatedScores;
}): HandProbabilities => {
    return {
        equal: createRelativeProbabilities(aggregatedScores, () => 0),
        higher: createRelativeProbabilities(aggregatedScores, () => 0),
        isHittingBelowMaximumRisk: true,
        lower: createRelativeProbabilities(aggregatedScores, () => 0),
        overMaximum: 0
    };
};

export const createHandProbabilities = ({
    allAggregatedScores,
    handScore,
    isHittingBelowMaximumRisk
}: {
    allAggregatedScores: AllAggregatedScores;
    handScore: number;
    isHittingBelowMaximumRisk: boolean;
}): HandProbabilities => {
    return {
        equal: createRelativeProbabilities(allAggregatedScores, (aggregatedScore) =>
            handScore === aggregatedScore.score ? 1 : 0
        ),
        higher: createRelativeProbabilities(allAggregatedScores, (aggregatedScore) =>
            !isBustScore(handScore) && handScore > aggregatedScore.score ? 1 : 0
        ),
        isHittingBelowMaximumRisk,
        lower: createRelativeProbabilities(allAggregatedScores, (aggregatedScore) =>
            handScore < aggregatedScore.score ? 1 : 0
        ),
        overMaximum: isBustScore(handScore) ? 1 : 0
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

export const getScoreHittingLoss = (
    score: number | AggregatedScore,
    playerScoreProbabilities: HandProbabilities
) => {
    return (
        playerScoreProbabilities.overMaximum +
        getLowerThanScoreProbability(playerScoreProbabilities, score)
    );
};

export const getScoreStandingLoss = (
    score: number | AggregatedScore,
    dealerCardProbabilities: HandProbabilities
) => {
    return getHigherThanScoreProbability(dealerCardProbabilities, score);
};

export const mergeHandProbabilities = (
    a: HandProbabilities,
    b: HandProbabilities
): HandProbabilities => {
    return {
        equal: mergeRelativeProbabilities(a.equal, b.equal),
        higher: mergeRelativeProbabilities(a.higher, b.higher),
        isHittingBelowMaximumRisk: true,
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
        isHittingBelowMaximumRisk: handProbabilities.isHittingBelowMaximumRisk,
        lower: weightRelativeProbabilities(handProbabilities.lower, weight),
        overMaximum: handProbabilities.overMaximum * weight
    };
};
