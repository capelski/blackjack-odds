import { SplitOptions } from '../types';

export const getDefaultSplitOptions = (): SplitOptions => {
    return {
        allowed: true,
        blackjackAfterSplit: false,
        doubleAfterSplit: true,
        hitSplitAces: false
    };
};
