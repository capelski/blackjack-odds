import { Action, PlayerStrategy } from '../models';
import { PlayerStrategyData } from '../types';

export const getDefaultPlayerStrategy = (): PlayerStrategyData => {
    return {
        optionalActions: {
            [Action.double]: true,
            [Action.split]: true
        },
        standThreshold: {
            active: false,
            value: 16,
            useInSoftHands: false
        },
        strategy: PlayerStrategy.maximumAdvantagePayout
    };
};
