import { CardOutcome } from '../types';
import { decksNumber } from './constants';

export const getAllCardOutcomes = (): CardOutcome[] => {
    const outcomesNumber = 4 * decksNumber;

    return [
        { symbol: '2', values: [2], weight: outcomesNumber },
        { symbol: '3', values: [3], weight: outcomesNumber },
        { symbol: '4', values: [4], weight: outcomesNumber },
        { symbol: '5', values: [5], weight: outcomesNumber },
        { symbol: '6', values: [6], weight: outcomesNumber },
        { symbol: '7', values: [7], weight: outcomesNumber },
        { symbol: '8', values: [8], weight: outcomesNumber },
        { symbol: '9', values: [9], weight: outcomesNumber },
        // There four 10-valued outcomes: 10, J, Q, K
        { symbol: '10', values: [10], weight: 4 * outcomesNumber },
        { symbol: 'A', values: [1, 11], weight: outcomesNumber }
    ];
};

export const getCardOutcomesWeight = (cardOutcomes: CardOutcome[]) => {
    return cardOutcomes.reduce((reduced, next) => reduced + next.weight, 0);
};
