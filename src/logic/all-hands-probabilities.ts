import {
    AggregatedScore,
    AllAggregatedScores,
    AllHands,
    AllHandsProbabilities,
    CardOutcome,
    Hand,
    HandProbabilities
} from '../types';
import { getCardOutcomeScores } from './card-outcome';
import { getHandScores, isHandBelowStandingScore } from './hand';
import {
    createEmptyHandProbabilities,
    createHandProbabilities,
    createPartialHandProbabilities,
    mergeHandProbabilities,
    weightHandProbabilities
} from './hand-probabilities';

export const getAggregatedScoreProbabilities = (
    aggregatedScore: AggregatedScore,
    allHandsProbabilities: AllHandsProbabilities
) => {
    return allHandsProbabilities[aggregatedScore.key];
};

export const getCardOutcomeProbabilities = (
    cardOutcome: CardOutcome,
    allHandsProbabilities: AllHandsProbabilities
) => {
    return allHandsProbabilities[getCardOutcomeScores(cardOutcome)];
};

export const getHandProbabilities = (hand: Hand, allHandsProbabilities: AllHandsProbabilities) => {
    const handScores = getHandScores(hand);
    return allHandsProbabilities[handScores];
};

export const getLongRunHandsProbabilities = (
    aggregatedScores: AllAggregatedScores,
    hands: AllHands,
    outcomesWeight: number,
    standingScore: number
): AllHandsProbabilities => {
    const allHandsProbabilities: AllHandsProbabilities = {};

    Object.values(hands).forEach((hand) => {
        setHandProbabilities(
            aggregatedScores,
            hand,
            allHandsProbabilities,
            outcomesWeight,
            standingScore
        );
    });

    return allHandsProbabilities;
};

export const getNextCardHandsProbabilities = (
    aggregatedScores: AllAggregatedScores,
    hands: AllHands,
    outcomesWeight: number
): AllHandsProbabilities => {
    const nextCardProbabilities: AllHandsProbabilities = {};

    Object.values(hands).forEach((hand) => {
        if (getHandProbabilities(hand, nextCardProbabilities) === undefined) {
            const followingHandsProbabilities = hand.followingHands.map((followingHand) => {
                const weight = followingHand.lastCard.weight / outcomesWeight;
                return {
                    probabilities: createHandProbabilities({
                        aggregatedScores,
                        handScore: followingHand.score
                    }),
                    weight
                };
            });

            const handProbabilities: HandProbabilities =
                followingHandsProbabilities.reduce<HandProbabilities>(
                    (reduced, next) => {
                        return mergeHandProbabilities(
                            reduced,
                            weightHandProbabilities({
                                handProbabilities: next.probabilities,
                                weight: next.weight
                            })
                        );
                    },
                    createEmptyHandProbabilities({
                        aggregatedScores
                    })
                );

            nextCardProbabilities[getHandScores(hand)] = handProbabilities;
        }
    });

    return nextCardProbabilities;
};

const setHandProbabilities = (
    aggregatedScores: AllAggregatedScores,
    hand: Hand,
    allHandsProbabilities: AllHandsProbabilities,
    outcomesWeight: number,
    standingScore: number
) => {
    if (getHandProbabilities(hand, allHandsProbabilities) === undefined) {
        hand.followingHands
            .filter((followingHand) => isHandBelowStandingScore(followingHand, standingScore))
            .forEach((followingHand) => {
                setHandProbabilities(
                    aggregatedScores,
                    followingHand,
                    allHandsProbabilities,
                    outcomesWeight,
                    standingScore
                );
            });

        const followingHandsProbabilities = hand.followingHands.map((followingHand) => {
            return createPartialHandProbabilities({
                aggregatedScores,
                followingHand,
                followingHandProbabilities: getHandProbabilities(
                    followingHand,
                    allHandsProbabilities
                ),
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

        allHandsProbabilities[getHandScores(hand)] = handProbabilities;
    }
};
