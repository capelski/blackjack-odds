import { blackjackScore, maximumScore } from '../constants';
import { FinalScores, VsDealerBreakdown } from '../types';
import { isBustScore } from './representative-hand';

export const aggregateBreakdowns = <
    T extends { vsDealerBreakdown: VsDealerBreakdown; weight: number }
>(
    weightedBreakdowns: T[]
): VsDealerBreakdown => {
    return weightedBreakdowns
        .map((weightedBreakdown) => {
            return weightBreakdowns(weightedBreakdown.vsDealerBreakdown, weightedBreakdown.weight);
        })
        .reduce(mergeBreakdowns, undefined!);
};

const getBustingProbability = (finalScores: FinalScores): number => {
    return Object.values(finalScores)
        .filter((finalScore) => isBustScore(finalScore.score))
        .reduce((reduced, finalScore) => {
            return reduced + finalScore.weight;
        }, 0);
};

const getRangeProbability = (
    finalScores: FinalScores,
    rangeStart: number,
    rangeEnd: number
): number => {
    return Object.values(finalScores)
        .filter((finalScore) => finalScore.score >= rangeStart && finalScore.score <= rangeEnd)
        .reduce((reduced, finalScore) => {
            return reduced + finalScore.weight;
        }, 0);
};

export const getVsDealerBreakdown = ({
    dealerFinalScores,
    playerFinalScores,
    playerScore
}: {
    dealerFinalScores: FinalScores;
    playerFinalScores: FinalScores;
    playerScore: number;
}): VsDealerBreakdown => {
    const vsDealerBreakdown: VsDealerBreakdown = {
        playerBusting: getBustingProbability(playerFinalScores),
        playerLessThanCurrent: getRangeProbability(playerFinalScores, 0, playerScore - 1),
        total: 0,
        ...Object.values(playerFinalScores)
            .filter((finalScore) => !isBustScore(finalScore.score))
            .reduce(
                (reduced, finalScore) => {
                    return {
                        dealerBusting:
                            reduced.dealerBusting +
                            finalScore.weight * getBustingProbability(dealerFinalScores),
                        playerEqualToDealer:
                            reduced.playerEqualToDealer +
                            finalScore.weight *
                                getRangeProbability(
                                    dealerFinalScores,
                                    finalScore.score,
                                    finalScore.score
                                ),
                        playerLessThanDealer:
                            reduced.playerLessThanDealer +
                            finalScore.weight *
                                getRangeProbability(
                                    dealerFinalScores,
                                    finalScore.score +
                                        (finalScore.score === maximumScore ? 0.5 : 1),
                                    blackjackScore
                                ),
                        playerMoreThanDealer:
                            reduced.playerMoreThanDealer +
                            finalScore.weight *
                                getRangeProbability(
                                    dealerFinalScores,
                                    0,
                                    finalScore.score -
                                        (finalScore.score === blackjackScore ? 0.5 : 1)
                                )
                    };
                },
                {
                    dealerBusting: 0,
                    playerEqualToDealer: 0,
                    playerLessThanDealer: 0,
                    playerMoreThanDealer: 0
                }
            )
    };

    vsDealerBreakdown.total =
        vsDealerBreakdown.playerBusting +
        vsDealerBreakdown.dealerBusting +
        vsDealerBreakdown.playerEqualToDealer +
        vsDealerBreakdown.playerLessThanDealer +
        vsDealerBreakdown.playerMoreThanDealer;

    return vsDealerBreakdown;
};

const mergeBreakdowns = (
    a: VsDealerBreakdown | undefined,
    b: VsDealerBreakdown
): VsDealerBreakdown => {
    return a
        ? {
              dealerBusting: a.dealerBusting + b.dealerBusting,
              playerBusting: a.playerBusting + b.playerBusting,
              playerEqualToDealer: a.playerEqualToDealer + b.playerEqualToDealer,
              playerLessThanCurrent: a.playerLessThanCurrent + b.playerLessThanCurrent,
              playerLessThanDealer: a.playerLessThanDealer + b.playerLessThanDealer,
              playerMoreThanDealer: a.playerMoreThanDealer + b.playerMoreThanDealer,
              total: a.total + b.total
          }
        : b;
};

const weightBreakdowns = (
    vsDealerBreakdown: VsDealerBreakdown,
    weight: number
): VsDealerBreakdown => {
    return {
        dealerBusting: vsDealerBreakdown.dealerBusting * weight,
        playerBusting: vsDealerBreakdown.playerBusting * weight,
        playerEqualToDealer: vsDealerBreakdown.playerEqualToDealer * weight,
        playerLessThanCurrent: vsDealerBreakdown.playerLessThanCurrent * weight,
        playerLessThanDealer: vsDealerBreakdown.playerLessThanDealer * weight,
        playerMoreThanDealer: vsDealerBreakdown.playerMoreThanDealer * weight,
        total: vsDealerBreakdown.total * weight
    };
};
