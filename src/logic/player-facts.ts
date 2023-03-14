import { blackjackScore } from '../constants';
import { Action, PlayerStrategy } from '../models';
import {
    CasinoRules,
    DealerFacts,
    Dictionary,
    FinalScores,
    PlayerActionData,
    PlayerActionsData,
    PlayerBaseData,
    PlayerDecision,
    PlayerFact,
    PlayerDecisions,
    PlayerDecisionsWithWeight,
    PlayerDecisionWithWeight,
    PlayerAverageData,
    RepresentativeHand,
    PlayerFacts,
    PlayerActionOverrides,
    PlayerActionOverridesByDealerCard,
    PlayerStrategyData
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
    const data = items.map((item) => ({ ...getter(item), weight: item.weight }));
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
        hand.key,
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
                        hand.key,
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
        overrideIndex: -1,
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
        .filter((hand) => !hand.isDealerHand)
        .reduce((reduced, hand) => {
            return {
                ...reduced,
                [hand.key]: getHandPlayerFact(
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

export const groupPlayerFacts = (playerFacts: PlayerFacts): PlayerFact[] => {
    const mergedPlayerFacts = Object.values(playerFacts)
        .filter(
            (x) => !x.hand.isDealerHand && x.hand.effectiveScore <= blackjackScore
            // TODO Filter out 2-12 if Split enabled?
        )
        .reduce<PlayerFacts>((reduced, playerFact) => {
            const codeSynonyms = playerFact.hand.codeSynonyms.concat(
                reduced[playerFact.hand.displayKey]?.hand.codeSynonyms || []
            );
            codeSynonyms.sort(sortHandCodes);

            // if (reduced[playerFact.hand.displayKey] !== undefined) {
            //     console.log(`Merging ${playerFact.hand.key} into ${playerFact.hand.displayKey}`);
            // }

            // TODO Incorrect merge. When doubling.any_pair, 8-18 goes before initial 8-18 and sets canDouble to false!
            const mergedPlayerFact: PlayerFact = {
                ...playerFact,
                hand: {
                    ...playerFact.hand,
                    codeSynonyms
                },
                // TODO Merge averages, as secondary actions could vary
                weight: playerFact.weight + (reduced[playerFact.hand.displayKey]?.weight || 0)
            };

            return {
                ...reduced,
                [playerFact.hand.displayKey]: mergedPlayerFact
            };
        }, {});

    return Object.values(mergedPlayerFacts).sort(sortPlayerFacts);
};

const setPlayerAction_Double = (
    hand: RepresentativeHand,
    actions: PlayerActionsData,
    dealerFinalScores: FinalScores,
    playerDecisions: PlayerDecisions
) => {
    const doubleFinalScores: FinalScores = aggregateFinalScores(
        hand.nextHands.map((nextHand) => ({
            finalScores: playerDecisions[nextHand.key].allActions[Action.stand].finalScores,
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
            finalScores: playerDecisions[nextHand.key].preferences[0].finalScores,
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
            finalScores: playerDecisions[nextHand.key].preferences[0].finalScores,
            weight: nextHand.weight
        }))
    );
    const splitCosts = hand.splitNextHands
        .map((nextHand) => ({
            lossPayout: playerDecisions[nextHand.key].preferences[0].vsDealerOutcome.lossPayout,
            winPayout: playerDecisions[nextHand.key].preferences[0].vsDealerOutcome.winPayout,
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
                nextHand.key,
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
                    splitNextHand.key,
                    dealerFinalScores,
                    casinoRules,
                    playerStrategy,
                    playerActionOverrides
                );
            });

            setPlayerAction_Split(hand, allActions, dealerFinalScores, playerDecisions);
        }
    }

    let actionOverrides = playerActionOverrides && playerActionOverrides[handKey];
    // TODO Register a drivenBy relationship for secondary hands
    const secondaryOverrides =
        playerActionOverrides && !actionOverrides && playerActionOverrides[`special${handKey}`];
    if (secondaryOverrides) {
        actionOverrides = [secondaryOverrides[secondaryOverrides.length - 1]];
        console.log('Secondary overrides', handKey, secondaryOverrides);
    }

    if (actionOverrides) {
        actionOverrides.forEach((action, index) => {
            const overrideAction = Object.values(allActions).find((x) => x.action === action)!;
            overrideAction.overrideIndex = index;
        });
    }

    // TODO A,A cannot hit as a secondary preference!
    const preferences = Object.values(allActions).sort((a, b) => {
        return a.overrideIndex > -1 && b.overrideIndex > -1
            ? a.overrideIndex - b.overrideIndex
            : a.overrideIndex > -1 && b.overrideIndex === -1
            ? -1
            : a.overrideIndex === -1 && b.overrideIndex > -1
            ? 1
            : sortActions(hand, playerStrategy, a, b);
    });

    const playerDecision: PlayerDecision = {
        allActions,
        hasOverride: preferences.some((p) => p.overrideIndex !== -1),
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

const sortPlayerFacts = (a: PlayerFact, b: PlayerFact) => {
    const isSplitA = a.hand.canSplit;
    const isSplitB = b.hand.canSplit;
    const isSplitDifference = isSplitA !== isSplitB;

    const isSoftA = a.hand.allScores.length > 1;
    const isSoftB = b.hand.allScores.length > 1;
    const isSoftDifference = isSoftA !== isSoftB;

    const isBlackjackA = a.hand.isBlackjack;
    const isBlackjackB = b.hand.isBlackjack;
    const isBlackjackDifference = isBlackjackA !== isBlackjackB;

    const acesDisplayKey = splitAcesSymbols;

    return isSplitDifference
        ? +isSplitB - +isSplitA
        : a.hand.displayKey === acesDisplayKey
        ? 1
        : b.hand.displayKey === acesDisplayKey
        ? -1
        : isSoftDifference
        ? +isSoftB - +isSoftA
        : isBlackjackDifference
        ? +isBlackjackA - +isBlackjackB
        : a.hand.effectiveScore - b.hand.effectiveScore;
};
