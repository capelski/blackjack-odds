import { PlayerStrategy } from '../models';
import { PlayerSettings } from '../types';

export const getDefaultPlayerSettings = (): PlayerSettings => ({
    bustingThreshold: 50,
    playerDecisionsOverrides: {},
    playerStrategy: PlayerStrategy.maximumPayout_hit_stand_double_split,
    standThreshold: 16
});
