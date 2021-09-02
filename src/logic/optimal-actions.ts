import {
    Action,
    AllAggregatedScores,
    CardOutcome,
    Dictionary,
    HandProbabilities,
    OptimalActions
} from '../types';
import { getAggregatedScoreProbabilities } from './all-aggregated-scores';
import { getCardOutcomeScores } from './card-outcome';

export const getOptimalActions = (
    aggregatedScores: AllAggregatedScores,
    cardOutcomes: CardOutcome[],
    handsProbabilities: Dictionary<HandProbabilities>,
    dealerProbabilities: Dictionary<HandProbabilities>
): OptimalActions => {
    const optimalActions: OptimalActions = {};
    const dealerCardsProbabilities = cardOutcomes.reduce<Dictionary<HandProbabilities>>(
        (reduced, next) => {
            return {
                ...reduced,
                [next.symbol]: dealerProbabilities[getCardOutcomeScores(next)]
            };
        },
        {}
    );

    Object.values(aggregatedScores).forEach((aggregatedScore) => {
        const scoreProbabilities = getAggregatedScoreProbabilities(
            aggregatedScore,
            handsProbabilities
        );
        optimalActions[aggregatedScore.scores] = {};

        cardOutcomes.forEach((cardOutcome) => {
            // TODO Make it optional to consider the lower/equal probabilities
            const hittingLoss =
                scoreProbabilities.overMaximum +
                scoreProbabilities.lower[aggregatedScore.score] +
                scoreProbabilities.equal[aggregatedScore.score];
            const standingLoss =
                dealerCardsProbabilities[cardOutcome.symbol].higher[aggregatedScore.score];

            optimalActions[aggregatedScore.scores][cardOutcome.symbol] =
                standingLoss <= hittingLoss ? Action.Standing : Action.Hitting;
        });
    });
    return optimalActions;
};
