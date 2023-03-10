import { CardSymbol } from '../models';
import { Card, CardSet } from '../types';

/** Returns the set of cards available */
export const getCardSet = (() => {
    /* cardSet is cached and lazy loaded */
    let cardSet: CardSet;

    /** Returns the set of cards available */
    return function getCardSet(): CardSet {
        if (!cardSet) {
            const cards: Card[] = [
                { symbol: CardSymbol.two, values: [2], weight: 1 },
                { symbol: CardSymbol.three, values: [3], weight: 1 },
                { symbol: CardSymbol.four, values: [4], weight: 1 },
                { symbol: CardSymbol.five, values: [5], weight: 1 },
                { symbol: CardSymbol.six, values: [6], weight: 1 },
                { symbol: CardSymbol.seven, values: [7], weight: 1 },
                { symbol: CardSymbol.eight, values: [8], weight: 1 },
                { symbol: CardSymbol.nine, values: [9], weight: 1 },
                // There four 10-valued outcomes: 10, J, Q, K
                { symbol: CardSymbol.figure, values: [10], weight: 4 },
                { symbol: CardSymbol.ace, values: [1, 11], weight: 1 }
            ];
            const weight = cards.reduce((reduced, next) => reduced + next.weight, 0);

            cardSet = {
                cards,
                weight
            };
        }

        return cardSet;
    };
})();
