import { DecisionOutcome, DecisionProbabilities } from '../types';

export const getDecisionOutcome = (
    decisionProbabilities: DecisionProbabilities
): DecisionOutcome => {
    const decisionOutcome: DecisionOutcome = {
        lossProbability:
            decisionProbabilities.playerBusting + decisionProbabilities.playerLessThanDealer,
        pushProbability: decisionProbabilities.playerEqualToDealer,
        totalProbability: 0,
        winProbability:
            decisionProbabilities.playerMoreThanDealer + decisionProbabilities.dealerBusting
    };

    decisionOutcome.totalProbability =
        decisionOutcome.lossProbability +
        decisionOutcome.pushProbability +
        decisionOutcome.winProbability;

    return decisionOutcome;
};
