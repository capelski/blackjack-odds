import { PlayerDecision, ScoreKey } from '../models';
import { DecisionData } from './decision-data';
import { DecisionOutcome } from './decision-outcome';
import { Dictionary } from './dictionary';
import { PlayerAdvantage } from './player-advantage';

export type AllScoreStatsChoices = Dictionary<ScoreStatsChoice, ScoreKey>;

export type AllScoreStatsChoicesSummary = {
    choices: AllScoreStatsChoices;
    outcome: DecisionOutcome;
    playerAdvantage: PlayerAdvantage;
};

export type ScoreStatsAllDealerCardChoices = Dictionary<ScoreStatsDealerCardChoice, ScoreKey>;

export type ScoreStatsChoice = {
    dealerCardChoices: ScoreStatsAllDealerCardChoices;
    decisionOutcome: DecisionOutcome;
    playerAdvantage: PlayerAdvantage;
};

export type ScoreStatsDealerCardChoice = {
    choice: PlayerDecision;
    decisions: Dictionary<DecisionData, PlayerDecision>;
};
