import { CardSymbol, ScoreKey } from '../models';
import { CardOutcome } from './card-outcome';

export type Hand = {
    allScores: number[];
    cardSymbols: CardSymbol[];
    descendants: Hand[];
    effectiveScore: number;
    key: string;
    lastCard: CardOutcome;
    scoreKey: ScoreKey;
};
