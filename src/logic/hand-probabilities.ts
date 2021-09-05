import { AggregatedScore, AllAggregatedScores, Hand, HandProbabilities } from '../types';
import { maximumScore } from './constants';
import { isHandBelowStandingScore } from './hand';
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

export const createPartialHandProbabilities = ({
    aggregatedScores,
    followingHand,
    followingHandProbabilities,
    outcomesWeight,
    standingScore
}: {
    aggregatedScores: AllAggregatedScores;
    followingHand: Hand;
    followingHandProbabilities: HandProbabilities;
    outcomesWeight: number;
    standingScore: number;
}): HandProbabilities => {
    const nextCardWeight = followingHand.lastCard.weight / outcomesWeight;
    const isBelowStandingScore = isHandBelowStandingScore(followingHand, standingScore);

    return {
        equal: createRelativeProbabilities(
            aggregatedScores,
            (aggregatedScore) =>
                nextCardWeight! *
                (isBelowStandingScore
                    ? getEqualToScoreProbability(followingHandProbabilities, aggregatedScore)
                    : followingHand.score === aggregatedScore.score
                    ? 1
                    : 0)
        ),
        higher: createRelativeProbabilities(
            aggregatedScores,
            (aggregatedScore) =>
                nextCardWeight! *
                (isBelowStandingScore
                    ? getHigherThanScoreProbability(followingHandProbabilities, aggregatedScore)
                    : followingHand.score <= maximumScore &&
                      followingHand.score > aggregatedScore.score
                    ? 1
                    : 0)
        ),
        lower: createRelativeProbabilities(
            aggregatedScores,
            (aggregatedScore) =>
                nextCardWeight! *
                (isBelowStandingScore
                    ? getLowerThanScoreProbability(followingHandProbabilities, aggregatedScore)
                    : followingHand.score < aggregatedScore.score
                    ? 1
                    : 0)
        ),
        overMaximum:
            nextCardWeight! *
            (isBelowStandingScore
                ? followingHandProbabilities.overMaximum
                : followingHand.score > maximumScore
                ? 1
                : 0)
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
