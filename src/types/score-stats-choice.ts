import { PlayerDecision, ScoreKey } from '../models';
import { AllDecisionsData } from './decision-data';
import { DecisionOutcome } from './decision-outcome';
import { Dictionary } from './dictionary';

/**
 * A dictionary containing an aggregated decision outcome for each possible score
 */
export type AllScoreStatsChoices = Dictionary<ScoreStatsChoice, ScoreKey>;

/**
 * Aggregated decision outcome for all possible scores, including the aggregated
 * decision outcome for each score
 */
export type AllScoreStatsChoicesSummary = {
    choices: AllScoreStatsChoices;
    outcome: DecisionOutcome;
};

/**
 * A dictionary containing each chosen player decision for a given score, depending on
 * the dealer card.
 *
 * For example:
 * {
 *      1/11: { choice: 'Hit', decisions: { ... } },
 *      2: { choice: 'Hit', decisions: { ... } },
 *      ...
 *      10: { choice: 'Hit', decisions: { ... } },
 * }
 */
export type ScoreStatsAllDealerCardChoices = Dictionary<ScoreStatsDealerCardChoice, ScoreKey>;

/**
 * Aggregated decision outcome for a given score, pondering the chosen player decisions
 * for each possible dealer card. Includes all dealer cards' player decisions data.
 */
export type ScoreStatsChoice = {
    dealerCardChoices: ScoreStatsAllDealerCardChoices;
    decisionOutcome: DecisionOutcome;
};

/**
 * The chosen player decision for a given score and a dealer card, including
 * all player decisions' relevant data.
 *
 * For example:
 * {
 *      choice: 'Hit',
 *      decisions: {
 *          Hit: { ... },
 *          Stand: { ... },
 *          ...
 *      }
 * }
 */
export type ScoreStatsDealerCardChoice = {
    choice: PlayerDecision;
    decisions: AllDecisionsData;
};
