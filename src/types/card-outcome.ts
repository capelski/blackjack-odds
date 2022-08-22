import { CardSymbol, ScoreKey } from '../models';

export type CardOutcome = { key: ScoreKey; symbol: CardSymbol; values: number[]; weight: number };
