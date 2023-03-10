/**
 * Final outcome probabilities for a given player hand, dealer card and action
 */
export type VsDealerOutcome = {
    lossPayout: number;
    lossProbability: number;
    playerAdvantage: {
        hands: number;
        payout: number;
    };
    pushProbability: number;
    totalProbability: number;
    winPayout: number;
    winProbability: number;
};
