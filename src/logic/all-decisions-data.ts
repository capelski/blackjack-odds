import {
    AllAggregatedScores,
    AllDecisionsData,
    AllHandsProbabilities,
    OutcomesSet
} from '../types';
import {
    getAggregatedScoreProbabilities,
    getCardOutcomeProbabilities
} from './all-hands-probabilities';
import { dealerStandingScore } from './constants';
import { getScoreHittingLoss, getScoreStandingLoss } from './hand-probabilities';

export const getAllDecisionsData = ({
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
}): AllDecisionsData => {
    const allDecisionsData: AllDecisionsData = {};

    Object.values(allAggregatedScores).forEach((aggregatedScore) => {
        const longRunScoreProbabilities = getAggregatedScoreProbabilities(
            aggregatedScore,
            playerProbabilities
        );
        const nextCardScoreProbabilities = getAggregatedScoreProbabilities(
            aggregatedScore,
            nextCardProbabilities
        );
        allDecisionsData[aggregatedScore.key] = {};

        outcomesSet.allOutcomes.forEach((dealerCard) => {
            const dealerCardProbabilities = getCardOutcomeProbabilities(
                dealerCard,
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

            allDecisionsData[aggregatedScore.key][dealerCard.key] = {
                aggregatedScore,
                isHittingBelowMaximumRisk: longRunScoreProbabilities.isHittingBelowMaximumRisk,
                dealerCard,
                isHittingRiskless,
                longRunHittingLoss,
                longRunStandingLoss
            };
        });
    });

    return allDecisionsData;
};
