import { Action, PlayerStrategy } from '../models';

export type PlayerStrategyData = {
    optionalActions: {
        [Action.double]: boolean;
        [Action.split]: boolean;
    };
    standThreshold: {
        active: boolean;
        value: number;
        useInSoftHands: boolean;
    };
    strategy: PlayerStrategy;
};
