import { Dictionary, AggregatedScore } from '.';
import { AggregatedScoreAction } from './aggregated-score-action';
import { Turnover } from './turnover';

export type AggregatedScoreAllActions = {
    allActions: Dictionary<AggregatedScoreAction>;
    aggregatedScore: AggregatedScore;
    turnover: Turnover;
};
