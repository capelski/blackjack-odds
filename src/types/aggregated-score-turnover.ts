import { Dictionary } from './dictionary';
import { Turnover } from './turnover';

export type AggregatedScoreTurnover = {
    dealerCards: Dictionary<Turnover>;
    individual: Turnover;
};
