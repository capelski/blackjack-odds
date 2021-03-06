import { ScoreKey } from '../models';
import { Hand } from './hand';

export type ScoreStats = {
    combinations: string[];
    key: ScoreKey;
    representativeHand: Hand;
};
