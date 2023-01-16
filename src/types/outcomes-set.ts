import { ScoreKey } from '../models';
import { CardOutcome } from './card-outcome';
import { Dictionary } from './dictionary';

export type OutcomesSet = {
    allOutcomes: CardOutcome[];
    allWeights: Dictionary<number, ScoreKey>;
    totalWeight: number;
};
