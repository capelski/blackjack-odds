import { maximumScore } from '../constants';
import { DoublingMode } from '../models';
import { ScoreStats } from '../types';

export const canDouble = (scoreStats: ScoreStats, doublingMode: DoublingMode) => {
    return (
        scoreStats.representativeHand.effectiveScore < maximumScore &&
        (doublingMode === DoublingMode.any_pair ||
            doublingMode
                .split(',')
                .map((scoreKey) => scoreKey.trim())
                .some((scoreKey) => scoreKey === scoreStats.key))
    );
};
