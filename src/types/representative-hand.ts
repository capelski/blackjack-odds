import { Card } from './card';

export type HandQueueItem = {
    cards: Card[];
    key: string;
    isPostSplit?: boolean;
};

export type NextHand = HandQueueItem & {
    representativeCode: string;
    weight: number;
};

// TODO Rename to Hand
export type RepresentativeHand = {
    allScores: number[];
    canDouble: boolean;
    canSplit: boolean;
    codes: {
        all: string[];
        representative: string;
    };
    displayKey: string;
    effectiveScore: number;
    isActive: boolean;
    isBlackjack: boolean;
    isBust: boolean;
    isDealerHand: boolean;
    isPostSplit: boolean;
    key: string;
    nextHands: NextHand[];
    playerHand: {
        isInitial: boolean;
        weight: number;
    };
    splitNextHands: NextHand[];
};
