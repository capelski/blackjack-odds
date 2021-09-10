import { AggregatedScore } from './aggregated-score';
import { CardOutcome } from './card-outcome';

export type DecisionData = {
    aggregatedScore: AggregatedScore;
    dealerCard: CardOutcome;
    isHittingBelowMaximumRisk: boolean;
    isHittingRiskless: boolean;
    longRunHittingLoss: number;
    longRunStandingLoss: number;
};
