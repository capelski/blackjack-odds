import { CardOutcome, Dictionary, Hand } from '../types';
import { maximumScore } from './constants';
import { cartesianProduct, getValidScores, removeDuplicates } from './utils';

const createHand = (cardOutcome: CardOutcome, previousHand: Hand | undefined): Hand => {
    const handScores = previousHand
        ? getHandNextScores(previousHand.scores, cardOutcome.values)
        : cardOutcome.values;

    return {
        cardSymbols: previousHand
            ? previousHand.cardSymbols.concat([cardOutcome.symbol])
            : [cardOutcome.symbol],
        followingHands: [],
        lastCard: cardOutcome,
        score: getHandScore(handScores),
        scores: handScores
    };
};

export const getAllHands = (cardOutcomes: CardOutcome[]) => {
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

                if (followingHand.score < maximumScore) {
                    handsQueue.push(followingHand);
                }
            });
        } else {
            hand.followingHands = handsDictionary[handKey].followingHands;
        }
    }

    return { handsDictionary, rootHands };
};

export const getHandKey = (hand: Hand) => {
    const sortedSymbols = [...hand.cardSymbols].sort();
    return sortedSymbols.join(',');
};

const getHandNextScores = (previousScores: number[], nextValues: number[]) => {
    const possibleScores = cartesianProduct(previousScores, nextValues, (x, y) => x + y).sort(
        (a, b) => a - b
    );

    removeDuplicates(possibleScores);

    return getValidScores(possibleScores);
};

export const getHandSymbols = (hand: Hand) => {
    return hand.cardSymbols.join(',');
};

const getHandScore = (scores: number[]) => {
    return [...scores].reverse().find((x) => x <= maximumScore) || scores[0];
};

export const getHandScores = (hand: Hand) => {
    return hand.scores.join('/');
};
