import { Paths, ScoreKey } from '../models';
import { Dictionary } from '../types';
import { outcomesSet } from './outcomes-set';

export const getPlayerDecisionDealerCardPath = (scoreKey: ScoreKey, dealerCardKey: ScoreKey) => {
    return Paths.playerDecisionsDealerCard
        .replace(':scoreKey', scoreKey)
        .replace(':dealerCardKey', dealerCardKey);
};

export const getPlayerDecisionScorePath = (scoreKey: ScoreKey) => {
    return Paths.playerDecisionsScore.replace(':scoreKey', scoreKey);
};

const prerenderingRoutesDictionary: Dictionary<string[], Paths> = {
    [Paths.dealerCards]: [Paths.dealerCards],
    [Paths.playerDecisions]: [Paths.playerDecisions],
    [Paths.playerDecisionsDealerCard]: Object.values(ScoreKey).reduce<string[]>(
        (reduced, scoreKey) => {
            return reduced.concat(
                outcomesSet.allOutcomes.map((outcome) => {
                    return getPlayerDecisionDealerCardPath(scoreKey, outcome.key);
                })
            );
        },
        []
    ),
    [Paths.playerDecisionsScore]: Object.values(ScoreKey).map((scoreKey) => {
        return getPlayerDecisionScorePath(scoreKey);
    }),
    [Paths.strategyAndRules]: [Paths.strategyAndRules]
};

export const prerenderingRoutes = Object.values(prerenderingRoutesDictionary).reduce(
    (reduced, next) => reduced.concat(next),
    []
);
