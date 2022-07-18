import { PlayerDecision, ScoreKey } from '../models';
import { Dictionary } from './dictionary';
import { EffectiveScoreProbabilities } from './effective-score-probabilities';

export type ScoreDealerBasedFacts = {
    facts: ScoreAllDealerCardBasedFacts;
    lossProbability: number;
};

export type AllScoreDealerCardBasedProbabilities = Dictionary<ScoreDealerBasedFacts, ScoreKey>;

export type DealerCardBasedFacts = {
    decision: PlayerDecision;
    hit: EffectiveScoreProbabilities;
    hitBustingProbability: number;
    hitDealerBustingProbability: number;
    hitEqualOrMoreThanDealerProbability: number;
    hitLessThanCurrentProbability: number;
    hitLessThanDealerProbability: number;
    lossProbability: number;
    stand: EffectiveScoreProbabilities;
    standDealerBustingProbability: number;
    standEqualOrMoreThanDealerProbability: number;
    standLessThanDealerProbability: number;
};

export type ScoreAllDealerCardBasedFacts = Dictionary<DealerCardBasedFacts, ScoreKey>;
