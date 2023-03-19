import { Action, PlayerStrategy } from '../models';
import {
    CasinoRules,
    DealerFacts,
    Dictionary,
    FinalScores,
    GroupedPlayerFacts,
    PlayerActionData,
    PlayerActionOverrides,
    PlayerActionOverridesByDealerCard,
    PlayerActionsData,
    PlayerAverageData,
    PlayerBaseData,
    PlayerDecision,
    PlayerDecisions,
    PlayerDecisionsWithWeight,
    PlayerDecisionWithWeight,
    PlayerFact,
    PlayerFacts,
    PlayerFactsGroup,
    PlayerStrategyData,
    RepresentativeHand
} from '../types';
import { aggregateFinalScores } from './final-scores';
import { sortHandCodes, splitAcesSymbols } from './representative-hand';
import { aggregateBreakdowns, getVsDealerBreakdown } from './vs-dealer-breakdown';
import { aggregateOutcomes, getVsDealerOutcome } from './vs-dealer-outcome';

type PlayerDecisionsByDealerCard = Dictionary<PlayerDecisions>;

const AVERAGE_DATA = 'averageData';

const aggregatePlayerBaseData = <T extends PlayerDecisionWithWeight | PlayerFact>(
    items: T[],
    getter: (item: T) => PlayerActionData | PlayerBaseData
): PlayerBaseData => {
    const data = items.map((item) => ({ weight: item.weight, ...getter(item) }));
    return {
        finalScores: aggregateFinalScores(data),
        vsDealerBreakdown: aggregateBreakdowns(data),
        vsDealerOutcome: aggregateOutcomes(data)
    };
};

const getHandPlayerFact = (
    hand: RepresentativeHand,
    weight: number,
    playerDecisions: PlayerDecisionsByDealerCard,
    hands: Dictionary<RepresentativeHand>,
    dealerFacts: DealerFacts,
    casinoRules: CasinoRules,
    playerStrategy: PlayerStrategyData,
    allPlayerOverrides: PlayerActionOverridesByDealerCard
): PlayerFact => {
    const vsDealerAverage = setPlayerDecision(
        playerDecisions[AVERAGE_DATA],
        hands,
        hand.codes.processing,
        dealerFacts.byCard_average.finalScores,
        casinoRules,
        playerStrategy
    );

    const vsDealerCard = Object.keys(dealerFacts.byCard).reduce<PlayerDecisionsWithWeight>(
        (reduced, cardBaseKey) => {
            return {
                ...reduced,
                [cardBaseKey]: {
                    ...setPlayerDecision(
                        playerDecisions[cardBaseKey],
                        hands,
                        hand.codes.processing,
                        dealerFacts.byCard[cardBaseKey].decision.preferences[0].finalScores,
                        casinoRules,
                        playerStrategy,
                        allPlayerOverrides[cardBaseKey] || {}
                    ),
                    weight: dealerFacts.byCard[cardBaseKey].weight
                }
            };
        },
        {}
    );

    const vsDealerCard_average = aggregatePlayerBaseData(
        Object.values(vsDealerCard),
        (playerDecision) => playerDecision.preferences[0]
    );

    return {
        hand,
        weight,
        vsDealerAverage,
        vsDealerCard,
        vsDealerCard_average
    };
};

const getPlayerActionData = (
    action: Action,
    playerFinalScores: FinalScores,
    dealerFinalScores: FinalScores,
    playerScore: number,
    { lossPayout = 1, winPayout = 1 } = {}
): PlayerActionData => {
    const vsDealerBreakdown = getVsDealerBreakdown({
        dealerFinalScores,
        playerFinalScores,
        playerScore
    });
    const vsDealerOutcome = getVsDealerOutcome({
        vsDealerBreakdown,
        lossPayout,
        winPayout
    });
    return {
        action,
        finalScores: playerFinalScores,
        vsDealerBreakdown,
        vsDealerOutcome
    };
};

