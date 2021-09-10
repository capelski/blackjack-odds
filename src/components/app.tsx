import React, { useMemo, useState } from 'react';
import { getAllAggregatedScores } from '../logic/all-aggregated-scores';
import { getAllDecisionsData } from '../logic/all-decisions-data';
import { getAllHands } from '../logic/all-hands';
import {
    getLongRunHandsProbabilities,
    getNextCardHandsProbabilities
} from '../logic/all-hands-probabilities';
import { getAllPlayerActions } from '../logic/all-player-actions';
import { getAllTurnovers } from '../logic/all-turnovers';
import { dealerStandingScore } from '../logic/constants';
import { getOutcomesSet } from '../logic/outcomes-set';
import { AggregatedScoresTable } from './aggregated-scores-table';
import { Decimals } from './decimals';
import { HandsTable } from './hands-table';
import { MaximumBustingRisk } from './maximum-busting-risk';
import { PlayerActionsGrid } from './player-actions-grid';

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

    const { allDecisionsData, allPlayerActions, allTurnovers, longRunPlayerProbabilities } =
        useMemo(() => {
            const longRunPlayerProbabilities = getLongRunHandsProbabilities({
                allAggregatedScores,
                allHands,
                maximumBustingRisk,
                nextCardProbabilities,
                outcomesWeight: outcomesSet.totalWeight
            });

            const allDecisionsData = getAllDecisionsData({
                allAggregatedScores,
                dealerProbabilities,
                nextCardProbabilities,
                outcomesSet,
                playerProbabilities: longRunPlayerProbabilities
            });

            const allPlayerActions = getAllPlayerActions({ allDecisionsData });

            const allTurnovers = getAllTurnovers({
                allDecisionsData,
                allPlayerActions,
                dealerProbabilities,
                outcomesSet,
                playerProbabilities: longRunPlayerProbabilities
            });

            return {
                allDecisionsData,
                allPlayerActions,
                allTurnovers,
                longRunPlayerProbabilities
            };
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

            <h3>Player actions</h3>
            <PlayerActionsGrid
                allDecisionsData={allDecisionsData}
                allPlayerActions={allPlayerActions}
                allTurnovers={allTurnovers}
                decimals={decimals}
                outcomesSet={outcomesSet}
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
