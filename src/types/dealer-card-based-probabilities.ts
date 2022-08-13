import { PlayerDecision, ScoreKey } from '../models';
import { Dictionary } from './dictionary';
import { EffectiveScoreProbabilities } from './effective-score-probabilities';

export type ScoreDealerBasedFacts = {
    facts: ScoreAllDealerCardBasedFacts;
    lossProbability: number;
    pushProbability: number;
    totalProbability: number;
    winProbability: number;
};

export type AllScoreDealerCardBasedProbabilities = {
    facts: AllScoreDealerCardBasedFacts;
    lossProbability: number;
    pushProbability: number;
    totalProbability: number;
    winProbability: number;
};

export type AllScoreDealerCardBasedFacts = Dictionary<ScoreDealerBasedFacts, ScoreKey>;

export type DealerCardBasedFacts = {
    decision: PlayerDecision;
    hit: EffectiveScoreProbabilities;
    hitBustingProbability: number;
    hitDealerBustingProbability: number;
    hitEqualToDealerProbability: number;
    hitMoreThanDealerProbability: number;
    hitLessThanCurrentProbability: number;
    hitLessThanDealerProbability: number;
    lossProbability: number;
    pushProbability: number;
    totalProbability: number;
    stand: EffectiveScoreProbabilities;
    standDealerBustingProbability: number;
    standEqualToDealerProbability: number;
    standMoreThanDealerProbability: number;
    standLessThanDealerProbability: number;
    winProbability: number;
};

export type ScoreAllDealerCardBasedFacts = Dictionary<DealerCardBasedFacts, ScoreKey>;
