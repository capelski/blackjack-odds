import React from 'react';
import { getAllCardOutcomes, getCardOutcomesWeight } from '../logic/card-outcome';
import { getAllHands } from '../logic/hand';
import { HandsTable } from './hands-table';

export const App: React.FC = () => {
    const cardOutcomes = getAllCardOutcomes();
    const hands = getAllHands(cardOutcomes);
    const outcomesWeight = getCardOutcomesWeight(cardOutcomes);

    return <HandsTable hands={hands} outcomesWeight={outcomesWeight} />;
};
