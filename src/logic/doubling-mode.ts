import { maximumScore } from '../constants';
import { DoublingMode, doublingModeSeparator, ScoreKey } from '../models';
import { ScoreStats } from '../types';

export const canDouble = (scoreStats: ScoreStats, doublingMode: DoublingMode) => {
    return (
        scoreStats.representativeHand.effectiveScore < maximumScore &&
        (doublingMode === DoublingMode.any_pair ||
            doublingMode
                .split(doublingModeSeparator)
                .map((scoreKey) => scoreKey.trim())
                .some((scoreKey) => scoreKey === scoreStats.key) ||
            (doublingMode !== DoublingMode.none &&
                scoreStats.representativeHand.scoreKey === ScoreKey.split5s))
    );
};
