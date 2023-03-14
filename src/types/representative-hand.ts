import { Card } from './card';

export type HandCodes = {
    processing: string;
    symbols: string;
};

export type HandQueueItem = {
    cards: Card[];
    codes: HandCodes;
    key: string;
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
    key: string;
    nextHands: NextHand[];
    playerHand: {
        isInitial: boolean;
        weight: number;
    };
    splitNextHands: NextHand[];
};
