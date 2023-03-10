import { FinalScore, FinalScores } from '../types';

export const aggregateFinalScores = <T extends { finalScores: FinalScores; weight: number }>(
    weightedFinalScores: T[]
) => {
    return weightedFinalScores
        .map((weightedFinalScore) => {
            return weightFinalScores(weightedFinalScore.finalScores, weightedFinalScore.weight);
        })
        .reduce(mergeFinalScores, <FinalScores>{});
};

const mergeFinalScores = (a: FinalScores, b: FinalScores): FinalScores => {
    const allKeys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)]));

    return allKeys.reduce((reduced, finalScoreKey) => {
        const mergedFinalScore: FinalScore = {
            score: parseFloat(finalScoreKey),
            weight: (a[finalScoreKey]?.weight || 0) + (b[finalScoreKey]?.weight || 0)
        };

        return {
            ...reduced,
            [finalScoreKey]: mergedFinalScore
        };
    }, {});
};

const weightFinalScores = (finalScores: FinalScores, weight: number): FinalScores => {
    return Object.values(finalScores).reduce((reduced, finalScore) => {
        const weightedFinalScore: FinalScore = {
            score: finalScore.score,
            weight: finalScore.weight * weight
        };
        return {
            ...reduced,
            [finalScore.score]: weightedFinalScore
        };
    }, {});
};
