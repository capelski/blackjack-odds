import { DoublingMode } from '../models';
import { CasinoRules } from '../types';
import { getDefaultSplitOptions } from './split-options';

export const getDefaultCasinoRues = (): CasinoRules => {
    return {
        blackjackPayout: true,
        doublingMode: DoublingMode.nine_ten_eleven_plus_soft,
        splitOptions: getDefaultSplitOptions()
    };
};
