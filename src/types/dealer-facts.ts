import { Action } from '../models';
import { Dictionary } from './dictionary';
import { FinalScores } from './final-scores';
import { RepresentativeHand } from './representative-hand';

export type DealerBaseData = {
    finalScores: FinalScores;
};

export type DealerActionData = DealerBaseData & {
    action: Action;
};

export type DealerActionsData = {
    [key: string]: DealerActionData;
};

export type DealerDecision = {
    allActions: DealerActionsData;
    preferences: DealerActionData[];
};

export type DealerDecisions = Dictionary<DealerDecision>;

export type DealerFact = {
    decision: DealerDecision;
    hand: RepresentativeHand;
    weight: number;
};

export type DealerFacts = {
    byCard: Dictionary<DealerFact>;
    byCard_average: DealerBaseData;
};
