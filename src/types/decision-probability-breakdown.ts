/**
 * Probability of each possible final scenario for a given score, a player decision and a dealer card
 */
export type DecisionProbabilityBreakdown = {
    dealerBusting: number;
    playerBusting: number;
    playerEqualToDealer: number;
    playerLessThanCurrent: number;
    playerLessThanDealer: number;
    playerMoreThanDealer: number;
    total: number;
};
