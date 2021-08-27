import { CardOutcome } from './card-outcome';

export type Hand = {
    cardSymbols: string[];
    followingHands: Hand[];
    lastCard: CardOutcome;
    score: number;
    scores: number[];
};
