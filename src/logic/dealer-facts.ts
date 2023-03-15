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
import { aggregateFinalScores } from './final-scores';

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
            setDealerDecision(dealerDecisions, hands, nextHand.codes.processing);
        });

        allActions[Action.hit] = {
            action: Action.hit,
            finalScores: aggregateFinalScores(
                hand.nextHands.map((nextHand) => ({
                    finalScores:
                        dealerDecisions[nextHand.codes.processing].preferences[0].finalScores,
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
    const dealerDecisions = <DealerDecisions>{};

    const byCard = Object.values(hands)
        .filter((hand) => hand.dealerHand.isInitial)
        .reduce<Dictionary<DealerFact>>((reduced, hand) => {
            const decision = setDealerDecision(dealerDecisions, hands, hand.codes.processing);

            return {
                ...reduced,
                [hand.codes.processing]: {
                    decision,
                    hand,
                    weight: hand.dealerHand.weight
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
