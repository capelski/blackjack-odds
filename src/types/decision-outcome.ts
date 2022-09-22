import { PlayerAdvantage } from './player-advantage';

/**
 * Outcome (i.e. loss/push/win) probability for a given score, a player decision and a dealer card.
 * Includes the corresponding win/loss payout and player advantage.
 */
export type DecisionOutcome = {
    lossPayout: number;
    lossProbability: number;
    playerAdvantage: PlayerAdvantage;
    pushProbability: number;
    totalProbability: number;
    winPayout: number;
    winProbability: number;
};
