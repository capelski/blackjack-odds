import { AggregatedScoreTurnover } from './aggregated-score-turnover';
import { Dictionary } from './dictionary';
import { Turnover } from './turnover';

export type AllTurnovers = {
    overall: Turnover;
    scores: Dictionary<AggregatedScoreTurnover>;
};
