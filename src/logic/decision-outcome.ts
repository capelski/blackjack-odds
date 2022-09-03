import {
    AllScoreStatsChoices,
    DecisionOutcome,
    DecisionProbabilityBreakdown,
    OutcomesSet,
    ScoreStats,
    ScoreStatsAllDealerCardChoices
} from '../types';

export const getDecisionOutcome = (
    decisionProbabilities: DecisionProbabilityBreakdown
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

export const mergeOutcomesByInitialHands = ({
    allScoreStats,
    allScoreStatsChoices
}: {
    allScoreStats: ScoreStats[];
    allScoreStatsChoices: AllScoreStatsChoices;
}): DecisionOutcome => {
    return Object.values(allScoreStats)
        .filter((allScoreStats) => allScoreStats.initialHandProbability > 0)
        .reduce<DecisionOutcome>(
            (reduced, scoreStats) => {
                const weight = scoreStats.initialHandProbability;
                const outcome = allScoreStatsChoices[scoreStats.key].decisionOutcome;
                return {
                    lossProbability: reduced.lossProbability + weight * outcome.lossProbability,
                    pushProbability: reduced.pushProbability + weight * outcome.pushProbability,
                    totalProbability: reduced.totalProbability + weight * outcome.totalProbability,
                    winProbability: reduced.winProbability + weight * outcome.winProbability
                };
            },
            { lossProbability: 0, pushProbability: 0, totalProbability: 0, winProbability: 0 }
        );
};

export const mergeOutcomesByOutcomeSet = ({
    outcomesSet,
    scoreStatsAllChoices
}: {
    outcomesSet: OutcomesSet;
    scoreStatsAllChoices: ScoreStatsAllDealerCardChoices;
}): DecisionOutcome => {
    return outcomesSet.allOutcomes.reduce<DecisionOutcome>(
        (reduced, cardOutcome) => {
            const { choice, decisions } = scoreStatsAllChoices[cardOutcome.key];
            const { outcome } = decisions[choice];
            const weight = cardOutcome.weight / outcomesSet.totalWeight;
            return {
                lossProbability: reduced.lossProbability + weight * outcome.lossProbability,
                pushProbability: reduced.pushProbability + weight * outcome.pushProbability,
                totalProbability: reduced.totalProbability + weight * outcome.totalProbability,
                winProbability: reduced.winProbability + weight * outcome.winProbability
            };
        },
        { lossProbability: 0, pushProbability: 0, totalProbability: 0, winProbability: 0 }
    );
};
