import { AggregatedScore, Dictionary, Hand, HandProbabilities } from '../types';
import { maximumScore } from './constants';
import { getHandScores } from './hand';
import { createRelativeProbabilities, mergeRelativeProbabilities } from './relative-probabilities';

const createHandProbabilities = ({
    aggregatedScores,
    hand,
    outcomesWeight
}: {
    aggregatedScores: Dictionary<AggregatedScore>;
    hand: Hand | undefined;
    outcomesWeight: number;
}): HandProbabilities => {
    return {
        equal: createRelativeProbabilities(aggregatedScores, (score) =>
            hand === undefined
                ? 0
                : hand.score === score
                ? hand.lastCard.weight / outcomesWeight
                : 0
        ),
        higher: createRelativeProbabilities(aggregatedScores, (score) =>
            hand === undefined
                ? 0
                : hand.score <= maximumScore && hand.score > score
                ? hand.lastCard.weight / outcomesWeight
                : 0
        ),
        lower: createRelativeProbabilities(aggregatedScores, (score) =>
            hand === undefined ? 0 : hand.score < score ? hand.lastCard.weight / outcomesWeight : 0
        ),
        overMaximum:
            hand === undefined
                ? 0
                : hand.score > maximumScore
                ? hand.lastCard.weight / outcomesWeight
                : 0
    };
};

export const getHandsNextCardProbabilities = (
    aggregatedScores: Dictionary<AggregatedScore>,
    hands: Dictionary<Hand>,
    outcomesWeight: number
): Dictionary<HandProbabilities> => {
    const handsProbabilities: Dictionary<HandProbabilities> = {};

    Object.values(hands).forEach((hand) => {
        if (handsProbabilities[getHandScores(hand)] === undefined) {
            const followingHandsData = hand.followingHands.map((followingHand) => {
                return createHandProbabilities({
                    aggregatedScores,
                    hand: followingHand,
                    outcomesWeight
                });
            });

            handsProbabilities[getHandScores(hand)] = followingHandsData.reduce<HandProbabilities>(
                (reduced, next) => {
                    return mergeHandProbabilities(reduced, next);
                },
                createHandProbabilities({ aggregatedScores, hand: undefined, outcomesWeight })
            );
        }
    });

    return handsProbabilities;
};

const mergeHandProbabilities = (a: HandProbabilities, b: HandProbabilities): HandProbabilities => {
    return {
        equal: mergeRelativeProbabilities(a.equal, b.equal),
        higher: mergeRelativeProbabilities(a.higher, b.higher),
        lower: mergeRelativeProbabilities(a.lower, b.lower),
        overMaximum: a.overMaximum + b.overMaximum
    };
};
