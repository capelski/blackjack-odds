export const dealerGroupCodeParam = 'dealerGroupCode';
export const playerGroupCodeParam = 'playerGroupCode';

export enum Paths {
    playerDecisions = '/player-decisions',
    playerDecisionsDealerCard = '/player-decisions/:playerGroupCode/:dealerGroupCode',
    playerDecisionsScore = '/player-decisions/:playerGroupCode',
    strategyAndRules = '/strategy-and-rules'
}
