export type DecisionProbabilities = {
    dealerBusting: number;
    playerBusting: number;
    playerEqualToDealer: number;
    playerLessThanCurrent: number;
    playerLessThanDealer: number;
    playerMoreThanDealer: number;
    total: number;
};
