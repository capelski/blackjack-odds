import { PlayerDecision } from '../models';
import { Dictionary } from './dictionary';

export type PlayerDecisionsOverrides = Dictionary<Dictionary<PlayerDecision>>;
