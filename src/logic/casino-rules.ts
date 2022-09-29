import { DoublingMode } from '../models';
import { CasinoRules } from '../types';

export const getDefaultCasinoRues = (): CasinoRules => ({
    blackjackPayout: true,
    doublingMode: DoublingMode.nine_ten_eleven_plus_soft,
    splitOptions: {
        allowed: true,
        blackjackAfterSplit: false,
        hitSplitAces: false
    }
});
