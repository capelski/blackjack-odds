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
import { Decimals } from './decimals';
import { HandsTable } from './hands-table';
import { MaximumBustingRisk } from './maximum-busting-risk';
import { OptimalActionsGrid } from './optimal-actions-grid';

export const App: React.FC = () => {
    const {
        allAggregatedScores,
        allHands,
        dealerProbabilities,
        nextCardProbabilities,
        outcomesSet
    } = useMemo(() => {
        const outcomesSet = getOutcomesSet();
        const allHands = getAllHands(outcomesSet.allOutcomes);
        const allAggregatedScores = getAllAggregatedScores(allHands);
        const nextCardProbabilities = getNextCardHandsProbabilities({
            allAggregatedScores,
            allHands,
            outcomesWeight: outcomesSet.totalWeight
        });
        const dealerProbabilities = getLongRunHandsProbabilities({
            allAggregatedScores,
            allHands,
            maximumBustingRisk: nextCardProbabilities[String(dealerStandingScore - 1)].overMaximum,
            nextCardProbabilities,
            outcomesWeight: outcomesSet.totalWeight
        });

        return {
            allHands,
            allAggregatedScores,
            dealerProbabilities,
            nextCardProbabilities,
            outcomesSet
        };
    }, []);

    const [decimals, setDecimals] = useState(1);
    const [maximumBustingRisk, setMaximumBustingRisk] = useState(
        nextCardProbabilities['14'].overMaximum
    );

    const { longRunPlayerProbabilities, optimalActions } = useMemo(() => {
        const longRunPlayerProbabilities = getLongRunHandsProbabilities({
            allAggregatedScores,
            allHands,
            maximumBustingRisk,
            nextCardProbabilities,
            outcomesWeight: outcomesSet.totalWeight
        });

        const optimalActions = getOptimalActions({
            allAggregatedScores,
            dealerProbabilities,
            nextCardProbabilities,
            outcomesSet,
            playerProbabilities: longRunPlayerProbabilities
        });

        return { longRunPlayerProbabilities, optimalActions };
    }, [maximumBustingRisk]);

    return (
        <div>
            <h3>Settings</h3>
            <MaximumBustingRisk
                allAggregatedScores={allAggregatedScores}
                decimals={decimals}
                nextCardProbabilities={nextCardProbabilities}
                onChange={setMaximumBustingRisk}
                selectedRisk={maximumBustingRisk}
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
                nextCardProbabilities={nextCardProbabilities}
            />

            <h3>Hands table</h3>
            <HandsTable
                allHands={allHands}
                decimals={decimals}
                longRunPlayerProbabilities={longRunPlayerProbabilities}
                nextCardProbabilities={nextCardProbabilities}
                outcomesSet={outcomesSet}
            />
        </div>
    );
};
