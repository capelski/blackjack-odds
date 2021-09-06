import { Action } from './action';
import { CardOutcome } from './card-outcome';
import { Turnover } from './turnover';

export type AggregatedScoreAction = {
    action: Action;
    dealerCard: CardOutcome;
    turnover: Turnover;
};
