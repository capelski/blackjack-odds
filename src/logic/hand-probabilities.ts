import { AggregatedScore, Dictionary, Hand, HandProbabilities } from '../types';
import { maximumScore } from './constants';
import { getHandScores } from './hand';
import { createOpponentProbabilities, mergeOpponentProbabilities } from './opponent-probabilities';

const createHandProbabilities = (
    aggregatedScores: Dictionary<AggregatedScore>,
    hand: Hand | undefined,
    outcomesWeight: number
): HandProbabilities => {
    return hand === undefined
        ? {
              opponentRelative: createOpponentProbabilities(aggregatedScores, (score) => {
                  return {
                      equal: 0,
                      higher: 0,
                      lower: 0,
                      score
                  };
              }),
              overMaximum: 0
          }
        : {
              opponentRelative: createOpponentProbabilities(aggregatedScores, (score) => {
                  return {
                      equal: hand.score === score ? hand.lastCard.weight / outcomesWeight : 0,
                      higher:
                          hand.score <= maximumScore && hand.score > score
                              ? hand.lastCard.weight / outcomesWeight
                              : 0,
                      lower: hand.score < score ? hand.lastCard.weight / outcomesWeight : 0,
                      score
                  };
              }),
              overMaximum: hand.score > maximumScore ? hand.lastCard.weight / outcomesWeight : 0
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
                return createHandProbabilities(aggregatedScores, followingHand, outcomesWeight);
            });

            handsProbabilities[getHandScores(hand)] = followingHandsData.reduce<HandProbabilities>(
                (reduced, next) => {
                    return mergeHandProbabilities(reduced, next);
                },
                createHandProbabilities(aggregatedScores, undefined, outcomesWeight)
            );
        }
    });

    return handsProbabilities;
};

const mergeHandProbabilities = (a: HandProbabilities, b: HandProbabilities): HandProbabilities => {
    return {
        opponentRelative: mergeOpponentProbabilities(a.opponentRelative, b.opponentRelative),
        overMaximum: a.overMaximum + b.overMaximum
    };
};
