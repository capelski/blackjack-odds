import { CardSymbol } from '../models';
import { Card, CardSet } from '../types';

/** Returns the set of cards available */
export const getCardSet = (() => {
    /* cardSet is cached and lazy loaded */
    let cardSet: CardSet;

    /** Returns the set of cards available */
    return function getCardSet(): CardSet {
        if (!cardSet) {
            // The order of the cards reflect the order in which hand codes are sorted
            const cards: Card[] = [
                { symbol: CardSymbol.ace, values: [1, 11], weight: 1 },
                // There are four 10-valued outcomes (i.e. 10, J, Q, K) hence weight is four
                { symbol: CardSymbol.figure, values: [10], weight: 4 },
                { symbol: CardSymbol.nine, values: [9], weight: 1 },
                { symbol: CardSymbol.eight, values: [8], weight: 1 },
                { symbol: CardSymbol.seven, values: [7], weight: 1 },
                { symbol: CardSymbol.six, values: [6], weight: 1 },
                { symbol: CardSymbol.five, values: [5], weight: 1 },
                { symbol: CardSymbol.four, values: [4], weight: 1 },
                { symbol: CardSymbol.three, values: [3], weight: 1 },
                { symbol: CardSymbol.two, values: [2], weight: 1 }
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
