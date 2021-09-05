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
        setLongRunHandProbabilities(
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
                return {
                    probabilities: createHandProbabilities({
                        aggregatedScores,
                        handScore: followingHand.score
                    }),
                    weight: followingHand.lastCard.weight / outcomesWeight
                };
            });

            const nextHandProbabilities: HandProbabilities =
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

            nextCardProbabilities[getHandScores(hand)] = nextHandProbabilities;
        }
    });

    return nextCardProbabilities;
};

const setLongRunHandProbabilities = (
    aggregatedScores: AllAggregatedScores,
    hand: Hand,
    allHandsProbabilities: AllHandsProbabilities,
    outcomesWeight: number,
    standingScore: number
) => {
    if (getHandProbabilities(hand, allHandsProbabilities) === undefined) {
        if (isHandBelowStandingScore(hand, standingScore)) {
            const followingHandsProbabilities = hand.followingHands.map((followingHand) => {
                setLongRunHandProbabilities(
                    aggregatedScores,
                    followingHand,
                    allHandsProbabilities,
                    outcomesWeight,
                    standingScore
                );

                return {
                    probabilities: allHandsProbabilities[getHandScores(followingHand)],
                    weight: followingHand.lastCard.weight / outcomesWeight
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

            allHandsProbabilities[getHandScores(hand)] = handProbabilities;
        } else {
            allHandsProbabilities[getHandScores(hand)] = createHandProbabilities({
                aggregatedScores,
                handScore: hand.score
            });
        }
    }
};
