import React from 'react';
import { getAllAggregatedScores } from '../logic/all-aggregated-scores';
import { getAllHandsProbabilities } from '../logic/all-hands-probabilities';
import { getAllCardOutcomes, getCardOutcomesWeight } from '../logic/card-outcome';
import { dealerStandingScore } from '../logic/constants';
import { getAllHands } from '../logic/hand';
import { getOptimalActions } from '../logic/optimal-actions';
import { AggregatedScoresTable } from './aggregated-scores-table';
import { HandsTable } from './hands-table';
import { OptimalActionsGrid } from './optimal-actions-grid';

export const App: React.FC = () => {
    const cardOutcomes = getAllCardOutcomes();
    const hands = getAllHands(cardOutcomes);
    const outcomesWeight = getCardOutcomesWeight(cardOutcomes);

    const aggregatedScores = getAllAggregatedScores(hands.handsDictionary);
    const playerNextCardProbabilities = getAllHandsProbabilities(
        aggregatedScores,
        hands.handsDictionary,
        outcomesWeight,
        undefined
    );
    const dealerProbabilities = getAllHandsProbabilities(
        aggregatedScores,
        hands.handsDictionary,
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
            <OptimalActionsGrid cardOutcomes={cardOutcomes} optimalActions={optimalActions} />

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
                rootHands={hands.rootHands}
            />
        </div>
    );
};
