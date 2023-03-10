/**
 * Final scenarios probabilities for a given player hand, dealer card and action
 */
export type VsDealerBreakdown = {
    dealerBusting: number;
    playerBusting: number;
    playerEqualToDealer: number;
    playerLessThanCurrent: number;
    playerLessThanDealer: number;
    playerMoreThanDealer: number;
    total: number;
};
