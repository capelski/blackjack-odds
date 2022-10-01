import { Paths, ScoreKey } from '../models';

export const getScorePlayerDecisionPath = (scoreKey: ScoreKey) => {
    return Paths.scorePlayerDecisions.replace(':scoreKey', scoreKey);
};
