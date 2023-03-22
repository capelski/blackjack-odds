import { blackjackScore, maximumScore, scoreKeySeparator } from '../constants';
import { CardSymbol, DoublingMode } from '../models';
import {
    Card,
    CasinoRules,
    Dictionary,
    HandCodes,
    HandQueueItem,
    NextHand,
    RepresentativeHand
} from '../types';
import { cartesianProduct, removeDuplicates } from '../utils';
import { getCards, getCardSet } from './card-set';

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
    return (
        casinoRules.splitOptions.allowed &&
        /* To break circular dependencies between split hands, a splitted hand can not be re-splitted */
        !isPostSplit &&
        cards.length === 2 &&
        cards[0].symbol === cards[1].symbol
    );
};

const createHand = (
    cards: Card[],
    codes: HandCodes,
    casinoRules: CasinoRules,
    isPostSplit = false
): RepresentativeHand => {
    const allScores = mergeScores(cards, casinoRules, isPostSplit);
    const effectiveScore = getHandEffectiveScore(allScores);
    const isForbiddenHit =
        isPostSplit && cards[0].symbol === CardSymbol.ace && !casinoRules.splitOptions.hitSplitAces;
    const isActive = effectiveScore < maximumScore && !isForbiddenHit;
    const isBlackjack_ = isBlackjack(cards, casinoRules, isPostSplit);
    const isBust = isBustScore(effectiveScore);
    const canDouble_ = canDouble(cards, casinoRules, isPostSplit);
    const canSplit_ = canSplit(cards, casinoRules, isPostSplit);

    const cardSet = getCardSet();

    const nextHands = isActive
        ? cardSet.cards.map((card): NextHand => {
              const nextCards = cards.concat([card]);
              return {
                  cards: nextCards,
                  codes: getHandCodes(nextCards, casinoRules),
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
                      codes: getHandCodes(nextCards, casinoRules, true),
                      isPostSplit: true,
                      weight: card.weight / cardSet.weight
                  };
              })
            : [];

    return {
        allScores,
        canDouble: canDouble_,
        canSplit: canSplit_,
        codes,
        dealerHand: {
            isInitial: cards.length === 1,
            weight: cards.length === 1 ? cards[0].weight / cardSet.weight : 0
        },
        effectiveScore,
        isActive,
        isBlackjack: isBlackjack_,
        isBust,
        isForbiddenHit,
        isPostSplit,
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
    const handsQueue = cardSet.cards.map((card): HandQueueItem => {
        const cards = [card];
        return {
            cards: cards,
            codes: getHandCodes(cards, casinoRules)
        };
    });
    const processedHandCodes: Dictionary<HandCodes> = {};
    const allHands: Dictionary<RepresentativeHand> = {};
    const initialWeights: Dictionary<number> = {};

    while (handsQueue.length > 0) {
        const { cards, codes, isPostSplit } = handsQueue.shift()!;

        processedHandCodes[codes.processing] = codes;

        if (allHands[codes.processing] === undefined) {
            allHands[codes.processing] = createHand(cards, codes, casinoRules, isPostSplit);
        } else {
            throw new Error(`${codes.processing} is being processed twice`);
        }

        const potentialNextHands: NextHand[] = [];

        if (allHands[codes.processing].isActive) {
            potentialNextHands.push(...allHands[codes.processing].nextHands);

            if (cards.length === 1) {
                // Next hands are player initial hands
                allHands[codes.processing].nextHands.forEach((nextHand) => {
                    initialWeights[nextHand.codes.processing] =
                        (initialWeights[nextHand.codes.processing] || 0) +
                        (nextHand.cards[0].weight * nextHand.cards[1].weight) / cardSet.weight ** 2;
                });
            }

            if (allHands[codes.processing].canSplit) {
                potentialNextHands.push(...allHands[codes.processing].splitNextHands);
            }
        }

        potentialNextHands.forEach((nextHand) => {
            if (!processedHandCodes[nextHand.codes.processing]) {
                processedHandCodes[nextHand.codes.processing] = nextHand.codes;
                handsQueue.push(nextHand);
            } else {
                /** Note that manipulating displayEquivalences works only as long as createHand
                 * keeps a reference to the handCodes object in the processedHandCodes dictionary */
                const { displayEquivalences } = processedHandCodes[nextHand.codes.processing];
                if (!displayEquivalences.includes(nextHand.codes.display)) {
                    displayEquivalences.push(nextHand.codes.display);
                }
            }
        });
    }

    Object.keys(initialWeights).forEach((handKey) => {
        allHands[handKey].playerHand = {
            isInitial: true,
            weight: initialWeights[handKey]
        };
    });

    const allHandsArray = Object.values(allHands).filter(
        (x) => !x.isBust && !x.dealerHand.isInitial
    );
    allHandsArray.forEach((hand) => hand.codes.displayEquivalences.sort(sortHandCodes));

    return allHands;
};

const getHandCodeSymbols = (cards: Card[]): string => {
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

const getHandCodes = (cards: Card[], casinoRules: CasinoRules, isPostSplit = false): HandCodes => {
    const symbols = getHandCodeSymbols(cards);
    const requiresPostSplit =
        isPostSplit &&
        (canSplit(cards, casinoRules, false) || // Split hands cannot be re-splitted
            isBlackjack(cards, casinoRules, false) || // Post split blackjacks depend on casino rules
            (isPostSplit && cards[0].symbol === CardSymbol.ace)); // Hitting split aces depends on casino rules
    const display = `${symbols}${requiresPostSplit ? ' (after split)' : ''}`;

    const scores = mergeScores(cards, casinoRules, isPostSplit).join(scoreKeySeparator);

    const processing =
        cards.length === 1
            ? `dealer${cards[0].symbol}`
            : canSplit(cards, casinoRules, isPostSplit)
            ? `split${symbols}`
            : requiresPostSplit
            ? `postSplit${symbols}`
            : canDouble(cards, casinoRules, isPostSplit)
            ? `double${scores}`
            : scores;

    const group =
        cards.length === 1
            ? cards[0].symbol
            : isPostSplit &&
              cards[0].symbol === CardSymbol.ace &&
              !casinoRules.splitOptions.hitSplitAces
            ? 'forbiddenHit'
            : canSplit(cards, casinoRules)
            ? getHandCodeSymbols(cards)
            : isBlackjack(cards, casinoRules, isPostSplit)
            ? 'BJ'
            : scores;

    return {
        display,
        displayEquivalences: [display],
        group,
        processing,
        symbols
    };
};

const getHandEffectiveScore = (scores: number[]): number => {
    return [...scores].reverse()[0];
};

/** Returns true if the cards correspond to a Blackjack (i.e. A,10) */
const isBlackjack = (cards: Card[], casinoRules: CasinoRules, isPostSplit = false) => {
    return (
        (!isPostSplit || casinoRules.splitOptions.blackjackAfterSplit) &&
        cards.length === 2 &&
        getHandCodeSymbols(cards) === blackjackSymbols
    );
};

/** Returns true if the score is bust (i.e. bigger than the maximum score) */
export const isBustScore = (score: number) => {
    return score > blackjackScore;
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

export const splitAcesSymbols = getHandCodeSymbols(getCards([CardSymbol.ace, CardSymbol.ace]));
export const blackjackSymbols = getHandCodeSymbols(getCards([CardSymbol.ace, CardSymbol.figure]));
