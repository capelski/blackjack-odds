import { Paths } from '../models';
import { dealerDisplayKeyParam, playerDisplayKeyParam } from '../models/paths';
import { Dictionary } from '../types';
import { getDefaultCasinoRues } from './casino-rules';
import { getAllRepresentativeHands } from './representative-hand';

export const getPlayerDecisionDealerCardPath = (
    playerDisplayKey: string,
    dealerDisplayKey: string
) => {
    return Paths.playerDecisionsDealerCard
        .replace(`:${playerDisplayKeyParam}`, playerDisplayKey)
        .replace(`:${dealerDisplayKeyParam}`, dealerDisplayKey);
};

export const getPlayerDecisionDealerCardParams = (params: Record<string, string | undefined>) => {
    return {
        [dealerDisplayKeyParam]: params[dealerDisplayKeyParam],
        [playerDisplayKeyParam]: params[playerDisplayKeyParam]
    };
};

export const getPlayerDecisionScorePath = (playerDisplayKey: string) => {
    return Paths.playerDecisionsScore.replace(`:${playerDisplayKeyParam}`, playerDisplayKey);
};

export const getPlayerDecisionScoreParams = (params: Record<string, string | undefined>) => {
    return {
        [playerDisplayKeyParam]: params[playerDisplayKeyParam]
    };
};

const allHands = getAllRepresentativeHands(getDefaultCasinoRues());
const playerInitialHandsKey = Object.values(allHands)
    .filter((hand) => hand.initialHand.isInitial)
    .map((hand) => hand.displayKey);
const dealerInitialHandsKey = Object.values(allHands)
    .filter((hand) => hand.isSingleCard)
    .map((hand) => hand.displayKey);

const prerenderingRoutesDictionary: Dictionary<string[], Paths> = {
    [Paths.playerDecisions]: [Paths.playerDecisions],
    [Paths.playerDecisionsDealerCard]: playerInitialHandsKey
        .map((playerDisplayKey) => {
            return dealerInitialHandsKey.map((dealerDisplayKey) => {
                return getPlayerDecisionDealerCardPath(playerDisplayKey, dealerDisplayKey);
            });
        })
        .flat(),
    [Paths.playerDecisionsScore]: playerInitialHandsKey.map((playerDisplayKey) => {
        return getPlayerDecisionScorePath(playerDisplayKey);
    }),
    [Paths.strategyAndRules]: [Paths.strategyAndRules]
};

export const prerenderingRoutes = Object.values(prerenderingRoutesDictionary).flat();
