import { AggregatedScore, Dictionary, Hand } from '../types';
import { getHandScores, getHandSymbols } from './hand';

export const getAggregatedScores = (hands: Dictionary<Hand>): Dictionary<AggregatedScore> => {
    const aggregatedScores: Dictionary<AggregatedScore> = {};

    Object.values(hands)
        .filter((hand) => hand.cardSymbols.length > 1)
        .forEach((hand) => {
            const handScores = getHandScores(hand);
            const handSymbols = getHandSymbols(hand);

            if (aggregatedScores[handScores] === undefined) {
                aggregatedScores[handScores] = {
                    combinations: [handSymbols],
                    score: hand.score,
                    scores: handScores
                };
            } else {
                aggregatedScores[handScores].combinations.push(handSymbols);
            }
        });

    return aggregatedScores;
};
