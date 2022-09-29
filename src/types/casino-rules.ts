import { DoublingMode } from '../models';
import { SplitOptions } from './split-options';

export type CasinoRules = {
    blackjackPayout: boolean;
    doublingMode: DoublingMode;
    splitOptions: SplitOptions;
};
