import { PlayerDecision, ScoreKey } from '../models';
import { DecisionData } from './decision-data';
import { DecisionOutcome } from './decision-outcome';
import { Dictionary } from './dictionary';

export type AllScoreStatsChoices = Dictionary<ScoreStatsChoice, ScoreKey>;

export type AllScoreStatsChoicesSummary = {
    choices: AllScoreStatsChoices;
    outcome: DecisionOutcome;
};

export type ScoreStatsAllDealerCardChoices = Dictionary<ScoreStatsDealerCardChoice, ScoreKey>;

export type ScoreStatsChoice = {
    dealerCardChoices: ScoreStatsAllDealerCardChoices;
    decisionOutcome: DecisionOutcome;
};

export type ScoreStatsDealerCardChoice = {
    choice: PlayerDecision;
    decisions: Dictionary<DecisionData, PlayerDecision>;
};