export const getPlayerAverageData = (allPlayerFacts: PlayerFacts): PlayerAverageData => {
    const initialHandsPlayerFacts = Object.values(allPlayerFacts).filter(
        (playerFact) => playerFact.hand.playerHand.isInitial
    );

    const vsDealerAverage = aggregatePlayerBaseData(
        initialHandsPlayerFacts,
        (playerFact) => playerFact.vsDealerAverage.preferences[0]
    );

    const vsDealerCards = aggregatePlayerBaseData(
        initialHandsPlayerFacts,
        (playerFact) => playerFact.vsDealerCard_average
    );

    return {
        vsDealerAverage,
        vsDealerCards
    };
};

export const getPlayerFacts = (
    hands: Dictionary<RepresentativeHand>,
    dealerFacts: DealerFacts,
    casinoRules: CasinoRules,
    playerStrategy: PlayerStrategyData,
    allPlayerOverrides: PlayerActionOverridesByDealerCard
): PlayerFacts => {
    const playerDecisions = <PlayerDecisionsByDealerCard>{
        [AVERAGE_DATA]: {},
        ...Object.keys(dealerFacts.byCard).reduce((reduced, next) => {
            return {
                ...reduced,
                [next]: {}
            };
        }, {})
    };

    const allPlayerFacts = Object.values(hands)
        .filter((hand) => !hand.dealerHand.isInitial)
        .reduce((reduced, hand) => {
            return {
                ...reduced,
                [hand.codes.processing]: getHandPlayerFact(
                    hand,
                    hand.playerHand.weight,
                    playerDecisions,
                    hands,
                    dealerFacts,
                    casinoRules,
                    playerStrategy,
                    allPlayerOverrides
                )
            };
        }, <PlayerFacts>{});

    return allPlayerFacts;
};

export const groupPlayerFacts = (playerFacts: PlayerFacts): GroupedPlayerFacts => {
    const playerFactsByGroupCode = Object.values(playerFacts)
        .filter((playerFact) => !playerFact.hand.isBust)
        .reduce<Dictionary<PlayerFact[]>>((reduced, playerFact) => {
            const groupCode = playerFact.hand.codes.group;
            const group = (reduced[groupCode] || []).concat([playerFact]).sort((a, b) => {
                return b.hand.playerHand.weight - a.hand.playerHand.weight;
            });
            return {
                ...reduced,
                [groupCode]: group
            };
        }, {});

    const groupedPlayerFacts = Object.values(playerFactsByGroupCode).reduce<
        Dictionary<PlayerFactsGroup>
    >((reduced, playerFacts) => {
        const groupCode = playerFacts[0].hand.codes.group;

        const playerFactsGroup: PlayerFactsGroup = {
            allFacts: playerFacts,
            code: groupCode,
            combinations: playerFacts
                .reduce<string[]>((displayReduced, playerFact) => {
                    return displayReduced.concat(playerFact.hand.codes.displayEquivalences);
                }, [])
                .sort(sortHandCodes)
        };

        return {
            ...reduced,
            [groupCode]: playerFactsGroup
        };
    }, {});

    return Object.values(groupedPlayerFacts).sort(sortPlayerFacts);
};

const setPlayerAction_Double = (
    hand: RepresentativeHand,
    actions: PlayerActionsData,
    dealerFinalScores: FinalScores,
    playerDecisions: PlayerDecisions
) => {
    const doubleFinalScores: FinalScores = aggregateFinalScores(
        hand.nextHands.map((nextHand) => ({
            finalScores:
                playerDecisions[nextHand.codes.processing].allActions[Action.stand].finalScores,
            weight: nextHand.weight
        }))
    );
    actions[Action.double] = getPlayerActionData(
        Action.double,
        doubleFinalScores,
        dealerFinalScores,
        hand.effectiveScore,
        { lossPayout: 2, winPayout: 2 }
    );
};

