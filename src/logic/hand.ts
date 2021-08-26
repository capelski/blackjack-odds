import { CardOutcome, Dictionary, Hand } from '../types';
import { maximumScore } from './constants';
import { cartesianProduct, getValidValues, removeDuplicates } from './utils';

const createHand = (cardOutcome: CardOutcome, previousHand: Hand | undefined) => {
    const handValues = previousHand
        ? getHandNextValues(previousHand.values, cardOutcome.values)
        : cardOutcome.values;

    return {
        cardSymbols: previousHand
            ? previousHand.cardSymbols.concat([cardOutcome.symbol])
            : [cardOutcome.symbol],
        followingHands: [],
        lastCard: cardOutcome,
        value: getHandValue(handValues),
        values: handValues
    };
};

export const getAllHands = (cardOutcomes: CardOutcome[]): Hand[] => {
    const rootHands: Hand[] = cardOutcomes.map((cardOutcome) => createHand(cardOutcome, undefined));

    const handsDictionary: Dictionary<Hand> = {};
    const handsQueue = [...rootHands];

    while (handsQueue.length > 0) {
        const hand = handsQueue.pop()!;
        const handKey = getHandKey(hand);

        if (handsDictionary[handKey] === undefined) {
            handsDictionary[handKey] = hand;

            cardOutcomes.forEach((cardOutcome) => {
                const followingHand = createHand(cardOutcome, hand);

                hand.followingHands.push(followingHand);

                if (followingHand.value < maximumScore) {
                    handsQueue.push(followingHand);
                }
            });
        } else {
            hand.followingHands = handsDictionary[handKey].followingHands;
        }
    }

    return rootHands;
};

export const getHandNextValues = (previousValues: number[], nextValues: number[]) => {
    const possibleValues = cartesianProduct(previousValues, nextValues, (x, y) => x + y).sort(
        (a, b) => a - b
    );

    removeDuplicates(possibleValues);

    return getValidValues(possibleValues);
};

export const getHandValue = (values: number[]) => {
    return [...values].reverse().find((x) => x <= maximumScore) || values[0];
};

export const getHandKey = (hand: Hand) => {
    const sortedSymbols = [...hand.cardSymbols].sort();
    return sortedSymbols.join(',');
};
