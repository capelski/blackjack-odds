import { CardSymbol, ScoreKey } from '../models';
import { CardOutcome } from './card-outcome';

export type Hand = SplitHand & {
    hitDescendants: Hand[];
    splitDescendants: SplitHand[];
};

export type SplitHand = {
    allScores: number[];
    cardSymbols: CardSymbol[];
    effectiveScore: number;
    key: string;
    lastCard: CardOutcome;
    scoreKey: ScoreKey;
};
