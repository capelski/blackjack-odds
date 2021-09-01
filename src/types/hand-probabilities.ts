import { OpponentProbabilities } from './opponent-probabilities';

export type HandProbabilities = {
    opponentRelative: OpponentProbabilities;
    overMaximum: number;
};
