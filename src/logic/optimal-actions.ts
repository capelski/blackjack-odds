import {
    Action,
    AggregatedScore,
    AggregatedScoreAction,
    AllAggregatedScores,
    AllHandsProbabilities,
    CardOutcome,
    HandProbabilities,
    OptimalActions
} from '../types';
import {
    getAggregatedScoreProbabilities,
    getCardOutcomeProbabilities
} from './all-hands-probabilities';
import { getHigherThanScoreProbability, getLowerThanScoreProbability } from './hand-probabilities';
import { createEmptyTurnover, createTurnover, mergeTurnovers, weightTurnover } from './turnover';

export const getOptimalActions = ({
    aggregatedScores,
    cardOutcomes,
    dealerProbabilities,
    outcomesWeight,
    playerProbabilities,
    playerStandingScore
}: {
    aggregatedScores: AllAggregatedScores;
    cardOutcomes: CardOutcome[];
    dealerProbabilities: AllHandsProbabilities;
    outcomesWeight: number;
    playerProbabilities: AllHandsProbabilities;
    playerStandingScore: number;
}): OptimalActions => {
    const optimalActions: OptimalActions = {};

    Object.values(aggregatedScores).forEach((aggregatedScore) => {
        const playerScoreProbabilities = getAggregatedScoreProbabilities(
            aggregatedScore,
            playerProbabilities
        );

        const actions = cardOutcomes.map<AggregatedScoreAction>((cardOutcome) => {
            const dealerCardProbabilities = getCardOutcomeProbabilities(
                cardOutcome,
                dealerProbabilities
            );

            const hittingLoss = getAggregatedScoreHittingLoss(
                aggregatedScore,
                playerScoreProbabilities
            );
            const effectiveHittingLoss =
                aggregatedScore.score >= playerStandingScore ? 1 : hittingLoss;

            const standingLoss = getAggregatedScoreStandingLoss(
                aggregatedScore,
                dealerCardProbabilities
            );

            const optimalAction: Action =
                standingLoss <= effectiveHittingLoss ? Action.Standing : Action.Hitting;

            return {
                action: optimalAction,
                dealerCard: cardOutcome,
                turnover: createTurnover(
                    aggregatedScore,
                    dealerCardProbabilities,
                    hittingLoss,
                    playerScoreProbabilities,
                    optimalAction,
                    standingLoss
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
                    weightTurnover(next.turnover, next.dealerCard.weight / outcomesWeight)
                );
            }, createEmptyTurnover())
        };
    });

    return optimalActions;
};

export const getAggregatedScoreHittingLoss = (
    aggregatedScore: AggregatedScore,
    playerScoreProbabilities: HandProbabilities
) => {
    return (
        playerScoreProbabilities.overMaximum +
        getLowerThanScoreProbability(playerScoreProbabilities, aggregatedScore)
    );
};
export const getAggregatedScoreStandingLoss = (
    aggregatedScore: AggregatedScore,
    dealerCardProbabilities: HandProbabilities
) => {
    return getHigherThanScoreProbability(dealerCardProbabilities, aggregatedScore);
};
