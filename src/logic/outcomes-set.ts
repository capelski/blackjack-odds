import { decksNumber } from '../constants';
import { ScoreKey } from '../models';
import { OutcomesSet } from '../types';

/**
 * Returns the set of outcomes available (i.e. cards and weights)
 */
export const getOutcomesSet = (): OutcomesSet => {
    const outcomesNumber = 4 * decksNumber;
    const allOutcomes = [
        { key: ScoreKey.hard2, symbol: '2', values: [2], weight: outcomesNumber },
        { key: ScoreKey.hard3, symbol: '3', values: [3], weight: outcomesNumber },
        { key: ScoreKey.hard4, symbol: '4', values: [4], weight: outcomesNumber },
        { key: ScoreKey.hard5, symbol: '5', values: [5], weight: outcomesNumber },
        { key: ScoreKey.hard6, symbol: '6', values: [6], weight: outcomesNumber },
        { key: ScoreKey.hard7, symbol: '7', values: [7], weight: outcomesNumber },
        { key: ScoreKey.hard8, symbol: '8', values: [8], weight: outcomesNumber },
        { key: ScoreKey.hard9, symbol: '9', values: [9], weight: outcomesNumber },
        // There four 10-valued outcomes: 10, J, Q, K
        { key: ScoreKey.hard10, symbol: '10', values: [10], weight: 4 * outcomesNumber },
        { key: ScoreKey.soft11, symbol: 'A', values: [1, 11], weight: outcomesNumber }
    ];
    const totalWeight = allOutcomes.reduce((reduced, next) => reduced + next.weight, 0);

    return {
        allOutcomes,
        totalWeight
    };
};
