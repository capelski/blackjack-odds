import { Action } from '../models';
import {
    PlayerActionOverrides,
    PlayerActionOverridesByDealerCard,
    PlayerFact,
    PlayerFactsGroup
} from '../types';

export const clearGroupOverrides = (
    actionOverrides: PlayerActionOverridesByDealerCard,
    playerFactsGroup: PlayerFactsGroup
) => {
    return Object.keys(actionOverrides).reduce<PlayerActionOverridesByDealerCard>(
        (reduced, dealerCardKey) => {
            const dealerCardOverrides = actionOverrides[dealerCardKey];
            const clearedActionOverrides = Object.keys(dealerCardOverrides)
                .filter((processingCode) => {
                    return playerFactsGroup.allFacts.every(
                        (playerFact) => playerFact.hand.codes.processing !== processingCode
                    );
                })
                .reduce<PlayerActionOverrides>((reduced, processingCode) => {
                    return { ...reduced, [processingCode]: dealerCardOverrides[processingCode] };
                }, {});

            if (Object.keys(clearedActionOverrides).length > 0) {
                reduced[dealerCardKey] = clearedActionOverrides;
            }

            return reduced;
        },
        {}
    );
};

export const hasOverrides = (actionOverrides: PlayerActionOverridesByDealerCard) => {
    return Object.keys(actionOverrides).length > 0;
};

export const hasGroupOverrides = (
    actionOverrides: PlayerActionOverridesByDealerCard,
    playerFactsGroup: PlayerFactsGroup
) => {
    return Object.values(actionOverrides).some((dealerCardOverrides) => {
        return Object.keys(dealerCardOverrides).some((processingCode) =>
            playerFactsGroup.allFacts.some(
                (playerFact) => playerFact.hand.codes.processing === processingCode
            )
        );
    });
};

export const setPlayerFactOverride = (
    actionOverrides: PlayerActionOverridesByDealerCard,
    playerFact: PlayerFact,
    dealerCard: string,
    action: Action
) => {
    const nextActionOverrides = { ...actionOverrides };
    const isOverride = playerFact.vsDealerCard[dealerCard].allActions[action].order !== 0;

    if (isOverride) {
        if (nextActionOverrides[dealerCard] === undefined) {
            nextActionOverrides[dealerCard] = {};
        }
        nextActionOverrides[dealerCard][playerFact.hand.codes.processing] = action;
    } else if (nextActionOverrides[dealerCard] !== undefined) {
        delete nextActionOverrides[dealerCard][playerFact.hand.codes.processing];
        if (Object.keys(nextActionOverrides[dealerCard]).length === 0) {
            delete nextActionOverrides[dealerCard];
        }
    }

    return nextActionOverrides;
};
