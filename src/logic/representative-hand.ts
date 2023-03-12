import { blackjackScore, maximumScore, scoreKeySeparator } from '../constants';
import { CardSymbol, DoublingMode } from '../models';
import {
    Card,
    CasinoRules,
    Dictionary,
    HandQueueItem,
    NextHand,
    RepresentativeHand
} from '../types';
import { cartesianProduct, removeDuplicates } from '../utils';
import { getCardSet } from './card-set';

const canDouble = (cards: Card[], casinoRules: CasinoRules, isPostSplit = false) => {
    if (cards.length !== 2 || (isPostSplit && !casinoRules.splitOptions.doubleAfterSplit)) {
        return false;
    }

    const scores = JSON.stringify(mergeScores(cards, casinoRules));

    const nine_ten_eleven = [[9], [10], [11]].map((x) => JSON.stringify(x));
    const soft_nineteen_soft_twenty = [
        [9, 19],
        [10, 20]
    ].map((x) => JSON.stringify(x));
    const nine_ten_eleven_plus_soft = [...nine_ten_eleven, ...soft_nineteen_soft_twenty];

    return (
        casinoRules.doublingMode === DoublingMode.any_pair ||
        (casinoRules.doublingMode === DoublingMode.nine_ten_eleven_plus_soft &&
            nine_ten_eleven_plus_soft.includes(scores)) ||
        (casinoRules.doublingMode === DoublingMode.nine_ten_eleven &&
            nine_ten_eleven.includes(scores))
    );
};

const canSplit = (cards: Card[], casinoRules: CasinoRules, isPostSplit = false) => {
    return casinoRules.splitOptions.allowed && isPotentialSplitHand(cards, isPostSplit);
};

const createHand = (
    cards: Card[],
    casinoRules: CasinoRules,
    isPostSplit = false
): RepresentativeHand => {
    const allScores = mergeScores(cards, casinoRules, isPostSplit);
    const code = getHandCode(cards);
    const displayKey = getHandDisplayKey(cards, casinoRules, isPostSplit);
    const effectiveScore = getHandEffectiveScore(allScores);
    const isActive =
        effectiveScore < maximumScore &&
        (!isPostSplit ||
            code !== getHandCodeFromSymbols([CardSymbol.ace, CardSymbol.ace]) ||
            casinoRules.splitOptions.hitSplitAces);
    const isBlackjack_ = isBlackjack(cards, casinoRules, isPostSplit);
    const isBust = isBustScore(effectiveScore);
    const key = getHandKey(cards, casinoRules, isPostSplit);
    const canDouble_ = canDouble(cards, casinoRules, isPostSplit);
    const canSplit_ = canSplit(cards, casinoRules, isPostSplit);

    const cardSet = getCardSet();

    const nextHands = isActive
        ? cardSet.cards.map((card): NextHand => {
              const nextCards = cards.concat([card]);
              return {
                  cards: nextCards,
                  key: getHandKey(nextCards, casinoRules),
                  representativeCode: getHandRepresentativeCode(nextCards),
                  weight: card.weight / cardSet.weight
              };
          })
        : [];

    const splitNextHands =
        isActive && canSplit_
            ? cardSet.cards.map((card): NextHand => {
                  const nextCards = [cards[0], card];
                  return {
                      cards: nextCards,
                      key: getHandKey(nextCards, casinoRules, true),
                      isPostSplit: true,
                      representativeCode: getHandRepresentativeCode(nextCards, true),
                      weight: card.weight / cardSet.weight
                  };
              })
            : [];

    return {
        allScores,
        canDouble: canDouble_,
        canSplit: canSplit_,
        codes: {
            all: isBust ? [] : [code],
            representative: getHandRepresentativeCode(cards, isPostSplit)
        },
        displayKey,
        effectiveScore,
        isActive,
        isBlackjack: isBlackjack_,
        isDealerHand: cards.length === 1,
        isBust,
        isPostSplit,
        key,
        nextHands,
        playerHand: {
            // This gets populated after all hans have been processed
            isInitial: false,
            weight: 0
        },
        splitNextHands
    };
};

/**
 * Returns a dictionary of all representative hands, indexed by hand key
 */
export const getAllRepresentativeHands = (casinoRules: CasinoRules) => {
    const cardSet = getCardSet();
    const handsQueue = cardSet.cards.map<HandQueueItem>((card) => ({
        cards: [card],
        key: getHandKey([card], casinoRules)
    }));
    const processedHands: Dictionary<boolean> = {};
    const allHands: Dictionary<RepresentativeHand> = {};
    const initialWeights: Dictionary<number> = {};

    while (handsQueue.length > 0) {
        const { cards, isPostSplit, key } = handsQueue.shift()!;
        const code = getHandCode(cards);

        if (allHands[key] === undefined) {
            allHands[key] = createHand(cards, casinoRules, isPostSplit);
        } else if (!allHands[key].codes.all.includes(code)) {
            allHands[key].codes.all.push(code);
            allHands[key].codes.all.sort(sortHandCodes);
        }

        if (allHands[key].isActive) {
            allHands[key].nextHands.forEach((nextHand) => {
                const scores = mergeScores(nextHand.cards, casinoRules);
                const nextHandScore = getHandEffectiveScore(scores);
                const isBust = isBustScore(nextHandScore);

                if (isBust && allHands[nextHand.key] === undefined) {
                    allHands[nextHand.key] = createHand(nextHand.cards, casinoRules);
                } else if (!isBust) {
                    if (!processedHands[nextHand.representativeCode]) {
                        handsQueue.push(nextHand);
                        processedHands[nextHand.representativeCode] = true;
                    }
                    if (nextHand.cards.length === 2) {
                        initialWeights[nextHand.key] =
                            (initialWeights[nextHand.key] || 0) +
                            (nextHand.cards[0].weight * nextHand.cards[1].weight) /
                                cardSet.weight ** 2;
                    }
                }
            });

            if (allHands[key].canSplit) {
                allHands[key].splitNextHands.forEach((nextHand) => {
                    if (!processedHands[nextHand.representativeCode]) {
                        handsQueue.push(nextHand);
                        processedHands[nextHand.representativeCode] = true;
                    }
                });
            }
        }
    }

    Object.keys(initialWeights).forEach((handKey) => {
        allHands[handKey].playerHand = {
            isInitial: true,
            weight: initialWeights[handKey]
        };
    });

    return allHands;
};

