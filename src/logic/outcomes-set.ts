import { OutcomesSet } from '../types';
import { decksNumber } from './constants';

export const getOutcomesSet = (): OutcomesSet => {
    const outcomesNumber = 4 * decksNumber;
    const allOutcomes = [
        { key: '2', symbol: '2', values: [2], weight: outcomesNumber },
        { key: '3', symbol: '3', values: [3], weight: outcomesNumber },
        { key: '4', symbol: '4', values: [4], weight: outcomesNumber },
        { key: '5', symbol: '5', values: [5], weight: outcomesNumber },
        { key: '6', symbol: '6', values: [6], weight: outcomesNumber },
        { key: '7', symbol: '7', values: [7], weight: outcomesNumber },
        { key: '8', symbol: '8', values: [8], weight: outcomesNumber },
        { key: '9', symbol: '9', values: [9], weight: outcomesNumber },
        // There four 10-valued outcomes: 10, J, Q, K
        { key: '10', symbol: '10', values: [10], weight: 4 * outcomesNumber },
        { key: '1/11', symbol: 'A', values: [1, 11], weight: outcomesNumber }
    ];
    const totalWeight = allOutcomes.reduce((reduced, next) => reduced + next.weight, 0);

    return {
        allOutcomes,
        totalWeight
    };
};
