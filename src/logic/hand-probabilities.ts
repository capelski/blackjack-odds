import { AggregatedScore, Dictionary, Hand, HandProbabilities } from '../types';
import { maximumScore } from './constants';
import { getHandScores } from './hand';
import { createRelativeProbabilities, mergeRelativeProbabilities } from './relative-probabilities';

const createEmptyHandProbabilities = ({
    aggregatedScores
}: {
    aggregatedScores: Dictionary<AggregatedScore>;
}): HandProbabilities => {
    return {
        equal: createRelativeProbabilities(aggregatedScores, () => 0),
        higher: createRelativeProbabilities(aggregatedScores, () => 0),
        lower: createRelativeProbabilities(aggregatedScores, () => 0),
        overMaximum: 0
    };
};

const createPartialHandProbabilities = ({
    aggregatedScores,
    followingHand,
    handsProbabilities,
    outcomesWeight,
    standingScore
}: {
    aggregatedScores: Dictionary<AggregatedScore>;
    followingHand: Hand;
    handsProbabilities: Dictionary<HandProbabilities>;
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
                    ? handsProbabilities[getHandScores(followingHand)].equal[score]
                    : followingHand.score === score
                    ? 1
                    : 0)
        ),
        higher: createRelativeProbabilities(
            aggregatedScores,
            (score) =>
                nextCardWeight! *
                (isBelowStandingScore
                    ? handsProbabilities[getHandScores(followingHand)].higher[score]
                    : followingHand.score <= maximumScore && followingHand.score > score
                    ? 1
                    : 0)
        ),
        lower: createRelativeProbabilities(
            aggregatedScores,
            (score) =>
                nextCardWeight! *
                (isBelowStandingScore
                    ? handsProbabilities[getHandScores(followingHand)].lower[score]
                    : followingHand.score < score
                    ? 1
                    : 0)
        ),
        overMaximum:
            nextCardWeight! *
            (isBelowStandingScore
                ? handsProbabilities[getHandScores(followingHand)].overMaximum
                : followingHand.score > maximumScore
                ? 1
                : 0)
    };
};

export const getHandsProbabilities = (
    aggregatedScores: Dictionary<AggregatedScore>,
    hands: Dictionary<Hand>,
    outcomesWeight: number,
    standingScore: number | undefined
): Dictionary<HandProbabilities> => {
    const handsProbabilities: Dictionary<HandProbabilities> = {};

    Object.values(hands).forEach((hand) => {
        setHandProbabilities(
            aggregatedScores,
            hand,
            handsProbabilities,
            outcomesWeight,
            standingScore
        );
    });

    return handsProbabilities;
};

const isHandBelowStandingScore = (hand: Hand, standingScore: number | undefined) => {
    return standingScore !== undefined && hand.score < standingScore;
};

const mergeHandProbabilities = (a: HandProbabilities, b: HandProbabilities): HandProbabilities => {
    return {
        equal: mergeRelativeProbabilities(a.equal, b.equal),
        higher: mergeRelativeProbabilities(a.higher, b.higher),
        lower: mergeRelativeProbabilities(a.lower, b.lower),
        overMaximum: a.overMaximum + b.overMaximum
    };
};

const setHandProbabilities = (
    aggregatedScores: Dictionary<AggregatedScore>,
    hand: Hand,
    handsProbabilities: Dictionary<HandProbabilities>,
    outcomesWeight: number,
    standingScore: number | undefined
) => {
    if (handsProbabilities[getHandScores(hand)] === undefined) {
        hand.followingHands
            .filter((followingHand) => isHandBelowStandingScore(followingHand, standingScore))
            .forEach((followingHand) => {
                setHandProbabilities(
                    aggregatedScores,
                    followingHand,
                    handsProbabilities,
                    outcomesWeight,
                    standingScore
                );
            });

        const followingHandsProbabilities = hand.followingHands.map((followingHand) => {
            return createPartialHandProbabilities({
                aggregatedScores,
                followingHand,
                handsProbabilities,
                outcomesWeight,
                standingScore
            });
        });

        const handProbabilities = followingHandsProbabilities.reduce<HandProbabilities>(
            (reduced, next) => {
                return mergeHandProbabilities(reduced, next);
            },
            createEmptyHandProbabilities({
                aggregatedScores
            })
        );

        handsProbabilities[getHandScores(hand)] = handProbabilities;
    }
};
