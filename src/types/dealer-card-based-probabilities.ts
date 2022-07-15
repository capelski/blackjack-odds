import { PlayerDecision, ScoreKey } from '../models';
import { Dictionary } from './dictionary';
import { EffectiveScoreProbabilities } from './effective-score-probabilities';

export type AllScoreDealerCardBasedProbabilities = Dictionary<
    ScoreDealerCardBasedProbabilities,
    ScoreKey
>;

export type DealerCardBasedProbabilities = {
    bustingProbability: number;
    decision: PlayerDecision;
    hit: EffectiveScoreProbabilities;
    lessThanDealerProbability: number;
    lowerScoreProbability: number;
    stand: EffectiveScoreProbabilities;
};

export type ScoreDealerCardBasedProbabilities = Dictionary<
    DealerCardBasedProbabilities,
    ScoreKey // Dealer card key
>;
