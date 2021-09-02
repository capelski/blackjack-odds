import { Action } from './action';
import { AggregatedScore } from './aggregated-score';
import { CardOutcome } from './card-outcome';
import { Dictionary } from './dictionary';

export type OptimalActions = Dictionary<{
    actions: Dictionary<{
        dealerCard: CardOutcome;
        playerAction: Action;
    }>;
    aggregatedScore: AggregatedScore;
}>;
