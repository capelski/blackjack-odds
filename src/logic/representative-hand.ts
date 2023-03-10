import {
    blackjackHandKey,
    blackjackScore,
    handKeySeparator,
    maximumScore,
    scoreKeySeparator
} from '../constants';
import { CardSymbol, DoublingMode } from '../models';
import {
    Card,
    CasinoRules,
    Dictionary,
    HandQueueItem,
    NextHand,
    RepresentativeHand,
    SplitOptions,
    SplitRestrictions
} from '../types';
import { cartesianProduct, removeDuplicates } from '../utils';
import { getCardSet } from './card-set';

const canDouble = (
    cards: Card[],
    doublingMode: DoublingMode,
    { forbiddenDouble }: SplitRestrictions = {}
) => {
    if (forbiddenDouble || cards.length !== 2) {
        return false;
    }

    const scores = JSON.stringify(mergeScores(cards));

    const nine_ten_eleven = [[9], [10], [11]].map((x) => JSON.stringify(x));
    const soft_nineteen_soft_twenty = [
        [9, 19],
        [10, 20]
    ].map((x) => JSON.stringify(x));
    const nine_ten_eleven_plus_soft = [...nine_ten_eleven, ...soft_nineteen_soft_twenty];

    return (
        doublingMode === DoublingMode.any_pair ||
        (doublingMode === DoublingMode.nine_ten_eleven_plus_soft &&
            nine_ten_eleven_plus_soft.includes(scores)) ||
        (doublingMode === DoublingMode.nine_ten_eleven && nine_ten_eleven.includes(scores))
    );
};

const canSplit = (
    cards: Card[],
    splitOptions: SplitOptions,
    splitRestrictions: SplitRestrictions = {}
) => {
    return splitOptions.allowed && isPotentialSplitHand(cards, splitRestrictions);
};

