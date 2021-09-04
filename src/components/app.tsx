import React, { useMemo, useState } from 'react';
import { getAllAggregatedScores } from '../logic/all-aggregated-scores';
import { getAllHands, getRootHands } from '../logic/all-hands';
import { getAllHandsProbabilities } from '../logic/all-hands-probabilities';
import { getAllCardOutcomes, getCardOutcomesWeight } from '../logic/card-outcome';
import { dealerStandingScore } from '../logic/constants';
import { getOptimalActions } from '../logic/optimal-actions';
import { AggregatedScoresTable } from './aggregated-scores-table';
import { BustingRisk } from './busting-risk';
import { Decimals } from './decimals';
import { HandsTable } from './hands-table';
import { OptimalActionsGrid } from './optimal-actions-grid';

export const App: React.FC = () => {
    const [decimals, setDecimals] = useState(1);
    const [playerStandingScore, setPlayerStandingScore] = useState(15);

    const {
        allAggregatedScores,
        allHands,
        cardOutcomes,
        dealerProbabilities,
        nextCardPlayerProbabilities,
        outcomesWeight
    } = useMemo(() => {
        const cardOutcomes = getAllCardOutcomes();
        const allHands = getAllHands(cardOutcomes);
        const outcomesWeight = getCardOutcomesWeight(cardOutcomes);
        const allAggregatedScores = getAllAggregatedScores(allHands);

        const dealerProbabilities = getAllHandsProbabilities(
            allAggregatedScores,
            allHands,
            outcomesWeight,
            dealerStandingScore
        );
        const nextCardPlayerProbabilities = getAllHandsProbabilities(
            allAggregatedScores,
            allHands,
            outcomesWeight,
            undefined
        );

        return {
            allHands,
            allAggregatedScores,
            cardOutcomes,
            dealerProbabilities,
            nextCardPlayerProbabilities,
            outcomesWeight
        };
    }, []);

    const { longRunPlayerProbabilities, optimalActions } = useMemo(() => {
        const longRunPlayerProbabilities = getAllHandsProbabilities(
            allAggregatedScores,
            allHands,
            outcomesWeight,
            playerStandingScore
        );

        const optimalActions = getOptimalActions({
            aggregatedScores: allAggregatedScores,
            cardOutcomes,
            dealerProbabilities,
            playerProbabilities: longRunPlayerProbabilities
        });

        return { longRunPlayerProbabilities, optimalActions };
    }, [playerStandingScore]);

    return (
        <div>
            <h3>Settings</h3>
            <BustingRisk
                allAggregatedScores={allAggregatedScores}
                decimals={decimals}
                nextCardPlayerProbabilities={nextCardPlayerProbabilities}
                onChange={setPlayerStandingScore}
                selectedStandingScore={playerStandingScore}
            />
            <Decimals onChange={setDecimals} selectedValue={decimals} />

            <h3>Optimal actions</h3>
            <OptimalActionsGrid
                cardOutcomes={cardOutcomes}
                dealerProbabilities={dealerProbabilities}
                decimals={decimals}
                optimalActions={optimalActions}
                playerProbabilities={nextCardPlayerProbabilities}
            />

            <h3>Scores table</h3>
            <AggregatedScoresTable
                aggregatedScores={allAggregatedScores}
                decimals={decimals}
                longRunPlayerProbabilities={longRunPlayerProbabilities}
                nextCardPlayerProbabilities={nextCardPlayerProbabilities}
                outcomesWeight={outcomesWeight}
            />

            <h3>Hands table</h3>
            <HandsTable
                decimals={decimals}
                longRunPlayerProbabilities={longRunPlayerProbabilities}
                nextCardPlayerProbabilities={nextCardPlayerProbabilities}
                outcomesWeight={outcomesWeight}
                rootHands={getRootHands(allHands, cardOutcomes)}
            />
        </div>
    );
};
