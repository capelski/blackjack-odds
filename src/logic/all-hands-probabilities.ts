import {
    AggregatedScore,
    AllAggregatedScores,
    AllHands,
    AllHandsProbabilities,
    CardOutcome,
    Hand,
    HandProbabilities
} from '../types';
import { getHandScores } from './hand';
import {
    createEmptyHandProbabilities,
    createHandProbabilities,
    mergeHandProbabilities,
    weightHandProbabilities
} from './hand-probabilities';
import { getScoreHittingLoss } from './optimal-actions';
import { isBustScore } from './utils';

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

export const getLongRunHandsProbabilities = ({
    allAggregatedScores,
    allHands,
    maximumBustingRisk,
    nextCardProbabilities,
    outcomesWeight
}: {
    allAggregatedScores: AllAggregatedScores;
    allHands: AllHands;
    maximumBustingRisk: number;
    nextCardProbabilities: AllHandsProbabilities;
    outcomesWeight: number;
}): AllHandsProbabilities => {
    const longRunProbabilities: AllHandsProbabilities = {};

    Object.values(allHands).forEach((hand) => {
        setLongRunHandProbabilities({
            allAggregatedScores,
            hand,
            longRunProbabilities,
            maximumBustingRisk,
            nextCardProbabilities,
            outcomesWeight
        });
    });

    return longRunProbabilities;
};

export const getNextCardHandsProbabilities = ({
    allAggregatedScores,
    allHands,
    outcomesWeight
}: {
    allAggregatedScores: AllAggregatedScores;
    allHands: AllHands;
    outcomesWeight: number;
}): AllHandsProbabilities => {
    const nextCardProbabilities: AllHandsProbabilities = {};

    Object.values(allHands).forEach((hand) => {
        if (getHandProbabilities(hand, nextCardProbabilities) === undefined) {
            const followingHandsProbabilities = hand.followingHands.map((followingHand) => {
                return weightHandProbabilities({
                    handProbabilities: createHandProbabilities({
                        allAggregatedScores,
                        canHit: true,
                        handScore: followingHand.score
                    }),
                    weight: followingHand.lastCard.weight / outcomesWeight
                });
            });

            nextCardProbabilities[getHandScores(hand)] = mergeFollowingHandsProbabilities(
                allAggregatedScores,
                followingHandsProbabilities
            );
        }
    });

    return nextCardProbabilities;
};

const isHandBelowMaximumBustingRisk = (
    hand: Hand,
    maximumBustingRisk: number,
    nextCardProbabilities: AllHandsProbabilities
) => {
    const handNextCardProbabilities = getHandProbabilities(hand, nextCardProbabilities);
    const hittingLoss = getScoreHittingLoss(hand.score, handNextCardProbabilities);

    return hittingLoss <= maximumBustingRisk;
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

const setLongRunHandProbabilities = ({
    allAggregatedScores,
    hand,
    longRunProbabilities,
    maximumBustingRisk,
    nextCardProbabilities,
    outcomesWeight
}: {
    allAggregatedScores: AllAggregatedScores;
    hand: Hand;
    longRunProbabilities: AllHandsProbabilities;
    maximumBustingRisk: number;
    nextCardProbabilities: AllHandsProbabilities;
    outcomesWeight: number;
}) => {
    if (getHandProbabilities(hand, longRunProbabilities) === undefined) {
        let handProbabilities: HandProbabilities;

        if (
            !isBustScore(hand.score) &&
            isHandBelowMaximumBustingRisk(hand, maximumBustingRisk, nextCardProbabilities)
        ) {
            const followingHandsProbabilities = hand.followingHands.map((followingHand) => {
                setLongRunHandProbabilities({
                    allAggregatedScores,
                    hand: followingHand,
                    longRunProbabilities,
                    maximumBustingRisk,
                    nextCardProbabilities,
                    outcomesWeight
                });

                return weightHandProbabilities({
                    handProbabilities: longRunProbabilities[getHandScores(followingHand)],
                    weight: followingHand.lastCard.weight / outcomesWeight
                });
            });

            handProbabilities = mergeFollowingHandsProbabilities(
                allAggregatedScores,
                followingHandsProbabilities
            );
            handProbabilities.canHit = true;
        } else {
            handProbabilities = createHandProbabilities({
                allAggregatedScores,
                canHit: false,
                handScore: hand.score
            });
        }

        longRunProbabilities[getHandScores(hand)] = handProbabilities;
    }
};
