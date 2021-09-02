import React from 'react';
import { getAllAggregatedScores } from '../logic/all-aggregated-scores';
import { getAllHands, getRootHands } from '../logic/all-hands';
import { getAllHandsProbabilities } from '../logic/all-hands-probabilities';
import { getAllCardOutcomes, getCardOutcomesWeight } from '../logic/card-outcome';
import { dealerStandingScore } from '../logic/constants';
import { getOptimalActions } from '../logic/optimal-actions';
import { AggregatedScoresTable } from './aggregated-scores-table';
import { HandsTable } from './hands-table';
import { OptimalActionsGrid } from './optimal-actions-grid';

export const App: React.FC = () => {
    const cardOutcomes = getAllCardOutcomes();
    const allHands = getAllHands(cardOutcomes);
    const outcomesWeight = getCardOutcomesWeight(cardOutcomes);

    const aggregatedScores = getAllAggregatedScores(allHands);
    const playerNextCardProbabilities = getAllHandsProbabilities(
        aggregatedScores,
        allHands,
        outcomesWeight,
        undefined
    );
    const dealerProbabilities = getAllHandsProbabilities(
        aggregatedScores,
        allHands,
        outcomesWeight,
        dealerStandingScore
    );
    const optimalActions = getOptimalActions({
        aggregatedScores,
        cardOutcomes,
        dealerProbabilities,
        playerProbabilities: playerNextCardProbabilities
    });

    return (
        <div>
            <h3>Optimal actions</h3>
            <OptimalActionsGrid
                cardOutcomes={cardOutcomes}
                dealerProbabilities={dealerProbabilities}
                optimalActions={optimalActions}
                playerProbabilities={playerNextCardProbabilities}
            />

            <h3>Scores table</h3>
            <AggregatedScoresTable
                aggregatedScores={aggregatedScores}
                handsNextCardProbabilities={playerNextCardProbabilities}
                outcomesWeight={outcomesWeight}
            />

            <h3>Hands table</h3>
            <HandsTable
                handsNextCardProbabilities={playerNextCardProbabilities}
                outcomesWeight={outcomesWeight}
                rootHands={getRootHands(allHands, cardOutcomes)}
            />
        </div>
    );
};
