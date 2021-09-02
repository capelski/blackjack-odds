import {
    Action,
    AllAggregatedScores,
    AllHandsProbabilities,
    CardOutcome,
    OptimalActions
} from '../types';
import {
    getAggregatedScoreProbabilities,
    getCardOutcomeProbabilities
} from './all-hands-probabilities';

export const getOptimalActions = ({
    aggregatedScores,
    cardOutcomes,
    dealerProbabilities,
    playerProbabilities
}: {
    aggregatedScores: AllAggregatedScores;
    cardOutcomes: CardOutcome[];
    dealerProbabilities: AllHandsProbabilities;
    playerProbabilities: AllHandsProbabilities;
}): OptimalActions => {
    const optimalActions: OptimalActions = {};

    Object.values(aggregatedScores).forEach((aggregatedScore) => {
        const playerScoreProbabilities = getAggregatedScoreProbabilities(
            aggregatedScore,
            playerProbabilities
        );
        optimalActions[aggregatedScore.scores] = {};

        cardOutcomes.forEach((cardOutcome) => {
            const dealerCardProbabilities = getCardOutcomeProbabilities(
                cardOutcome,
                dealerProbabilities
            );

            // TODO Make it optional to consider the lower/equal probabilities
            const hittingLoss =
                playerScoreProbabilities.overMaximum +
                playerScoreProbabilities.lower[aggregatedScore.score] +
                playerScoreProbabilities.equal[aggregatedScore.score];
            const standingLoss = dealerCardProbabilities.higher[aggregatedScore.score];

            optimalActions[aggregatedScore.scores][cardOutcome.symbol] =
                standingLoss <= hittingLoss ? Action.Standing : Action.Hitting;
        });
    });
    return optimalActions;
};
