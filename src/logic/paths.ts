import { scoreKeySeparator } from '../constants';
import { Paths } from '../models';
import { dealerGroupCodeParam, playerGroupCodeParam } from '../models/paths';
import { Dictionary } from '../types';
import { getDefaultCasinoRues } from './casino-rules';
import { getAllRepresentativeHands } from './representative-hand';

const safeParametersSeparator = '-';

export const getPlayerDecisionDealerCardPath = (
    playerDisplayKey: string,
    dealerDisplayKey: string
) => {
    return Paths.playerDecisionsDealerCard
        .replace(
            `:${playerGroupCodeParam}`,
            playerDisplayKey.replace(scoreKeySeparator, safeParametersSeparator)
        )
        .replace(`:${dealerGroupCodeParam}`, dealerDisplayKey);
};

export const getPlayerDecisionDealerCardParams = (params: Record<string, string | undefined>) => {
    return {
        [dealerGroupCodeParam]: params[dealerGroupCodeParam],
        [playerGroupCodeParam]: params[playerGroupCodeParam]?.replace(
            safeParametersSeparator,
            scoreKeySeparator
        )
    };
};

export const getPlayerDecisionScorePath = (playerDisplayKey: string) => {
    return Paths.playerDecisionsScore.replace(
        `:${playerGroupCodeParam}`,
        playerDisplayKey.replace(scoreKeySeparator, safeParametersSeparator)
    );
};

export const getPlayerDecisionScoreParams = (params: Record<string, string | undefined>) => {
    return {
        [playerGroupCodeParam]: params[playerGroupCodeParam]?.replace(
            safeParametersSeparator,
            scoreKeySeparator
        )
    };
};

const allHands = Object.values(getAllRepresentativeHands(getDefaultCasinoRues()));
const playerGroupCodes = allHands
    .filter((hand) => !hand.isBust && !hand.dealerHand.isInitial)
    .reduce<string[]>((reduced, next) => {
        const { group } = next.codes;
        return reduced.find((x) => x === group) ? reduced : reduced.concat([group]);
    }, []);
const dealerGroupCodes = allHands
    .filter((hand) => hand.dealerHand.isInitial)
    .map((hand) => hand.codes.group);

const prerenderingRoutesDictionary: Dictionary<string[], Paths> = {
    [Paths.playerDecisions]: [Paths.playerDecisions],
    [Paths.playerDecisionsDealerCard]: playerGroupCodes
        .map((playerDisplayKey) => {
            return dealerGroupCodes.map((dealerDisplayKey) => {
                return getPlayerDecisionDealerCardPath(playerDisplayKey, dealerDisplayKey);
            });
        })
        .flat(),
    [Paths.playerDecisionsScore]: playerGroupCodes.map((playerDisplayKey) => {
        return getPlayerDecisionScorePath(playerDisplayKey);
    }),
    [Paths.strategyAndRules]: [Paths.strategyAndRules]
};

export const prerenderingRoutes = Object.values(prerenderingRoutesDictionary).flat();
