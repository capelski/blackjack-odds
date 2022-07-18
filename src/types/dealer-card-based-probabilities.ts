import { PlayerDecision, ScoreKey } from '../models';
import { Dictionary } from './dictionary';
import { EffectiveScoreProbabilities } from './effective-score-probabilities';

export type ScoreDealerBasedFacts = {
    edge: number;
    facts: ScoreAllDealerCardBasedFacts;
};

export type AllScoreDealerCardBasedProbabilities = Dictionary<ScoreDealerBasedFacts, ScoreKey>;

export type DealerCardBasedFacts = {
    decision: PlayerDecision;
    edge: number;
    hit: EffectiveScoreProbabilities;
    hitBustingProbability: number;
    hitDealerBustingProbability: number;
    hitEqualOrMoreThanDealerProbability: number;
    hitLessThanCurrentProbability: number;
    hitLessThanDealerProbability: number;
    stand: EffectiveScoreProbabilities;
    standDealerBustingProbability: number;
    standEqualOrMoreThanDealerProbability: number;
    standLessThanDealerProbability: number;
};

export type ScoreAllDealerCardBasedFacts = Dictionary<DealerCardBasedFacts, ScoreKey>;
