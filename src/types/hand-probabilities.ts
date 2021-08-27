import { RelativeProbabilities } from './relative-probabilities';

export type HandProbabilities = {
    opponentRelative: RelativeProbabilities;
    overMaximum: number;
};
