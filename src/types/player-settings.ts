import { PlayerStrategy } from '../models';
import { PlayerDecisionsOverrides } from './player-decisions-overrides';

export type PlayerSettings = {
    playerDecisionsOverrides: PlayerDecisionsOverrides;
    playerStrategy: PlayerStrategy;
    standThreshold: number;
};
