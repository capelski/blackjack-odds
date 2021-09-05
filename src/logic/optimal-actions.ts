import {
    Action,
    AggregatedScore,
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

export const getOptimalActions = ({
    aggregatedScores,
    cardOutcomes,
    dealerProbabilities,
    playerProbabilities,
    playerStandingScore
}: {
    aggregatedScores: AllAggregatedScores;
    cardOutcomes: CardOutcome[];
    dealerProbabilities: AllHandsProbabilities;
    playerProbabilities: AllHandsProbabilities;
    playerStandingScore: number;
}): OptimalActions => {
    const optimalActions: OptimalActions = {};

    Object.values(aggregatedScores).forEach((aggregatedScore) => {
        const playerScoreProbabilities = getAggregatedScoreProbabilities(
            aggregatedScore,
            playerProbabilities
        );
        optimalActions[aggregatedScore.key] = {
            actions: {},
            aggregatedScore: aggregatedScore
        };

        cardOutcomes.forEach((cardOutcome) => {
            const dealerCardProbabilities = getCardOutcomeProbabilities(
                cardOutcome,
                dealerProbabilities
            );

            const hittingLoss =
                aggregatedScore.score >= playerStandingScore
                    ? 1
                    : getAggregatedScoreHittingLoss(aggregatedScore, playerScoreProbabilities);
            const standingLoss = getAggregatedScoreStandingLoss(
                aggregatedScore,
                dealerCardProbabilities
            );

            const optimalAction: Action =
                standingLoss <= hittingLoss ? Action.Standing : Action.Hitting;

            optimalActions[aggregatedScore.key].actions[cardOutcome.symbol] = {
                dealerCard: cardOutcome,
                playerAction: optimalAction
            };
        });
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
