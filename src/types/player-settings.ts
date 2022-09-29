import { PlayerStrategy } from '../models';
import { PlayerDecisionsOverrides } from './player-decisions-overrides';

export type PlayerSettings = {
    bustingThreshold: number;
    playerDecisionsOverrides: PlayerDecisionsOverrides;
    playerStrategy: PlayerStrategy;
    standThreshold: number;
};
