import { AllScoreStatsChoices, DecisionOutcome, PlayerAdvantage, ScoreStats } from '../types';
import { isBlackjack } from './hand';

export const getPlayerAdvantage = ({
    blackjackPayout,
    decisionOutcome,
    scoreStats
}: {
    blackjackPayout: boolean;
    decisionOutcome: DecisionOutcome;
    scoreStats: ScoreStats;
}): PlayerAdvantage => {
    return {
        hands: decisionOutcome.winProbability - decisionOutcome.lossProbability,
        payout:
            decisionOutcome.winProbability *
                (isBlackjack(scoreStats.representativeHand.cardSymbols) && blackjackPayout
                    ? 1.5
                    : 1) -
            decisionOutcome.lossProbability
    };
};

export const mergePlayerAdvantages = ({
    allScoreStats,
    allScoreStatsChoices
}: {
    allScoreStats: ScoreStats[];
    allScoreStatsChoices: AllScoreStatsChoices;
}): PlayerAdvantage => {
    return Object.values(allScoreStats).reduce<PlayerAdvantage>(
        (reduced, scoreStats) => ({
            hands:
                reduced.hands +
                scoreStats.initialHandProbability *
                    allScoreStatsChoices[scoreStats.key].playerAdvantage.hands,
            payout:
                reduced.payout +
                scoreStats.initialHandProbability *
                    allScoreStatsChoices[scoreStats.key].playerAdvantage.payout
        }),
        { hands: 0, payout: 0 }
    );
};
