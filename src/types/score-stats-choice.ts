import { PlayerDecision, ScoreKey } from '../models';
import { AllDecisionsData } from './decision-data';
import { DecisionOutcome } from './decision-outcome';
import { Dictionary } from './dictionary';
import { FinalScoreProbabilities } from './final-score-probabilities';

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
 *      1/11: { choice: 'Hit', decisions: { ... }, finalScoreProbabilities: { ... } },
 *      2: { choice: 'Hit', decisions: { ... }, finalScoreProbabilities: { ... } },
 *      ...
 *      10: { choice: 'Hit', decisions: { ... }, finalScoreProbabilities: { ... } },
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
    finalScoreProbabilities: FinalScoreProbabilities;
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
 *      },
 *      finalScoreProbabilities:  * {
 *          17: 0.0769,
 *          18: 0.0769,
 *          ...
 *      }
 * }
 */
export type ScoreStatsDealerCardChoice = {
    choice: PlayerDecision;
    decisions: AllDecisionsData;
    finalScoreProbabilities: FinalScoreProbabilities;
};
