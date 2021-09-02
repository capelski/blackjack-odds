import {
    Action,
    AggregatedScore,
    CardOutcome,
    Dictionary,
    HandProbabilities,
    OptimalActions
} from '../types';
import { getAggregatedScoreProbabilities } from './aggregated-score';
import { getCardOutcomeScores } from './card-outcome';

export const getOptimalActions = (
    aggregatedScores: Dictionary<AggregatedScore>,
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
