import {
    AggregatedScore,
    AllAggregatedScores,
    AllHands,
    AllHandsProbabilities,
    CardOutcome,
    Hand,
    HandProbabilities
} from '../types';
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
    return allHandsProbabilities[cardOutcome.key];
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
                return weightHandProbabilities({
                    handProbabilities: createHandProbabilities({
                        aggregatedScores,
                        handScore: followingHand.score
                    }),
                    weight: followingHand.lastCard.weight / outcomesWeight
                });
            });

            nextCardProbabilities[getHandScores(hand)] = mergeFollowingHandsProbabilities(
                aggregatedScores,
                followingHandsProbabilities
            );
        }
    });

    return nextCardProbabilities;
};

const mergeFollowingHandsProbabilities = (
    aggregatedScores: AllAggregatedScores,
    followingHandsProbabilities: HandProbabilities[]
) => {
    return followingHandsProbabilities.reduce<HandProbabilities>(
        mergeHandProbabilities,
        createEmptyHandProbabilities({
            aggregatedScores
        })
    );
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

                return weightHandProbabilities({
                    handProbabilities: allHandsProbabilities[getHandScores(followingHand)],
                    weight: followingHand.lastCard.weight / outcomesWeight
                });
            });

            allHandsProbabilities[getHandScores(hand)] = mergeFollowingHandsProbabilities(
                aggregatedScores,
                followingHandsProbabilities
            );
        } else {
            allHandsProbabilities[getHandScores(hand)] = createHandProbabilities({
                aggregatedScores,
                handScore: hand.score
            });
        }
    }
};