const createHand = (
    cards: Card[],
    casinoRules: CasinoRules,
    splitRestrictions: SplitRestrictions = {}
): RepresentativeHand => {
    const allScores = mergeScores(cards, splitRestrictions);
    const code = getHandCode(cards);
    const effectiveScore = getHandEffectiveScore(allScores);
    const isActive = effectiveScore < maximumScore && !splitRestrictions.forbiddenHit;
    const isBlackjack_ = isBlackjack(cards, splitRestrictions);
    const isBust = isBustScore(effectiveScore);
    const key = getHandKey(cards, splitRestrictions);
    const canDouble_ = canDouble(cards, casinoRules.doublingMode, splitRestrictions);
    const canSplit_ = canSplit(cards, casinoRules.splitOptions, splitRestrictions);
    const displayKey = canSplit_
        ? code
        : isBlackjack_
        ? blackjackHandKey
        : cards.length === 1
        ? cards[0].symbol
        : allScores.join(scoreKeySeparator);

    const cardSet = getCardSet();
    const nextHands = isActive
        ? cardSet.cards.map((card): NextHand => {
              const nextCards = cards.concat([card]);
              return {
                  cards: nextCards,
                  key: getHandKey(nextCards),
                  representativeCode: getHandRepresentativeCode(nextCards),
                  weight: card.weight / cardSet.weight
              };
          })
        : [];
    const splitNextHands =
        isActive && canSplit_
            ? cardSet.cards.map((card): NextHand => {
                  const nextCards = [cards[0], card];
                  /* To break circular dependencies between split hands, a splitted hand can not be re-splitted */
                  const forbiddenSplit = true;
                  const nextCode = getHandCode(nextCards);
                  const splitRestrictions: SplitRestrictions = {
                      forbiddenBlackjack: !casinoRules.splitOptions.blackjackAfterSplit,
                      forbiddenDouble: !casinoRules.splitOptions.doubleAfterSplit,
                      forbiddenHit:
                          nextCode === getHandCodeFromSymbols([CardSymbol.ace, CardSymbol.ace]) &&
                          !casinoRules.splitOptions.hitSplitAces,
                      forbiddenSplit
                  };

                  return {
                      cards: nextCards,
                      key: getHandKey(nextCards, splitRestrictions),
                      representativeCode: getHandRepresentativeCode(nextCards, splitRestrictions),
                      splitRestrictions,
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
            representative: getHandRepresentativeCode(cards, splitRestrictions)
        },
        displayKey,
        effectiveScore,
        initialHand: {
            // This gets populated after all hans have been processed
            isInitial: false,
            weight: 0
        },
        isActive,
        isBlackjack: isBlackjack_,
        isSingleCard: cards.length === 1,
        isBust,
        key,
        nextHands,
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
        key: getHandKey([card])
    }));
    const processedHands: Dictionary<boolean> = {};
    const allHands: Dictionary<RepresentativeHand> = {};
    const initialWeights: Dictionary<number> = {};

    while (handsQueue.length > 0) {
        const { cards, key, splitRestrictions } = handsQueue.shift()!;
        const code = getHandCode(cards);

        if (allHands[key] === undefined) {
            allHands[key] = createHand(cards, casinoRules, splitRestrictions);
        } else if (!allHands[key].codes.all.includes(code)) {
            allHands[key].codes.all.push(code);
            allHands[key].codes.all.sort(sortHandCodes);
        }

        if (allHands[key].isActive) {
            allHands[key].nextHands.forEach((nextHand) => {
                const scores = mergeScores(nextHand.cards);
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
        allHands[handKey].initialHand = {
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
        .join(handKeySeparator);
};

const getHandCodeFromSymbols = (cardSymbols: CardSymbol[]) => {
    const cardSet = getCardSet();
    const cards = cardSymbols.map(
        (symbol) => cardSet.cards.find((card) => card.symbol === symbol)!
    );
    return getHandCode(cards);
};

// Some hands have special restrictions after split (e.g. 2,2 after split is 4) and,
// even though their code matches and existing hand, they must be processed separately
const getHandRepresentativeCode = (
    cards: Card[],
    { forbiddenSplit }: SplitRestrictions = {}
): string => {
    const code = getHandCode(cards);
    return `${code}${forbiddenSplit ? ' (postSplit)' : ''}`;
};

const getHandEffectiveScore = (scores: number[]): number => {
    return [...scores].reverse()[0];
};

/** Returns the representative hand key for the given set of card outcomes
 * (e.g. [2,3,7] => 12, [10, A] => BJ, etc.)
 */
export const getHandKey = (cards: Card[], splitRestrictions: SplitRestrictions = {}): string => {
    const scores = mergeScores(cards, splitRestrictions).join(scoreKeySeparator);

    return cards.length === 1
        ? `dealer${cards[0].symbol}`
        : isBlackjack(cards, splitRestrictions)
        ? blackjackHandKey
        : cards.length === 2
        ? `special${
              isPotentialSplitHand(cards, splitRestrictions)
                  ? cards.map((c) => c.symbol).join(',')
                  : scores
          }`
        : scores;
};

/** Returns true if the cards correspond to a Blackjack (i.e. A,10) */
export const isBlackjack = (cards: Card[], { forbiddenBlackjack }: SplitRestrictions = {}) => {
    return (
        !forbiddenBlackjack &&
        cards.length === 2 &&
        getHandCode(cards) === getHandCodeFromSymbols([CardSymbol.ace, CardSymbol.figure])
    );
};

/** Returns true if the score is bust (i.e. bigger than the maximum score) */
export const isBustScore = (score: number) => {
    return score > blackjackScore;
};

const isPotentialSplitHand = (cards: Card[], { forbiddenSplit }: SplitRestrictions = {}) => {
    return !forbiddenSplit && cards.length === 2 && cards[0].symbol === cards[1].symbol;
};

const mergeScores = (cards: Card[], splitRestrictions: SplitRestrictions = {}): number[] => {
    return isBlackjack(cards, splitRestrictions)
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
    const maxLength = Math.max(aSymbols.length, bSymbols.length);
    for (let i = 0; i < maxLength; ++i) {
        const aSymbol = aSymbols[i];
        const bSymbol = bSymbols[i];

        if (aSymbol === bSymbol && aSymbols.length !== bSymbols.length) {
            return aSymbols.length - bSymbols.length;
        } else if (aSymbol === CardSymbol.ace && bSymbol !== CardSymbol.ace) {
            return 1;
        } else if (aSymbol !== CardSymbol.ace && bSymbol === CardSymbol.ace) {
            return -1;
        } else if (aSymbol !== CardSymbol.ace && bSymbol !== CardSymbol.ace) {
            const aNumber = parseInt(aSymbol);
            const bNumber = parseInt(bSymbol);
            if (aNumber !== bNumber) {
                return bNumber - aNumber;
            }
        }
    }
    return 0;
};
