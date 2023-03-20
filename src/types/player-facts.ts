import { Action } from '../models';
import { Dictionary } from './dictionary';
import { FinalScores } from './final-scores';
import { RepresentativeHand } from './representative-hand';
import { VsDealerBreakdown } from './vs-dealer-breakdown';
import { VsDealerOutcome } from './vs-dealer-outcome';

export type PlayerAverageData = {
    vsDealerAverage: PlayerBaseData;
    vsDealerCards: PlayerBaseData;
};

export type PlayerBaseData = {
    finalScores: FinalScores;
    vsDealerBreakdown: VsDealerBreakdown;
    vsDealerOutcome: VsDealerOutcome;
};

export type PlayerActionData = PlayerBaseData & {
    action: Action;
    isOverride?: boolean;
    order: number;
};

export type PlayerActionsData = {
    [key: string]: PlayerActionData;
};

export type PlayerDecision = {
    allActions: PlayerActionsData;
    hasOverride: boolean;
    preferences: PlayerActionData[];
};

export type PlayerDecisionWithWeight = PlayerDecision & {
    weight: number;
};

export type PlayerDecisions = Dictionary<PlayerDecision>;

export type PlayerDecisionsWithWeight = Dictionary<PlayerDecisionWithWeight>;

export type PlayerFact = {
    hand: RepresentativeHand;
    vsDealerAverage: PlayerDecision;
    vsDealerCard: PlayerDecisionsWithWeight;
    vsDealerCard_average: PlayerBaseData;
    weight: number;
};

export type PlayerFacts = Dictionary<PlayerFact>;

export type PlayerFactsGroup = {
    allFacts: PlayerFact[];
    code: string;
    combinations: string[];
};

export type GroupedPlayerFacts = PlayerFactsGroup[];
