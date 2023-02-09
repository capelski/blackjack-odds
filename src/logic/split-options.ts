import { PlayerStrategy } from '../models';
import { SplitOptions } from '../types';

export const getDefaultSplitOptions = (playerStrategy: PlayerStrategy): SplitOptions => {
    return {
        allowed: true,
        blackjackAfterSplit: false,
        hitSplitAces: false,
        inUse: isSplitInUse(playerStrategy)
    };
};

export const getDisabledSplitOptions = (): SplitOptions => ({
    allowed: false,
    blackjackAfterSplit: false,
    hitSplitAces: false,
    inUse: false
});

export const isSplitEnabled = (splitOptions: SplitOptions) => {
    return splitOptions.allowed && splitOptions.inUse;
};

export const isSplitInUse = (playerStrategy: PlayerStrategy) => {
    return (
        playerStrategy === PlayerStrategy.maximumPayout_hit_stand_split ||
        playerStrategy === PlayerStrategy.maximumPayout_hit_stand_double_split
    );
};
