import React from 'react';
import { getAllCardOutcomes, getCardOutcomesWeight } from '../logic/card-outcome';
import { getAllHands } from '../logic/hand';
import { getHandsNextCardProbabilities } from '../logic/hand-probabilities';
import { HandsTable } from './hands-table';

export const App: React.FC = () => {
    const cardOutcomes = getAllCardOutcomes();
    const hands = getAllHands(cardOutcomes);
    const outcomesWeight = getCardOutcomesWeight(cardOutcomes);

    const handsNextCardProbabilities = getHandsNextCardProbabilities(
        hands.handsDictionary,
        outcomesWeight
    );

    return (
        <HandsTable
            handsNextCardProbabilities={handsNextCardProbabilities}
            outcomesWeight={outcomesWeight}
            rootHands={hands.rootHands}
        />
    );
};
