import {
    AllScoreStatsChoices,
    DecisionOutcome,
    DecisionProbabilityBreakdown,
    OutcomesSet,
    ScoreStats,
    ScoreStatsAllDealerCardChoices
} from '../types';

type WeightedDecisionOutcome = {
    outcome: DecisionOutcome;
    weight: number;
};

export const getDecisionOutcome = ({
    decisionProbabilities,
    lossPayout,
    winPayout
}: {
    decisionProbabilities: DecisionProbabilityBreakdown;
    lossPayout: number;
    winPayout: number;
}): DecisionOutcome => {
    const lossProbability =
        decisionProbabilities.playerBusting + decisionProbabilities.playerLessThanDealer;
    const winProbability =
        decisionProbabilities.playerMoreThanDealer + decisionProbabilities.dealerBusting;

    const decisionOutcome: DecisionOutcome = {
        lossPayout,
        lossProbability,
        playerAdvantage: {
            hands: winProbability - lossProbability,
            payout: winProbability * winPayout - lossProbability * lossPayout
        },
        pushProbability: decisionProbabilities.playerEqualToDealer,
        totalProbability: 0,
        winPayout,
        winProbability
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
    return reduceDecisionOutcomes(
        Object.values(allScoreStats)
            .filter((allScoreStats) => allScoreStats.initialHandProbability > 0)
            .map<WeightedDecisionOutcome>((scoreStats) => {
                return {
                    outcome: allScoreStatsChoices[scoreStats.key].decisionOutcome,
                    weight: scoreStats.initialHandProbability
                };
            })
    );
};

export const mergeOutcomesByOutcomeSet = ({
    outcomesSet,
    scoreStatsAllChoices
}: {
    outcomesSet: OutcomesSet;
    scoreStatsAllChoices: ScoreStatsAllDealerCardChoices;
}): DecisionOutcome => {
    return reduceDecisionOutcomes(
        outcomesSet.allOutcomes.map<WeightedDecisionOutcome>((cardOutcome) => {
            const { choice, decisions } = scoreStatsAllChoices[cardOutcome.key];
            const { outcome } = decisions[choice];
            const weight = cardOutcome.weight / outcomesSet.totalWeight;
            return {
                outcome,
                weight
            };
        })
    );
};

const reduceDecisionOutcomes = (
    weightedDecisionOutcomes: WeightedDecisionOutcome[]
): DecisionOutcome => {
    return weightedDecisionOutcomes.reduce<DecisionOutcome>(
        (reduced, wdo) => {
            return <DecisionOutcome>{
                lossPayout: reduced.lossPayout + wdo.weight * wdo.outcome.lossPayout,
                lossProbability: reduced.lossProbability + wdo.weight * wdo.outcome.lossProbability,
                playerAdvantage: {
                    hands:
                        reduced.playerAdvantage.hands +
                        wdo.weight * wdo.outcome.playerAdvantage.hands,
                    payout:
                        reduced.playerAdvantage.payout +
                        wdo.weight * wdo.outcome.playerAdvantage.payout
                },
                pushProbability: reduced.pushProbability + wdo.weight * wdo.outcome.pushProbability,
                totalProbability:
                    reduced.totalProbability + wdo.weight * wdo.outcome.totalProbability,
                winPayout: reduced.winPayout + wdo.weight * wdo.outcome.winPayout,
                winProbability: reduced.winProbability + wdo.weight * wdo.outcome.winProbability
            };
        },
        <DecisionOutcome>{
            lossPayout: 0,
            lossProbability: 0,
            playerAdvantage: { hands: 0, payout: 0 },
            pushProbability: 0,
            totalProbability: 0,
            winPayout: 0,
            winProbability: 0
        }
    );
};
