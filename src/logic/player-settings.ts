import { defaultStandThreshold } from '../constants';
import { PlayerStrategy } from '../models';
import { PlayerSettings } from '../types';

export const defaultPlayerStrategy = PlayerStrategy.maximumPayout_hit_stand_double_split;

export const getDefaultPlayerSettings = (): PlayerSettings => ({
    playerDecisionsOverrides: {},
    playerStrategy: defaultPlayerStrategy,
    standThreshold: defaultStandThreshold
});
