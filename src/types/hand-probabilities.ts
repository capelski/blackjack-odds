import { RelativeProbabilities } from './relative-probabilities';

export type HandProbabilities = {
    equal: RelativeProbabilities;
    higher: RelativeProbabilities;
    lower: RelativeProbabilities;
    overMaximum: number;
};
