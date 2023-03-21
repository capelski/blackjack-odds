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
    playerFactsGroup: PlayerFactsGroup,
    playerFact: PlayerFact,
    dealerCard: string,
    action: Action
) => {
    const nextActionOverrides = { ...actionOverrides };
    if (nextActionOverrides[dealerCard] === undefined) {
        nextActionOverrides[dealerCard] = {};
    }

    // Hit/Stand actions are always available; selecting them as first action override
    // must override the secondary actions as well
    const isRestrictiveOverride =
        playerFact === playerFactsGroup.allFacts[0] &&
        (action === Action.hit || action === Action.stand);
    const affectedPlayerFacts = isRestrictiveOverride ? playerFactsGroup.allFacts : [playerFact];

    affectedPlayerFacts.forEach((affectedPlayerFact) => {
        const actionData = affectedPlayerFact.vsDealerCard[dealerCard].allActions[action];
        const isOverride = actionData && actionData.order !== 0;
        if (isOverride) {
            nextActionOverrides[dealerCard][affectedPlayerFact.hand.codes.processing] = action;
        } else {
            delete nextActionOverrides[dealerCard][affectedPlayerFact.hand.codes.processing];
        }
    });

    if (Object.keys(nextActionOverrides[dealerCard]).length === 0) {
        delete nextActionOverrides[dealerCard];
    }

    return nextActionOverrides;
};
