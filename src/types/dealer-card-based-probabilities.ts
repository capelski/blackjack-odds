import { PlayerDecision, ScoreKey } from '../models';
import { DecisionOutcome } from './decision-outcome';
import { Dictionary } from './dictionary';
import { EffectiveScoreProbabilities } from './effective-score-probabilities';
import { PlayerAdvantage } from './player-advantage';

export type ScoreDealerBasedFacts = DecisionOutcome & {
    facts: ScoreAllDealerCardBasedFacts;
    playerAdvantage: PlayerAdvantage;
};

export type AllScoreDealerCardBasedProbabilities = DecisionOutcome & {
    facts: AllScoreDealerCardBasedFacts;
    playerAdvantage: PlayerAdvantage;
};

export type AllScoreDealerCardBasedFacts = Dictionary<ScoreDealerBasedFacts, ScoreKey>;

export type DealerCardBasedFacts = {
    decision: PlayerDecision;
    [PlayerDecision.hit]: {
        decisionOutcome: DecisionOutcome;
        probabilities: EffectiveScoreProbabilities;
    };
    hitBustingProbability: number;
    hitDealerBustingProbability: number;
    hitEqualToDealerProbability: number;
    hitMoreThanDealerProbability: number;
    hitLessThanCurrentProbability: number;
    hitLessThanDealerProbability: number;
    hitTotalProbability: number;
    [PlayerDecision.stand]: {
        decisionOutcome: DecisionOutcome;
        probabilities: EffectiveScoreProbabilities;
    };
    standDealerBustingProbability: number;
    standEqualToDealerProbability: number;
    standMoreThanDealerProbability: number;
    standLessThanDealerProbability: number;
    standTotalProbability: number;
};

export type ScoreAllDealerCardBasedFacts = Dictionary<DealerCardBasedFacts, ScoreKey>;
