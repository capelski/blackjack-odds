export const dealerDisplayKeyParam = 'dealerDisplayKey';
export const playerDisplayKeyParam = 'playerDisplayKey';

export enum Paths {
    playerDecisions = '/player-decisions',
    playerDecisionsDealerCard = '/player-decisions/:playerDisplayKey/:dealerDisplayKey',
    playerDecisionsScore = '/player-decisions/:playerDisplayKey',
    strategyAndRules = '/strategy-and-rules'
}
