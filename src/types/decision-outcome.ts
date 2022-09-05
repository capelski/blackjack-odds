import { PlayerAdvantage } from './player-advantage';

export type DecisionOutcome = {
    lossPayout: number;
    lossProbability: number;
    playerAdvantage: PlayerAdvantage;
    pushProbability: number;
    totalProbability: number;
    winPayout: number;
    winProbability: number;
};
