import {
    Action,
    AggregatedScore,
    AggregatedScoreAction,
    AllAggregatedScores,
    AllHandsProbabilities,
    HandProbabilities,
    OptimalActions,
    OutcomesSet
} from '../types';
import {
    getAggregatedScoreProbabilities,
    getCardOutcomeProbabilities
} from './all-hands-probabilities';
import { dealerStandingScore } from './constants';
import { getHigherThanScoreProbability, getLowerThanScoreProbability } from './hand-probabilities';
import { createEmptyTurnover, createTurnover, mergeTurnovers, weightTurnover } from './turnover';

export const getOptimalActions = ({
    allAggregatedScores,
    dealerProbabilities,
    nextCardProbabilities,
    outcomesSet,
    playerProbabilities
}: {
    allAggregatedScores: AllAggregatedScores;
    dealerProbabilities: AllHandsProbabilities;
    nextCardProbabilities: AllHandsProbabilities;
    outcomesSet: OutcomesSet;
    playerProbabilities: AllHandsProbabilities;
}): OptimalActions => {
    const optimalActions: OptimalActions = {};

    Object.values(allAggregatedScores).forEach((aggregatedScore) => {
        const longRunScoreProbabilities = getAggregatedScoreProbabilities(
            aggregatedScore,
            playerProbabilities
        );
        const nextCardScoreProbabilities = getAggregatedScoreProbabilities(
            aggregatedScore,
            nextCardProbabilities
        );

        const actions = outcomesSet.allOutcomes.map<AggregatedScoreAction>((cardOutcome) => {
            const dealerCardProbabilities = getCardOutcomeProbabilities(
                cardOutcome,
                dealerProbabilities
            );

            const longRunHittingLoss = getScoreHittingLoss(
                aggregatedScore,
                longRunScoreProbabilities
            );
            const longRunStandingLoss = getScoreStandingLoss(
                aggregatedScore,
                dealerCardProbabilities
            );

            const isHittingRiskless =
                nextCardScoreProbabilities.overMaximum === 0 &&
                aggregatedScore.score < dealerStandingScore;

            const optimalAction: Action =
                longRunScoreProbabilities.canHit &&
                (longRunStandingLoss > longRunHittingLoss || isHittingRiskless)
                    ? Action.Hitting
                    : Action.Standing;

            return {
                action: optimalAction,
                dealerCard: cardOutcome,
                turnover: createTurnover(
                    aggregatedScore,
                    dealerCardProbabilities,
                    longRunHittingLoss,
                    longRunScoreProbabilities,
                    optimalAction,
                    longRunStandingLoss
                )
            };
        });

        optimalActions[aggregatedScore.key] = {
            allActions: actions.reduce((reduced, next) => {
                return {
                    ...reduced,
                    [next.dealerCard.symbol]: next
                };
            }, {}),
            aggregatedScore: aggregatedScore,
            turnover: actions.reduce((reduced, next) => {
                return mergeTurnovers(
                    reduced,
                    weightTurnover(next.turnover, next.dealerCard.weight / outcomesSet.totalWeight)
                );
            }, createEmptyTurnover())
        };
    });

    return optimalActions;
};

export const getScoreHittingLoss = (
    score: number | AggregatedScore,
    playerScoreProbabilities: HandProbabilities
) => {
    return (
        playerScoreProbabilities.overMaximum +
        getLowerThanScoreProbability(playerScoreProbabilities, score)
    );
};

export const getScoreStandingLoss = (
    score: number | AggregatedScore,
    dealerCardProbabilities: HandProbabilities
) => {
    return getHigherThanScoreProbability(dealerCardProbabilities, score);
};
