import { Dictionary, Hand, HandProbabilities } from '../types';
import { dealerStandingScore, maximumScore } from './constants';
import { getHandScores } from './hand';

export const getHandsNextCardProbabilities = (
    hands: Dictionary<Hand>,
    outcomesWeight: number
): Dictionary<HandProbabilities> => {
    const handsProbabilities: Dictionary<HandProbabilities> = {};

    Object.values(hands).forEach((hand) => {
        if (handsProbabilities[getHandScores(hand)] === undefined) {
            handsProbabilities[getHandScores(hand)] = hand.followingHands.reduce<HandProbabilities>(
                (reducedFollowingHands, followingHand) => {
                    return {
                        opponentRelative: {
                            equal:
                                reducedFollowingHands.opponentRelative.equal +
                                (followingHand.score === dealerStandingScore
                                    ? followingHand.lastCard.weight / outcomesWeight
                                    : 0),
                            higher:
                                reducedFollowingHands.opponentRelative.higher +
                                (followingHand.score <= maximumScore &&
                                followingHand.score > dealerStandingScore
                                    ? followingHand.lastCard.weight / outcomesWeight
                                    : 0),
                            lower:
                                reducedFollowingHands.opponentRelative.lower +
                                (followingHand.score < dealerStandingScore
                                    ? followingHand.lastCard.weight / outcomesWeight
                                    : 0)
                        },
                        overMaximum:
                            reducedFollowingHands.overMaximum +
                            (followingHand.score > maximumScore
                                ? followingHand.lastCard.weight / outcomesWeight
                                : 0)
                    };
                },
                {
                    opponentRelative: {
                        equal: 0,
                        higher: 0,
                        lower: 0
                    },
                    overMaximum: 0
                }
            );
        }
    });

    return handsProbabilities;
};
