import { blackjackScore, maximumScore } from '../constants';
import { DecisionProbabilities, EffectiveScoreProbabilities } from '../types';
import {
    getBustingProbability,
    getPossibleFinalScores,
    getRangeProbability
} from './effective-score-probabilities';
import { isBustScore } from './hand';

export const getDecisionProbabilities = ({
    dealerProbabilities,
    playerProbabilities,
    playerScore
}: {
    dealerProbabilities: EffectiveScoreProbabilities;
    playerProbabilities: EffectiveScoreProbabilities;
    playerScore: number;
}): DecisionProbabilities => {
    const decisionProbabilities: DecisionProbabilities = {
        playerBusting: getBustingProbability(playerProbabilities),
        playerLessThanCurrent: getRangeProbability(playerProbabilities, 0, playerScore - 1),
        total: 0,
        ...getPossibleFinalScores(playerProbabilities)
            .filter((finalScore) => !isBustScore(finalScore))
            .reduce(
                (reduced, finalScore) => {
                    return {
                        dealerBusting:
                            reduced.dealerBusting +
                            playerProbabilities[finalScore] *
                                getBustingProbability(dealerProbabilities),
                        playerEqualToDealer:
                            reduced.playerEqualToDealer +
                            playerProbabilities[finalScore] *
                                getRangeProbability(dealerProbabilities, finalScore, finalScore),
                        playerLessThanDealer:
                            reduced.playerLessThanDealer +
                            playerProbabilities[finalScore] *
                                getRangeProbability(
                                    dealerProbabilities,
                                    finalScore + (finalScore === maximumScore ? 0.5 : 1),
                                    blackjackScore
                                ),
                        playerMoreThanDealer:
                            reduced.playerMoreThanDealer +
                            playerProbabilities[finalScore] *
                                getRangeProbability(
                                    dealerProbabilities,
                                    0,
                                    finalScore - (finalScore === blackjackScore ? 0.5 : 1)
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

    decisionProbabilities.total =
        decisionProbabilities.playerBusting +
        decisionProbabilities.dealerBusting +
        decisionProbabilities.playerEqualToDealer +
        decisionProbabilities.playerLessThanDealer +
        decisionProbabilities.playerMoreThanDealer;

    return decisionProbabilities;
};
