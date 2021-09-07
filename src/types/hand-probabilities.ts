import { RelativeProbabilities } from './relative-probabilities';

export type HandProbabilities = {
    canHit: boolean;
    equal: RelativeProbabilities;
    higher: RelativeProbabilities;
    lower: RelativeProbabilities;
    overMaximum: number;
};
