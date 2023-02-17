import toposort from 'toposort';
import { blackjackScore, handKeySeparator, maximumScore, scoreKeySeparator } from '../constants';
import { CardSymbol, DoublingMode, doublingModeSeparator, ScoreKey } from '../models';
import { CardOutcome, Dictionary, Hand, SplitOptions } from '../types';
import { cartesianProduct, removeDuplicates } from '../utils';
import { getOutcomesSet } from './outcomes-set';
import { isSplitEnabled } from './split-options';

export const canDouble = (hand: Hand, doublingMode: DoublingMode) => {
    return (
        hand.effectiveScore < maximumScore &&
        (doublingMode === DoublingMode.any_pair ||
            doublingMode
                .split(doublingModeSeparator)
                .map((scoreKey) => scoreKey.trim())
                .some((scoreKey) => scoreKey === hand.scoreKey) ||
            (doublingMode !== DoublingMode.none && hand.scoreKey === ScoreKey.split5s))
    );
};

export const canSplit = (cardSymbols: CardSymbol[], splitAllowed: boolean) => {
    return splitAllowed && cardSymbols.length === 2 && cardSymbols[0] === cardSymbols[1];
};

const createHand = (
    cardOutcome: CardOutcome,
    previousHand?: Hand,
    splitAllowed = false,
    isBlackjackAllowed = true
): Hand => {
    const handScores = previousHand
        ? getHandNextScores(previousHand.allScores, cardOutcome.values)
        : cardOutcome.values;
    const cardSymbols = previousHand
        ? previousHand.cardSymbols.concat([cardOutcome.symbol])
        : [cardOutcome.symbol];
    const key = getHandKey(cardSymbols);
    const scoreKey = getHandScoreKey(cardSymbols, handScores, splitAllowed, isBlackjackAllowed);
    const effectiveScore = getHandScore(cardSymbols, handScores);

    return {
        allScores: handScores,
        cardSymbols,
        hitDescendants: [],
        effectiveScore,
        key,
        lastCard: cardOutcome,
        scoreKey,
        splitDescendants: []
    };
};

/**
 * Returns a list of all non-bust hands, topologically sorted by descendants
 */
export const getAllHands = (splitOptions: SplitOptions): Hand[] => {
    const outcomesSet = getOutcomesSet();
    const allHandsDictionary: Dictionary<Hand> = {};
    const handsQueue = outcomesSet.allOutcomes.map((cardOutcome) => createHand(cardOutcome));
    const handDependencies: [string, string][] = [];
    const _isSplitEnabled = isSplitEnabled(splitOptions);

    while (handsQueue.length > 0) {
        const hand = handsQueue.pop()!;

        // For better performance (i.e. 30x faster), equivalent hands are computed only once
        // (e.g. 2,3 + 2 and 2,2 + 3 are effectively the same hand)
        if (allHandsDictionary[hand.key] === undefined) {
            allHandsDictionary[hand.key] = hand;
            const splitHand =
                canSplit(hand.cardSymbols, _isSplitEnabled) && createHand(hand.lastCard);

            outcomesSet.allOutcomes.forEach((cardOutcome) => {
                const hitDescendant = createHand(cardOutcome, hand, _isSplitEnabled);
                hand.hitDescendants.push(hitDescendant);

                if (!isBustScore(hitDescendant.effectiveScore)) {
                    handsQueue.push(hitDescendant);
                    handDependencies.push([hand.key, hitDescendant.key]);
                }

                if (splitHand) {
                    const splitDescendant = createHand(
                        cardOutcome,
                        splitHand,
                        false, // Re-splits are not considered
                        splitOptions.blackjackAfterSplit
                    );
                    hand.splitDescendants.push(splitDescendant);
                    if (hand.key !== splitDescendant.key) {
                        // Split hands would introduce cyclic dependencies (e.g. 8,8 can lead to 8,8)
                        handDependencies.push([hand.key, splitDescendant.key]);
                    }
                }
            });
        } else {
            hand.hitDescendants = allHandsDictionary[hand.key].hitDescendants;
        }
    }

    return toposort(handDependencies)
        .reverse()
        .map((key) => allHandsDictionary[key]);
};

const getHandKey = (cardSymbols: CardSymbol[]) => {
    return [...cardSymbols].sort().join(handKeySeparator);
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

const getHandScoreKey = (
    cardSymbols: CardSymbol[],
    handScores: number[],
    splitAllowed: boolean,
    blackjackAllowed: boolean
) => {
    return isBlackjack(cardSymbols) && blackjackAllowed
        ? ScoreKey.blackjack
        : cardSymbols.length === 1 && cardSymbols[0] === CardSymbol.figure
        ? ScoreKey.figure
        : canSplit(cardSymbols, splitAllowed)
        ? <ScoreKey>`${cardSymbols[0]}${handKeySeparator}${cardSymbols[1]}`
        : <ScoreKey>handScores.join(scoreKeySeparator);
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
