import { PlayerDecision } from '../models';
import { DecisionOutcome } from './decision-outcome';
import { DecisionProbabilityBreakdown } from './decision-probability-breakdown';
import { Dictionary } from './dictionary';
import { FinalScoreProbabilities } from './final-score-probabilities';

/**
 * All player decisions' relevant data for a given score and a dealer card.
 *
 * For example:
 * {
 *      Hit: { ... },
 *      Stand: { ... },
 *      ...
 * }
 */
export type AllDecisionsData = Dictionary<DecisionData, PlayerDecision>;

/**
 * Player decision relevant data for a given score and a dealer card
 */
export type DecisionData = {
    available: boolean;
    finalProbabilities: FinalScoreProbabilities;
    outcome: DecisionOutcome;
    probabilityBreakdown: DecisionProbabilityBreakdown;
};
