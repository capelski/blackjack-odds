import { PlayerDecision } from '../models';
import { DecisionOutcome } from './decision-outcome';
import { DecisionProbabilityBreakdown } from './decision-probability-breakdown';
import { Dictionary } from './dictionary';
import { FinalScoreProbabilities } from './final-score-probabilities';

export type AllDecisionsData = Dictionary<DecisionData, PlayerDecision>;

export type DecisionData = {
    outcome: DecisionOutcome;
    finalProbabilities: FinalScoreProbabilities;
    probabilityBreakdown: DecisionProbabilityBreakdown;
};
