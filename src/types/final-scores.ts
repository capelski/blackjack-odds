import { Dictionary } from './dictionary';

export type FinalScore = {
    score: number;
    weight: number;
};

export type FinalScores = Dictionary<FinalScore>;
