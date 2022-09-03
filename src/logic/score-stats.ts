import { ScoreKey } from '../models';
import { Dictionary, Hand, OutcomesSet, ScoreStats } from '../types';

/**
 * Returns a list of all possible valid scores' stats
 */
export const getAllScoreStats = ({
    allHands,
    outcomesSet
}: {
    allHands: Hand[];
    outcomesSet: OutcomesSet;
}): ScoreStats[] => {
    const allScoresStatsMap = <Dictionary<ScoreStats>>{};
    const allScoreStats: ScoreStats[] = [];

    allHands.forEach((hand) => {
        const handSymbols = hand.cardSymbols.join(',');

        if (allScoresStatsMap[hand.scoreKey] === undefined) {
            allScoresStatsMap[hand.scoreKey] = {
                combinations: [handSymbols],
                initialHandProbability: 0,
                key: hand.scoreKey,
                representativeHand: hand
            };
            allScoreStats.push(allScoresStatsMap[hand.scoreKey]);
        } else {
            allScoresStatsMap[hand.scoreKey].combinations.push(handSymbols);
        }

        if (hand.cardSymbols.length === 2) {
            const cardWeights = hand.cardSymbols.map(
                (cardSymbol) =>
                    outcomesSet.allOutcomes.find((o) => o.symbol === cardSymbol)!.weight /
                    outcomesSet.totalWeight
            );

            // Because equivalent hands are filtered out (e.g. A,2 and 2,A are the same hand)
            // the initialHandProbability must consider the filtered out hands
            const initialProbability =
                hand.cardSymbols[0] === hand.cardSymbols[1]
                    ? cardWeights[0] * cardWeights[1]
                    : 2 * (cardWeights[0] * cardWeights[1]);

            allScoresStatsMap[hand.scoreKey].initialHandProbability += initialProbability;
        }
    });

    allScoreStats.forEach((scoreStats) => {
        scoreStats.combinations.sort((a, b) => a.split(',').length - b.split(',').length);
    });

    // const totalProbability = allScoreStats.reduce((x, y) => x + y.initialHandProbability, 0);
    // console.log('totalProbability', totalProbability);

    return allScoreStats;
};

export const getPlayerScoreStats = (allScoreStats: ScoreStats[]) => {
    return (
        sortScoreStats(allScoreStats)
            // Filter out single card hands when displaying player scores
            .map((scoreStats) => ({
                ...scoreStats,
                combinations: scoreStats.combinations.filter((combination) =>
                    combination.includes(',')
                )
            }))
            .filter((scoreStats) => scoreStats.combinations.length > 0)
    );
};

export const sortScoreStats = (allScoreStats: ScoreStats[]) => {
    return [...allScoreStats].sort((a, b) => {
        const isBlackjackA = a.key === ScoreKey.blackjack;
        const isBlackjackB = b.key === ScoreKey.blackjack;

        return a.representativeHand.allScores.length === b.representativeHand.allScores.length
            ? isBlackjackA
                ? -1
                : isBlackjackB
                ? 1
                : a.representativeHand.effectiveScore - b.representativeHand.effectiveScore
            : a.representativeHand.allScores.length - b.representativeHand.allScores.length;
    });
};
