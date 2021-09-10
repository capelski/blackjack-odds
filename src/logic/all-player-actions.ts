import { AllDecisionsData, AllPlayerActions, PlayerAction } from '../types';

export const getAllPlayerActions = ({
    allDecisionsData
}: {
    allDecisionsData: AllDecisionsData;
}): AllPlayerActions => {
    const allPlayerActions: AllPlayerActions = {};

    Object.values(allDecisionsData).forEach((scoreDecisionsData) => {
        Object.values(scoreDecisionsData).forEach((decisionData) => {
            const playerAction: PlayerAction =
                decisionData.isHittingBelowMaximumRisk &&
                (decisionData.longRunStandingLoss > decisionData.longRunHittingLoss ||
                    decisionData.isHittingRiskless)
                    ? PlayerAction.Hitting
                    : PlayerAction.Standing;

            allPlayerActions[decisionData.aggregatedScore.key] =
                allPlayerActions[decisionData.aggregatedScore.key] || {};
            allPlayerActions[decisionData.aggregatedScore.key][decisionData.dealerCard.key] =
                playerAction;
        });
    });

    return allPlayerActions;
};