const setPlayerAction_Hit = (
    hand: RepresentativeHand,
    actions: PlayerActionsData,
    dealerFinalScores: FinalScores,
    playerDecisions: PlayerDecisions
) => {
    const hitFinalScores: FinalScores = aggregateFinalScores(
        hand.nextHands.map((nextHand) => ({
            finalScores: playerDecisions[nextHand.codes.processing].preferences[0].finalScores,
            weight: nextHand.weight
        }))
    );
    actions[Action.hit] = getPlayerActionData(
        Action.hit,
        hitFinalScores,
        dealerFinalScores,
        hand.effectiveScore
    );
};

const setPlayerAction_Split = (
    hand: RepresentativeHand,
    actions: PlayerActionsData,
    dealerFinalScores: FinalScores,
    playerDecisions: PlayerDecisions
) => {
    const splitFinalScores: FinalScores = aggregateFinalScores(
        hand.splitNextHands.map((nextHand) => ({
            finalScores: playerDecisions[nextHand.codes.processing].preferences[0].finalScores,
            weight: nextHand.weight
        }))
    );
    const splitCosts = hand.splitNextHands
        .map((nextHand) => ({
            lossPayout:
                playerDecisions[nextHand.codes.processing].preferences[0].vsDealerOutcome
                    .lossPayout,
            winPayout:
                playerDecisions[nextHand.codes.processing].preferences[0].vsDealerOutcome.winPayout,
            weight: nextHand.weight
        }))
        .reduce(
            (reduced, next) => {
                return {
                    lossPayout: reduced.lossPayout + next.lossPayout * next.weight,
                    winPayout: reduced.winPayout + next.winPayout * next.weight
                };
            },
            { lossPayout: 0, winPayout: 0 }
        );

    actions[Action.split] = getPlayerActionData(
        Action.split,
        splitFinalScores,
        dealerFinalScores,
        hand.effectiveScore,
        {
            lossPayout: 2 * splitCosts.lossPayout,
            winPayout: 2 * splitCosts.winPayout
        }
    );
};

const setPlayerAction_Stand = (
    hand: RepresentativeHand,
    actions: PlayerActionsData,
    dealerFinalScores: FinalScores,
    casinoRules: CasinoRules
) => {
    const standFinalScores: FinalScores = {
        [hand.effectiveScore]: {
            score: hand.effectiveScore,
            weight: 1
        }
    };

    actions[Action.stand] = getPlayerActionData(
        Action.stand,
        standFinalScores,
        dealerFinalScores,
        hand.effectiveScore,
        { winPayout: hand.isBlackjack && casinoRules.blackjackPayout ? 1.5 : 1 }
    );
};

const setPlayerDecision = (
    playerDecisions: PlayerDecisions,
    hands: Dictionary<RepresentativeHand>,
    handKey: string,
    dealerFinalScores: FinalScores,
    casinoRules: CasinoRules,
    playerStrategy: PlayerStrategyData,
    playerActionOverrides?: PlayerActionOverrides
): PlayerDecision => {
    if (playerDecisions[handKey] !== undefined) {
        return playerDecisions[handKey];
    }

    const hand = hands[handKey];
    const allActions: PlayerActionsData = {};

    setPlayerAction_Stand(hand, allActions, dealerFinalScores, casinoRules);

    if (hand.isActive) {
        hand.nextHands.forEach((nextHand) => {
            setPlayerDecision(
                playerDecisions,
                hands,
                nextHand.codes.processing,
                dealerFinalScores,
                casinoRules,
                playerStrategy,
                playerActionOverrides
            );
        });

        setPlayerAction_Hit(hand, allActions, dealerFinalScores, playerDecisions);

        if (hand.canDouble) {
            setPlayerAction_Double(hand, allActions, dealerFinalScores, playerDecisions);
        }

        if (hand.canSplit) {
            hand.splitNextHands.forEach((splitNextHand) => {
                setPlayerDecision(
                    playerDecisions,
                    hands,
                    splitNextHand.codes.processing,
                    dealerFinalScores,
                    casinoRules,
                    playerStrategy,
                    playerActionOverrides
                );
            });

            setPlayerAction_Split(hand, allActions, dealerFinalScores, playerDecisions);
        }
    }

    let preferences = Object.values(allActions).sort((a, b) => {
        return sortActions(hand, playerStrategy, a, b);
    });

    const actionOverride = playerActionOverrides && playerActionOverrides[handKey];
    if (actionOverride && actionOverride !== preferences[0].action) {
        const targetAction = allActions[actionOverride];
        targetAction.isOverride = true;
        preferences = [targetAction].concat(
            preferences.filter((action) => action !== targetAction)
        );
    }

    const playerDecision: PlayerDecision = {
        allActions,
        hasOverride: preferences.some((p) => p.isOverride),
        preferences
    };

    playerDecisions[handKey] = playerDecision;

    return playerDecision;
};

