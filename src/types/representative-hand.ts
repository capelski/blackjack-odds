import { Card } from './card';

export type HandQueueItem = {
    cards: Card[];
    key: string;
    splitRestrictions?: SplitRestrictions;
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
    initialHand: {
        isInitial: boolean;
        weight: number;
    };
    isActive: boolean;
    isBlackjack: boolean;
    isBust: boolean;
    isSingleCard: boolean;
    key: string;
    nextHands: NextHand[];
    splitNextHands: NextHand[];
};

export type SplitRestrictions = {
    forbiddenBlackjack?: boolean;
    forbiddenDouble?: boolean;
    forbiddenHit?: boolean;
    forbiddenSplit?: boolean;
};
