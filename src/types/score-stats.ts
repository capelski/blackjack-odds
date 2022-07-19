import { ScoreKey } from '../models';
import { Hand } from './hand';

export type ScoreStats = {
    combinations: string[];
    initialHandProbability: number;
    key: ScoreKey;
    representativeHand: Hand;
};
