import { Action } from '../models';
import { Dictionary } from './dictionary';

export type PlayerActionOverrides = Dictionary<Action>;

export type PlayerActionOverridesByDealerCard = Dictionary<PlayerActionOverrides>;
