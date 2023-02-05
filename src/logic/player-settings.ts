import { defaultBustingThreshold, defaultStandThreshold } from '../constants';
import { PlayerStrategy } from '../models';
import { PlayerSettings } from '../types';

export const getDefaultPlayerSettings = (): PlayerSettings => ({
    bustingThreshold: defaultBustingThreshold,
    playerDecisionsOverrides: {},
    playerStrategy: PlayerStrategy.maximumPayout_hit_stand_double_split,
    standThreshold: defaultStandThreshold
});