const sortActions = (
    hand: RepresentativeHand,
    playerStrategy: PlayerStrategyData,
    a: PlayerActionData,
    b: PlayerActionData
): number => {
    const isStandA = a.action === Action.stand;
    const isStandB = b.action === Action.stand;

    if (
        playerStrategy.standThreshold.active &&
        hand.effectiveScore >= playerStrategy.standThreshold.value &&
        (hand.allScores.length === 1 || playerStrategy.standThreshold.useInSoftHands) &&
        (isStandA || isStandB)
    ) {
        return isStandA ? -1 : 1;
    }

    const isSelectedA =
        a.action === Action.hit ||
        a.action === Action.stand ||
        playerStrategy.optionalActions[a.action];
    const isSelectedB =
        b.action === Action.hit ||
        b.action === Action.stand ||
        playerStrategy.optionalActions[b.action];

    return isSelectedA !== isSelectedB
        ? +isSelectedB - +isSelectedB
        : playerStrategy.strategy === PlayerStrategy.maximumAdvantageHands
        ? b.vsDealerOutcome.playerAdvantage.hands - a.vsDealerOutcome.playerAdvantage.hands
        : playerStrategy.strategy === PlayerStrategy.maximumAdvantagePayout
        ? b.vsDealerOutcome.playerAdvantage.payout - a.vsDealerOutcome.playerAdvantage.payout
        : playerStrategy.strategy === PlayerStrategy.maximumWin
        ? b.vsDealerOutcome.winProbability - a.vsDealerOutcome.winProbability
        : //  playerStrategy.strategy === PlayerStrategy.minimumLoss
          a.vsDealerOutcome.lossProbability - b.vsDealerOutcome.lossProbability;
};

const sortPlayerFacts = (a: PlayerFactsGroup, b: PlayerFactsGroup) => {
    const aHand = a.allFacts[0].hand;
    const bHand = b.allFacts[0].hand;

    const isSplitA = aHand.canSplit;
    const isSplitB = bHand.canSplit;
    const isSplitDifference = isSplitA !== isSplitB;

    const isSoftA = aHand.allScores.length > 1;
    const isSoftB = bHand.allScores.length > 1;
    const isSoftDifference = isSoftA !== isSoftB;

    const isBlackjackA = aHand.isBlackjack;
    const isBlackjackB = bHand.isBlackjack;
    const isBlackjackDifference = isBlackjackA !== isBlackjackB;

    return isSplitDifference
        ? +isSplitB - +isSplitA
        : aHand.codes.group === splitAcesSymbols
        ? 1
        : bHand.codes.group === splitAcesSymbols
        ? -1
        : isSoftDifference
        ? +isSoftB - +isSoftA
        : isBlackjackDifference
        ? +isBlackjackA - +isBlackjackB
        : aHand.effectiveScore - bHand.effectiveScore;
};
