import React from 'react';
import { getAggregatedScores } from '../logic/aggregated-score';
import { getAllCardOutcomes, getCardOutcomesWeight } from '../logic/card-outcome';
import { getAllHands } from '../logic/hand';
import { getHandsNextCardProbabilities } from '../logic/hand-probabilities';
import { AggregatedScoresTable } from './aggregated-scores-table';
import { HandsTable } from './hands-table';

export const App: React.FC = () => {
    const cardOutcomes = getAllCardOutcomes();
    const hands = getAllHands(cardOutcomes);
    const outcomesWeight = getCardOutcomesWeight(cardOutcomes);

    const aggregatedScores = getAggregatedScores(hands.handsDictionary);
    const handsNextCardProbabilities = getHandsNextCardProbabilities(
        hands.handsDictionary,
        outcomesWeight
    );

    return (
        <div>
            <h3>Scores table</h3>
            <AggregatedScoresTable
                aggregatedScores={aggregatedScores}
                handsNextCardProbabilities={handsNextCardProbabilities}
                outcomesWeight={outcomesWeight}
            />

            <h3>Hands table</h3>
            <HandsTable
                handsNextCardProbabilities={handsNextCardProbabilities}
                outcomesWeight={outcomesWeight}
                rootHands={hands.rootHands}
            />
        </div>
    );
};
