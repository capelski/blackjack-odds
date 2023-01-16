import { CardSymbol, ScoreKey } from '../models';
import { CardOutcome, Dictionary, OutcomesSet } from '../types';

/**
 * Returns the set of outcomes available (i.e. cards and weights)
 */
export const getOutcomesSet = (): OutcomesSet => {
    const allOutcomes: CardOutcome[] = [
        { key: ScoreKey.hard2, symbol: CardSymbol.two, values: [2], weight: 1 },
        { key: ScoreKey.hard3, symbol: CardSymbol.three, values: [3], weight: 1 },
        { key: ScoreKey.hard4, symbol: CardSymbol.four, values: [4], weight: 1 },
        { key: ScoreKey.hard5, symbol: CardSymbol.five, values: [5], weight: 1 },
        { key: ScoreKey.hard6, symbol: CardSymbol.six, values: [6], weight: 1 },
        { key: ScoreKey.hard7, symbol: CardSymbol.seven, values: [7], weight: 1 },
        { key: ScoreKey.hard8, symbol: CardSymbol.eight, values: [8], weight: 1 },
        { key: ScoreKey.hard9, symbol: CardSymbol.nine, values: [9], weight: 1 },
        // There four 10-valued outcomes: 10, J, Q, K
        { key: ScoreKey.hard10, symbol: CardSymbol.figure, values: [10], weight: 4 },
        { key: ScoreKey.soft11, symbol: CardSymbol.ace, values: [1, 11], weight: 1 }
    ];
    const totalWeight = allOutcomes.reduce((reduced, next) => reduced + next.weight, 0);
    const allWeights = allOutcomes.reduce((reduced, cardOutcome) => {
        return {
            ...reduced,
            [cardOutcome.key]: cardOutcome.weight / totalWeight
        };
    }, <Dictionary<number, ScoreKey>>{});

    return {
        allOutcomes,
        allWeights,
        totalWeight
    };
};
