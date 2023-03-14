import { Card } from './card';

export type HandCodes = {
    /** E.g. "BJ", "A,10 (after split)", "9", "6,6 (after split)" */
    display: string;
    /** E.g. "21.5", "11/21", "double9", "6,6 (after split)" */
    processing: string;
    /** E.g. "A,10", "A,10", "7,2", "6,6" */
    symbols: string;
};

export type HandQueueItem = {
    cards: Card[];
    codes: HandCodes;
    isPostSplit?: boolean;
};

export type NextHand = HandQueueItem & {
    weight: number;
};

// TODO Rename to Hand
export type RepresentativeHand = {
    allScores: number[];
    canDouble: boolean;
    canSplit: boolean;
    codes: HandCodes;
    codeSynonyms: string[];
    displayKey: string;
    effectiveScore: number;
    isActive: boolean;
    isBlackjack: boolean;
    isBust: boolean;
    isDealerHand: boolean;
    isPostSplit: boolean;
    nextHands: NextHand[];
    playerHand: {
        isInitial: boolean;
        weight: number;
    };
    splitNextHands: NextHand[];
};
