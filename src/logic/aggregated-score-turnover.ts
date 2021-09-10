import {
    AggregatedScoreTurnover,
    AllHandsProbabilities,
    AllPlayerActions,
    DecisionData,
    Dictionary,
    OutcomesSet,
    Turnover
} from '../types';
import {
    getCardOutcomeProbabilities,
    getAggregatedScoreProbabilities
} from './all-hands-probabilities';
import { createTurnover, mergeTurnovers, weightTurnover, createEmptyTurnover } from './turnover';

export const getAggregatedScoreTurnover = ({
    allPlayerActions,
    dealerProbabilities,
    outcomesSet,
    playerProbabilities,
    scoreDecisionsData
}: {
    allPlayerActions: AllPlayerActions;
    dealerProbabilities: AllHandsProbabilities;
    outcomesSet: OutcomesSet;
    playerProbabilities: AllHandsProbabilities;
    scoreDecisionsData: Dictionary<DecisionData>;
}): AggregatedScoreTurnover => {
    const dealerCardsTurnover = Object.values(scoreDecisionsData).reduce<Dictionary<Turnover>>(
        (reduced, decisionData) => {
            const dealerCardProbabilities = getCardOutcomeProbabilities(
                decisionData.dealerCard,
                dealerProbabilities
            );
            const scoreProbabilities = getAggregatedScoreProbabilities(
                decisionData.aggregatedScore,
                playerProbabilities
            );

            const cardTurnover = createTurnover({
                aggregatedScore: decisionData.aggregatedScore,
                dealerCardProbabilities,
                playerAction:
                    allPlayerActions[decisionData.aggregatedScore.key][decisionData.dealerCard.key],
                scoreProbabilities
            });

            return {
                ...reduced,
                [decisionData.dealerCard.key]: cardTurnover
            };
        },
        {}
    );

    const individualTurnover = Object.keys(dealerCardsTurnover).reduce((reduced, nextKey) => {
        return mergeTurnovers(
            reduced,
            weightTurnover(
                dealerCardsTurnover[nextKey],
                scoreDecisionsData[nextKey].dealerCard.weight / outcomesSet.totalWeight
            )
        );
    }, createEmptyTurnover());

    return {
        dealerCards: dealerCardsTurnover,
        individual: individualTurnover
    };
};
