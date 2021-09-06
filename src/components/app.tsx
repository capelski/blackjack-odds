import React, { useMemo, useState } from 'react';
import { getAllAggregatedScores } from '../logic/all-aggregated-scores';
import { getAllHands } from '../logic/all-hands';
import {
    getLongRunHandsProbabilities,
    getNextCardHandsProbabilities
} from '../logic/all-hands-probabilities';
import { dealerStandingScore } from '../logic/constants';
import { getOptimalActions } from '../logic/optimal-actions';
import { getOutcomesSet } from '../logic/outcomes-set';
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
        dealerProbabilities,
        nextCardPlayerProbabilities,
        outcomesSet
    } = useMemo(() => {
        const outcomesSet = getOutcomesSet();
        const allHands = getAllHands(outcomesSet.allOutcomes);
        const allAggregatedScores = getAllAggregatedScores(allHands);

        const dealerProbabilities = getLongRunHandsProbabilities(
            allAggregatedScores,
            allHands,
            outcomesSet.totalWeight,
            dealerStandingScore
        );
        const nextCardPlayerProbabilities = getNextCardHandsProbabilities(
            allAggregatedScores,
            allHands,
            outcomesSet.totalWeight
        );

        return {
            allHands,
            allAggregatedScores,
            dealerProbabilities,
            nextCardPlayerProbabilities,
            outcomesSet
        };
    }, []);

    const { longRunPlayerProbabilities, optimalActions } = useMemo(() => {
        const longRunPlayerProbabilities = getLongRunHandsProbabilities(
            allAggregatedScores,
            allHands,
            outcomesSet.totalWeight,
            playerStandingScore
        );

        const optimalActions = getOptimalActions({
            aggregatedScores: allAggregatedScores,
            dealerProbabilities,
            outcomesSet,
            playerProbabilities: longRunPlayerProbabilities,
            playerStandingScore
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
                dealerProbabilities={dealerProbabilities}
                decimals={decimals}
                optimalActions={optimalActions}
                outcomesSet={outcomesSet}
                playerProbabilities={longRunPlayerProbabilities}
            />

            <h3>Scores table</h3>
            <AggregatedScoresTable
                aggregatedScores={allAggregatedScores}
                decimals={decimals}
                longRunPlayerProbabilities={longRunPlayerProbabilities}
                nextCardPlayerProbabilities={nextCardPlayerProbabilities}
            />

            <h3>Hands table</h3>
            <HandsTable
                allHands={allHands}
                decimals={decimals}
                longRunPlayerProbabilities={longRunPlayerProbabilities}
                nextCardPlayerProbabilities={nextCardPlayerProbabilities}
                outcomesSet={outcomesSet}
            />
        </div>
    );
};