const getHandCode = (cards: Card[]): string => {
    return cards
        .map((c) => c.symbol)
        .sort((a, b) => {
            const numericA = parseInt(a);
            const numericB = parseInt(b);

            return isNaN(numericA) && isNaN(numericB)
                ? 0
                : isNaN(numericA)
                ? -1
                : isNaN(numericB)
                ? 1
                : numericB - numericA;
        })
        .join(',');
};

export const getHandCodeFromSymbols = (cardSymbols: CardSymbol[]) => {
    const cardSet = getCardSet();
    const cards = cardSymbols.map(
        (symbol) => cardSet.cards.find((card) => card.symbol === symbol)!
    );
    return getHandCode(cards);
};

const getHandDisplayKey = (
    cards: Card[],
    casinoRules: CasinoRules,
    isPostSplit = false
): string => {
    const canSplit_ = canSplit(cards, casinoRules, isPostSplit);
    const isBlackjack_ = isBlackjack(cards, casinoRules, isPostSplit);

    return cards.length === 1
        ? cards[0].symbol
        : canSplit_
        ? getHandCode(cards)
        : isBlackjack_
        ? 'BJ'
        : mergeScores(cards, casinoRules, isPostSplit).join(scoreKeySeparator);
};

const getHandEffectiveScore = (scores: number[]): number => {
    return [...scores].reverse()[0];
};

/** Returns the representative hand key for the given set of card outcomes
 * (e.g. [2,3,7] => 12, [10, A] => BJ, etc.)
 */
export const getHandKey = (
    cards: Card[],
    casinoRules: CasinoRules,
    isPostSplit = false
): string => {
    const scores = mergeScores(cards, casinoRules, isPostSplit).join(scoreKeySeparator);

    return cards.length === 1
        ? `dealer${cards[0].symbol}`
        : cards.length === 2
        ? `special${
              isPotentialSplitHand(cards, isPostSplit)
                  ? cards.map((c) => c.symbol).join(',')
                  : scores
          }`
        : scores;
};

/** Some hands have special restrictions after split (e.g. 2,2 after split is 4) and,
 * even though their code matches and existing hand, they must be processed separately
 */
const getHandRepresentativeCode = (cards: Card[], isPostSplit = false): string => {
    const code = getHandCode(cards);
    return `${code}${isPostSplit ? ' (after split)' : ''}`;
};

/** Returns true if the cards correspond to a Blackjack (i.e. A,10) */
export const isBlackjack = (cards: Card[], casinoRules: CasinoRules, isPostSplit = false) => {
    return (
        (!isPostSplit || casinoRules.splitOptions.blackjackAfterSplit) &&
        cards.length === 2 &&
        getHandCode(cards) === getHandCodeFromSymbols([CardSymbol.ace, CardSymbol.figure])
    );
};

/** Returns true if the score is bust (i.e. bigger than the maximum score) */
export const isBustScore = (score: number) => {
    return score > blackjackScore;
};

const isPotentialSplitHand = (cards: Card[], isPostSplit = false) => {
    /* To break circular dependencies between split hands, a splitted hand can not be re-splitted */
    return !isPostSplit && cards.length === 2 && cards[0].symbol === cards[1].symbol;
};

const mergeScores = (cards: Card[], casinoRules: CasinoRules, isPostSplit = false): number[] => {
    return isBlackjack(cards, casinoRules, isPostSplit)
        ? [blackjackScore]
        : cards
              .map((c) => c.values)
              .reduce((reduced, next) => {
                  if (reduced.length === 0) {
                      return next;
                  }

                  const possibleScores = cartesianProduct(reduced, next, (x, y) => x + y).sort(
                      (a, b) => a - b
                  );
                  removeDuplicates(possibleScores);

                  const validScores = possibleScores.filter((x) => !isBustScore(x));
                  return validScores.length > 0 ? validScores : [possibleScores[0]];
              }, []);
};

export const sortHandCodes = (a: string, b: string): number => {
    const aSymbols = a.split(',');
    const bSymbols = b.split(',');

    if (aSymbols.length !== bSymbols.length) {
        return aSymbols.length - bSymbols.length;
    }

    const maxLength = Math.max(aSymbols.length, bSymbols.length);
    for (let i = 0; i < maxLength; ++i) {
        const aSymbol = aSymbols[i];
        const bSymbol = bSymbols[i];

        if (aSymbol === CardSymbol.ace && bSymbol !== CardSymbol.ace) {
            return -1;
        } else if (aSymbol !== CardSymbol.ace && bSymbol === CardSymbol.ace) {
            return 1;
        } else {
            const aNumber = parseInt(aSymbol);
            const bNumber = parseInt(bSymbol);
            return bNumber - aNumber;
        }
    }
    return 0;
};
