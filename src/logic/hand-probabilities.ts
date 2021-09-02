import { AllAggregatedScores, Hand, HandProbabilities } from '../types';
import { maximumScore } from './constants';
import { isHandBelowStandingScore } from './hand';
import { createRelativeProbabilities, mergeRelativeProbabilities } from './relative-probabilities';

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
    standingScore: number | undefined;
}): HandProbabilities => {
    const nextCardWeight = followingHand.lastCard.weight / outcomesWeight;
    const isBelowStandingScore = isHandBelowStandingScore(followingHand, standingScore);

    return {
        equal: createRelativeProbabilities(
            aggregatedScores,
            (score) =>
                nextCardWeight! *
                (isBelowStandingScore
                    ? followingHandProbabilities.equal[score]
                    : followingHand.score === score
                    ? 1
                    : 0)
        ),
        higher: createRelativeProbabilities(
            aggregatedScores,
            (score) =>
                nextCardWeight! *
                (isBelowStandingScore
                    ? followingHandProbabilities.higher[score]
                    : followingHand.score <= maximumScore && followingHand.score > score
                    ? 1
                    : 0)
        ),
        lower: createRelativeProbabilities(
            aggregatedScores,
            (score) =>
                nextCardWeight! *
                (isBelowStandingScore
                    ? followingHandProbabilities.lower[score]
                    : followingHand.score < score
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
