import { dealerStandThreshold } from '../constants';
import { Action } from '../models';
import {
    DealerActionData,
    DealerActionsData,
    DealerBaseData,
    DealerDecision,
    DealerDecisions,
    DealerFact,
    DealerFacts,
    Dictionary,
    RepresentativeHand
} from '../types';
import { getCardSet } from './card-set';
import { aggregateFinalScores } from './final-scores';
import { getHandKey } from './representative-hand';

const setDealerDecision = (
    dealerDecisions: DealerDecisions,
    hands: Dictionary<RepresentativeHand>,
    handKey: string
) => {
    if (dealerDecisions[handKey] !== undefined) {
        return dealerDecisions[handKey];
    }

    const hand = hands[handKey];
    const allActions: DealerActionsData = {
        [Action.stand]: {
            action: Action.stand,
            finalScores: {
                [hand.effectiveScore]: {
                    score: hand.effectiveScore,
                    weight: 1
                }
            }
        }
    };
    let preferences: DealerActionData[] = [allActions[Action.stand]];

    if (hand.isActive) {
        hand.nextHands.forEach((nextHand) => {
            setDealerDecision(dealerDecisions, hands, nextHand.key);
        });

        allActions[Action.hit] = {
            action: Action.hit,
            finalScores: aggregateFinalScores(
                hand.nextHands.map((nextHand) => ({
                    finalScores: dealerDecisions[nextHand.key].preferences[0].finalScores,
                    weight: nextHand.weight
                }))
            )
        };

        if (hand.effectiveScore < dealerStandThreshold) {
            preferences = [allActions[Action.hit]];
        }
    }

    const dealerDecision: DealerDecision = {
        allActions,
        preferences
    };

    dealerDecisions[handKey] = dealerDecision;

    return dealerDecision;
};

export const getDealerFacts = (hands: Dictionary<RepresentativeHand>): DealerFacts => {
    const cardSet = getCardSet();
    const dealerDecisions = <DealerDecisions>{};

    const byCard = cardSet.cards.reduce<Dictionary<DealerFact>>((reduced, card) => {
        const key = getHandKey([card]);
        const decision = setDealerDecision(dealerDecisions, hands, key);

        return {
            ...reduced,
            [key]: {
                decision,
                hand: hands[key],
                weight: card.weight / cardSet.weight
            }
        };
    }, {});

    const byCard_average: DealerBaseData = {
        finalScores: aggregateFinalScores(
            Object.values(byCard).map((wDealerDecision) => ({
                finalScores: wDealerDecision.decision.preferences[0].finalScores,
                weight: wDealerDecision.weight
            }))
        )
    };

    return { byCard, byCard_average };
};
