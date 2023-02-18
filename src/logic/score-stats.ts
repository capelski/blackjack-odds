import { handKeySeparator, scoreKeySeparator } from '../constants';
import { CardSymbol, ScoreKey } from '../models';
import { Dictionary, Hand, ScoreStats } from '../types';
import { getOutcomesSet } from './outcomes-set';

/**
 * Returns a list of all possible valid scores' stats
 */
export const getAllScoreStats = (allHands: Hand[]): ScoreStats[] => {
    const allScoresStatsMap = <Dictionary<ScoreStats>>{};
    const allScoreStats: ScoreStats[] = [];
    const outcomesSet = getOutcomesSet();

    allHands.forEach((hand) => {
        const handSymbols = hand.cardSymbols.join(handKeySeparator);

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
        scoreStats.combinations.sort((a, b) => {
            const aSymbols = a.split(',');
            const bSymbols = b.split(',');
            const maxLength = Math.max(aSymbols.length, bSymbols.length);
            for (let i = 0; i < maxLength; ++i) {
                const aSymbol = aSymbols[i];
                const bSymbol = bSymbols[i];

                if (aSymbol === bSymbol && aSymbols.length !== bSymbols.length) {
                    return aSymbols.length - bSymbols.length;
                } else if (aSymbol === CardSymbol.ace && bSymbol !== CardSymbol.ace) {
                    return 1;
                } else if (aSymbol !== CardSymbol.ace && bSymbol === CardSymbol.ace) {
                    return -1;
                } else if (aSymbol !== CardSymbol.ace && bSymbol !== CardSymbol.ace) {
                    const aNumber = parseInt(aSymbol);
                    const bNumber = parseInt(bSymbol);
                    if (aNumber !== bNumber) {
                        return bNumber - aNumber;
                    }
                }
            }
            return 0;
        });
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
                    combination.includes(handKeySeparator)
                )
            }))
            .filter((scoreStats) => scoreStats.combinations.length > 0)
    );
};

export const sortScoreStats = (allScoreStats: ScoreStats[]) => {
    return [...allScoreStats].sort((a, b) => {
        const isSplitA = a.key.indexOf(handKeySeparator) > -1;
        const isSplitB = b.key.indexOf(handKeySeparator) > -1;
        const isSplitDifference = isSplitA !== isSplitB;

        const isSoftA = a.key.indexOf(scoreKeySeparator) > -1;
        const isSoftB = b.key.indexOf(scoreKeySeparator) > -1;
        const isSoftDifference = isSoftA !== isSoftB;

        const isBlackjackA = a.key === ScoreKey.blackjack;
        const isBlackjackB = b.key === ScoreKey.blackjack;
        const isBlackjackDifference = isBlackjackA !== isBlackjackB;

        return isSplitDifference
            ? +isSplitB - +isSplitA
            : isSoftDifference
            ? +isSoftB - +isSoftA
            : isBlackjackDifference
            ? +isBlackjackA - +isBlackjackB
            : !isSplitDifference && a.key === ScoreKey.splitAs
            ? 1
            : !isSplitDifference && b.key === ScoreKey.splitAs
            ? -1
            : a.representativeHand.effectiveScore - b.representativeHand.effectiveScore;
    });
};
