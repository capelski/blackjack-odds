import { Card } from './card';

export type HandCodes = {
    /** 1. The plain symbols in the hand cards.
     * E.g. "A,10", "A,10", "7,2", "4,3,2", "6,6", "6,6" */
    symbols: string;

    /** 2. The symbols in the hand cards as they will be displayed.
     * E.g. "A,10", "A,10 (after split)", "7,2", "4,3,2", "6,6", "6,6 (after split)" */
    display: string;

    /** 3. A code that indicates the individual processing required for the hand.
     * E.g. "21.5", "A,10 (after split)", "double9", "9", "6,6", "6,6 (after split)" */
    processing: string;

    /** 4. The hand code as it will be displayed in the player decisions table.
     * E.g. "BJ", "11/21", "9", "9", "6,6", "6,6" */
    group: string;

    /** All display codes that require the same hand processing */
    displayEquivalences: string[];
};

export type HandQueueItem = {
    cards: Card[];
    codes: HandCodes;
    isForbiddenHit?: boolean;
    isForbiddenSplit?: boolean;
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
    dealerHand: {
        isInitial: boolean;
        weight: number;
    };
    effectiveScore: number;
    isActive: boolean;
    isBlackjack: boolean;
    isBust: boolean;
    isForbiddenHit: boolean;
    nextHands: NextHand[];
    playerHand: {
        isInitial: boolean;
        weight: number;
    };
    splitNextHands: NextHand[];
};
