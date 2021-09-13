import {
    AggregatedScoreTurnover,
    AllDecisionsData,
    AllHandsProbabilities,
    AllPlayerActions,
    AllTurnovers,
    Dictionary,
    OutcomesSet
} from '../types';
import { getAggregatedScoreTurnover } from './aggregated-score-turnover';
import { createEmptyTurnover, mergeTurnovers, weightTurnover } from './turnover';

export const getAllTurnovers = ({
    allDecisionsData,
    allPlayerActions,
    dealerProbabilities,
    outcomesSet,
    playerProbabilities
}: {
    allDecisionsData: AllDecisionsData;
    allPlayerActions: AllPlayerActions;
    dealerProbabilities: AllHandsProbabilities;
    outcomesSet: OutcomesSet;
    playerProbabilities: AllHandsProbabilities;
}): AllTurnovers => {
    const scoresTurnover: Dictionary<AggregatedScoreTurnover> = {};

    Object.keys(allDecisionsData).forEach((scoreDecisionsDataKey) => {
        scoresTurnover[scoreDecisionsDataKey] = getAggregatedScoreTurnover({
            allPlayerActions,
            dealerProbabilities,
            outcomesSet,
            playerProbabilities,
            scoreDecisionsData: allDecisionsData[scoreDecisionsDataKey]
        });
    });

    const allTurnovers: AllTurnovers = {
        overall: outcomesSet.allOutcomes
            .map((cardOutcome) => {
                return weightTurnover(
                    scoresTurnover[cardOutcome.key].individual,
                    cardOutcome.weight / outcomesSet.totalWeight
                );
            })
            .reduce(mergeTurnovers, createEmptyTurnover()),
        scores: scoresTurnover
    };

    return allTurnovers;
};
