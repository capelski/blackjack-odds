import { DoublingMode, PlayerStrategy } from '../models';
import { CasinoRules } from '../types';
import { getDefaultSplitOptions } from './split-options';

export const getDefaultCasinoRues = (playerStrategy: PlayerStrategy): CasinoRules => {
    return {
        blackjackPayout: true,
        doublingMode: DoublingMode.nine_ten_eleven_plus_soft,
        splitOptions: getDefaultSplitOptions(playerStrategy)
    };
};
