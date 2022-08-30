import { PlayerDecision, ScoreKey } from '../models';
import { DecisionOutcome } from './decision-outcome';
import { DecisionProbabilities } from './decision-probabilities';
import { Dictionary } from './dictionary';
import { FinalScoreProbabilities } from './final-score-probabilities';
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
    choice: PlayerDecision;
    decisions: Dictionary<
        {
            decisionOutcome: DecisionOutcome;
            decisionProbabilities: DecisionProbabilities;
            probabilities: FinalScoreProbabilities;
        },
        PlayerDecision
    >;
};

export type ScoreAllDealerCardBasedFacts = Dictionary<DealerCardBasedFacts, ScoreKey>;
