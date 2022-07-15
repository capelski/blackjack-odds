import toposort from 'toposort';
import { maximumScore } from '../constants';
import { ScoreKey } from '../models';
import { CardOutcome, Dictionary, Hand, OutcomesSet } from '../types';
import { cartesianProduct, removeDuplicates } from '../utils';

const createHand = (cardOutcome: CardOutcome, previousHand: Hand | undefined): Hand => {
    const handScores = previousHand
        ? getHandNextScores(previousHand.allScores, cardOutcome.values)
        : cardOutcome.values;
    const cardSymbols = previousHand
        ? previousHand.cardSymbols.concat([cardOutcome.symbol])
        : [cardOutcome.symbol];

    return {
        allScores: handScores,
        cardSymbols,
        descendants: [],
        effectiveScore: getHandScore(handScores),
        key: [...cardSymbols].sort().join(','),
        lastCard: cardOutcome,
        scoreKey: <ScoreKey>handScores.join('/')
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

const getHandNextScores = (previousScores: number[], nextValues: number[]) => {
    const possibleScores = cartesianProduct(previousScores, nextValues, (x, y) => x + y).sort(
        (a, b) => a - b
    );

    removeDuplicates(possibleScores);

    return getValidScores(possibleScores);
};

const getHandScore = (scores: number[]) => {
    return getValidScores(scores).reverse()[0];
};

const getValidScores = (scores: number[]) => {
    const validScores = scores.filter((x) => !isBustScore(x));
    return validScores.length > 0 ? validScores : [scores[0]];
};

/** Returns true if the score is bust (i.e. bigger than the maximum score) */
export const isBustScore = (score: number) => {
    return score > maximumScore;
};
