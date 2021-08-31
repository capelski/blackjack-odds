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
    handsProbabilities: Dictionary<HandProbabilities>
): OptimalActions => {
    const optimalActions: OptimalActions = {};
    const cardsProbabilities = cardOutcomes.reduce<Dictionary<HandProbabilities>>(
        (reduced, next) => {
            return {
                ...reduced,
                [next.symbol]: handsProbabilities[getCardOutcomeScores(next)]
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
            const hittingLoss = scoreProbabilities.overMaximum;
            const standingLoss =
                cardsProbabilities[cardOutcome.symbol].opponentRelative[aggregatedScore.score]
                    .higher;

            optimalActions[aggregatedScore.scores][cardOutcome.symbol] =
                standingLoss <= hittingLoss ? Action.Standing : Action.Hitting;
        });
    });
    return optimalActions;
};
