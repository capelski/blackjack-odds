import { ScoreKey } from '../models';
import { Dictionary } from './dictionary';

export type EffectiveScoreProbabilities = Dictionary<number, number>;

export type AllEffectiveScoreProbabilities = Dictionary<EffectiveScoreProbabilities, ScoreKey>;
