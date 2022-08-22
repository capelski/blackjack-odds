import { EffectiveScoreProbabilities } from '../types';
import { isBustScore } from './hand';

export const getBustingProbability = (
    effectiveScoreProbabilities: EffectiveScoreProbabilities
): number => {
    return getPossibleFinalScores(effectiveScoreProbabilities)
        .filter((finalScore) => isBustScore(finalScore))
        .reduce((reduced, finalScore) => {
            return reduced + effectiveScoreProbabilities[finalScore];
        }, 0);
};

export const getRangeProbability = (
    effectiveScoreProbabilities: EffectiveScoreProbabilities,
    rangeStart: number,
    rangeEnd: number
): number => {
    return getPossibleFinalScores(effectiveScoreProbabilities)
        .filter((finalScore) => finalScore >= rangeStart && finalScore <= rangeEnd)
        .reduce((reduced, finalScore) => {
            return reduced + effectiveScoreProbabilities[finalScore];
        }, 0);
};

export const getPossibleFinalScores = (effectiveScoreProbabilities: EffectiveScoreProbabilities) =>
    Object.keys(effectiveScoreProbabilities).map((finalScore) => parseFloat(finalScore));

export const mergeProbabilities = (
    a: EffectiveScoreProbabilities,
    b: EffectiveScoreProbabilities
): EffectiveScoreProbabilities => {
    const allKeys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).map((finalScore) =>
        parseFloat(finalScore)
    );
    return allKeys.reduce((reduced, finalScore) => {
        return {
            ...reduced,
            [finalScore]: (a[finalScore] || 0) + (b[finalScore] || 0)
        };
    }, {});
};

export const weightProbabilities = (
    effectiveScoreProbabilities: EffectiveScoreProbabilities,
    weight: number
): EffectiveScoreProbabilities => {
    return getPossibleFinalScores(effectiveScoreProbabilities).reduce((reduced, finalScore) => {
        return {
            ...reduced,
            [finalScore]: weight * effectiveScoreProbabilities[finalScore]
        };
    }, {});
};
