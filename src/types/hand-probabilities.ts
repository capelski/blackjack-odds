import { Dictionary } from './dictionary';
import { RelativeProbabilities } from './relative-probabilities';

export type HandProbabilities = {
    opponentRelative: Dictionary<RelativeProbabilities>;
    overMaximum: number;
};
