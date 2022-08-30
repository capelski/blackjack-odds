import { PlayerDecision, ScoreKey } from '../models';
import { ActionOutcome } from './action-outcome';
import { Dictionary } from './dictionary';
import { EffectiveScoreProbabilities } from './effective-score-probabilities';
import { PlayerAdvantage } from './player-advantage';

export type ScoreDealerBasedFacts = ActionOutcome & {
    facts: ScoreAllDealerCardBasedFacts;
    playerAdvantage: PlayerAdvantage;
};

export type AllScoreDealerCardBasedProbabilities = ActionOutcome & {
    facts: AllScoreDealerCardBasedFacts;
    playerAdvantage: PlayerAdvantage;
};

export type AllScoreDealerCardBasedFacts = Dictionary<ScoreDealerBasedFacts, ScoreKey>;

export type DealerCardBasedFacts = {
    decision: PlayerDecision;
    [PlayerDecision.hit]: {
        actionOutcome: ActionOutcome;
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
        actionOutcome: ActionOutcome;
        probabilities: EffectiveScoreProbabilities;
    };
    standDealerBustingProbability: number;
    standEqualToDealerProbability: number;
    standMoreThanDealerProbability: number;
    standLessThanDealerProbability: number;
    standTotalProbability: number;
};

export type ScoreAllDealerCardBasedFacts = Dictionary<DealerCardBasedFacts, ScoreKey>;
