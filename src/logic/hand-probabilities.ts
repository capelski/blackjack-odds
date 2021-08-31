import {
    AggregatedScore,
    Dictionary,
    Hand,
    HandProbabilities,
    RelativeProbabilities
} from '../types';
import { maximumScore } from './constants';
import { getHandScores } from './hand';

const createHandProbabilities = (
    aggregatedScores: Dictionary<AggregatedScore>,
    handProbabilities: HandProbabilities | undefined
): HandProbabilities => {
    return {
        opponentRelative: Object.values(aggregatedScores).reduce<Dictionary<RelativeProbabilities>>(
            (reduced, next) => {
                // TODO Create separate objects for soft scores
                const opponentRelative: RelativeProbabilities = reduced[next.score] || {
                    equal:
                        handProbabilities === undefined
                            ? 0
                            : handProbabilities.opponentRelative[next.score].equal,
                    higher:
                        handProbabilities === undefined
                            ? 0
                            : handProbabilities.opponentRelative[next.score].higher,
                    lower:
                        handProbabilities === undefined
                            ? 0
                            : handProbabilities.opponentRelative[next.score].lower,
                    score: next.score
                };
                return {
                    ...reduced,
                    [next.score]: opponentRelative
                };
            },
            {}
        ),
        overMaximum: handProbabilities === undefined ? 0 : handProbabilities.overMaximum
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
            handsProbabilities[getHandScores(hand)] = hand.followingHands.reduce<HandProbabilities>(
                (reducedFollowingHands, followingHand) => {
                    const nextReducedFollowingHands = createHandProbabilities(
                        aggregatedScores,
                        reducedFollowingHands
                    );

                    // TODO Consider soft scores when available
                    nextReducedFollowingHands.overMaximum +=
                        followingHand.score > maximumScore
                            ? followingHand.lastCard.weight / outcomesWeight
                            : 0;

                    Object.values(nextReducedFollowingHands.opponentRelative).forEach(
                        (opponentRelative) => {
                            (opponentRelative.equal +=
                                followingHand.score === opponentRelative.score
                                    ? followingHand.lastCard.weight / outcomesWeight
                                    : 0),
                                (opponentRelative.higher +=
                                    followingHand.score <= maximumScore &&
                                    followingHand.score > opponentRelative.score
                                        ? followingHand.lastCard.weight / outcomesWeight
                                        : 0),
                                (opponentRelative.lower +=
                                    followingHand.score < opponentRelative.score
                                        ? followingHand.lastCard.weight / outcomesWeight
                                        : 0);
                        }
                    );

                    return nextReducedFollowingHands;
                },
                createHandProbabilities(aggregatedScores, undefined)
            );
        }
    });

    return handsProbabilities;
};
