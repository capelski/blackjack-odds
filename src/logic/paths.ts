import { Paths, ScoreKey } from '../models';
import { Dictionary } from '../types';

export const getScorePlayerDecisionPath = (scoreKey: ScoreKey) => {
    return Paths.scorePlayerDecisions.replace(':scoreKey', scoreKey);
};

const prerenderingRoutesDictionary: Dictionary<string[], Paths> = {
    [Paths.dealerCards]: [Paths.dealerCards],
    [Paths.legend]: [Paths.legend],
    [Paths.playerDecisions]: [Paths.playerDecisions],
    [Paths.scorePlayerDecisions]: Object.values(ScoreKey).map((scoreKey) => {
        return Paths.scorePlayerDecisions.replace(':scoreKey', scoreKey);
    }),
    [Paths.strategyAndRules]: [Paths.strategyAndRules]
};

export const prerenderingRoutes = Object.values(prerenderingRoutesDictionary).reduce(
    (reduced, next) => reduced.concat(next),
    []
);
