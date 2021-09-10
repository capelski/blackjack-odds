import { RelativeProbabilities } from './relative-probabilities';

export type HandProbabilities = {
    equal: RelativeProbabilities;
    higher: RelativeProbabilities;
    isHittingBelowMaximumRisk: boolean;
    lower: RelativeProbabilities;
    overMaximum: number;
};
