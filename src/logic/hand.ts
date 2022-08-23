import toposort from 'toposort';
import { blackjackScore } from '../constants';
import { CardSymbol, ScoreKey } from '../models';
import { CardOutcome, Dictionary, Hand, OutcomesSet } from '../types';
import { cartesianProduct, removeDuplicates } from '../utils';

const createHand = (cardOutcome: CardOutcome, previousHand: Hand | undefined): Hand => {
    const handScores = previousHand
        ? getHandNextScores(previousHand.allScores, cardOutcome.values)
        : cardOutcome.values;
    const cardSymbols = previousHand
        ? previousHand.cardSymbols.concat([cardOutcome.symbol])
        : [cardOutcome.symbol];
    const key = getHandKey(cardSymbols);
    const scoreKey = getHandScoreKey(cardSymbols, handScores);
    const effectiveScore = getHandScore(cardSymbols, handScores);

    return {
        allScores: handScores,
        cardSymbols,
        descendants: [],
        effectiveScore,
        key,
        lastCard: cardOutcome,
        scoreKey
    };
};

/**
 * Returns a list of all non-bust hands, topologically sorted by descendants
 */
export const getAllHands = (outcomesSet: OutcomesSet): Hand[] => {
    const allHandsDictionary: Dictionary<Hand> = {};
    const handsQueue = outcomesSet.allOutcomes.map((cardOutcome) =>
        createHand(cardOutcome, undefined)
    );
    const handDependencies: [string, string][] = [];

    while (handsQueue.length > 0) {
        const hand = handsQueue.pop()!;

        // For better performance (i.e. 30x faster), equivalent hands are computed only once
        // (e.g. 2,3 + 2 and 2,2 + 3 are effectively the same hand)
        if (allHandsDictionary[hand.key] === undefined) {
            allHandsDictionary[hand.key] = hand;

            outcomesSet.allOutcomes.forEach((cardOutcome) => {
                const descendant = createHand(cardOutcome, hand);

                hand.descendants.push(descendant);

                if (!isBustScore(descendant.effectiveScore)) {
                    handsQueue.push(descendant);
                    handDependencies.push([hand.key, descendant.key]);
                }
            });
        } else {
            hand.descendants = allHandsDictionary[hand.key].descendants;
        }
    }

    return toposort(handDependencies)
        .reverse()
        .map((key) => allHandsDictionary[key]);
};

const getHandKey = (cardSymbols: CardSymbol[]) => {
    return [...cardSymbols].sort().join(',');
};

const getHandNextScores = (previousScores: number[], nextValues: number[]) => {
    const possibleScores = cartesianProduct(previousScores, nextValues, (x, y) => x + y).sort(
        (a, b) => a - b
    );

    removeDuplicates(possibleScores);

    return getValidScores(possibleScores);
};

const getHandScore = (cardSymbols: CardSymbol[], scores: number[]) => {
    return isBlackjack(cardSymbols) ? blackjackScore : getValidScores(scores).reverse()[0];
};

const getHandScoreKey = (cardSymbols: CardSymbol[], handScores: number[]) => {
    return isBlackjack(cardSymbols)
        ? ScoreKey.blackjack
        : cardSymbols.length === 1 && cardSymbols[0] === CardSymbol.figure
        ? ScoreKey.figure
        : <ScoreKey>handScores.join('/');
};

const getValidScores = (scores: number[]) => {
    const validScores = scores.filter((x) => !isBustScore(x));
    return validScores.length > 0 ? validScores : [scores[0]];
};

/** Returns true if the card symbols correspond to a Blackjack (i.e. A,10) */
export const isBlackjack = (cardSymbols: CardSymbol[]) =>
    getHandKey(cardSymbols) === getHandKey([CardSymbol.figure, CardSymbol.ace]);

/** Returns true if the score is bust (i.e. bigger than the maximum score) */
export const isBustScore = (score: number) => {
    return score > blackjackScore;
};
