import { PlayerDecision, ScoreKey } from '../models';
import { Dictionary } from './dictionary';
import { EffectiveScoreProbabilities } from './effective-score-probabilities';

export type AllScoreDealerCardBasedProbabilities = Dictionary<
    ScoreDealerCardBasedProbabilities,
    ScoreKey
>;

export type DealerCardBasedProbabilities = {
    decision: PlayerDecision;
    hit: EffectiveScoreProbabilities;
    hitBustingProbability: number;
    hitLessThanCurrentProbability: number;
    hitLessThanDealerProbability: number;
    stand: EffectiveScoreProbabilities;
    standLessThanDealerProbability: number;
};

export type ScoreDealerCardBasedProbabilities = Dictionary<
    DealerCardBasedProbabilities,
    ScoreKey // Dealer card key
>;
