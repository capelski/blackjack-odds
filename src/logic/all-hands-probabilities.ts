import {
    AggregatedScore,
    AllAggregatedScores,
    AllHandsProbabilities,
    CardOutcome,
    Dictionary,
    Hand,
    HandProbabilities
} from '../types';
import { getCardOutcomeScores } from './card-outcome';
import { getHandScores, isHandBelowStandingScore } from './hand';
import {
    createEmptyHandProbabilities,
    createPartialHandProbabilities,
    mergeHandProbabilities
} from './hand-probabilities';

export const getAggregatedScoreProbabilities = (
    aggregatedScore: AggregatedScore,
    allHandsProbabilities: AllHandsProbabilities
) => {
    return allHandsProbabilities[aggregatedScore.scores];
};

export const getAllHandsProbabilities = (
    aggregatedScores: AllAggregatedScores,
    hands: Dictionary<Hand>,
    outcomesWeight: number,
    standingScore: number | undefined
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

const setHandProbabilities = (
    aggregatedScores: AllAggregatedScores,
    hand: Hand,
    allHandsProbabilities: AllHandsProbabilities,
    outcomesWeight: number,
    standingScore: number | undefined
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
