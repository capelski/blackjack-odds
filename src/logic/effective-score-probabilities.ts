import { EffectiveScoreProbabilities } from '../types';
import { isBustScore } from './hand';

export const getBustingProbability = (
    effectiveScoreProbabilities: EffectiveScoreProbabilities
): number => {
    return Object.keys(effectiveScoreProbabilities)
        .map((key) => parseInt(key))
        .filter((key) => isBustScore(key))
        .reduce((reduced, key) => {
            return reduced + effectiveScoreProbabilities[key];
        }, 0);
};

export const getRangeProbability = (
    effectiveScoreProbabilities: EffectiveScoreProbabilities,
    rangeStart: number,
    rangeEnd: number
): number => {
    return Object.keys(effectiveScoreProbabilities)
        .map((key) => parseInt(key))
        .filter((key) => key >= rangeStart && key <= rangeEnd)
        .reduce((reduced, key) => {
            return reduced + effectiveScoreProbabilities[key];
        }, 0);
};

export const mergeProbabilities = (
    a: EffectiveScoreProbabilities,
    b: EffectiveScoreProbabilities
): EffectiveScoreProbabilities => {
    const allKeys = Array.from(new Set([...Object.keys(a), ...Object.keys(b)])).map((key) =>
        parseInt(key)
    );
    return allKeys.reduce((reduced, key) => {
        return {
            ...reduced,
            [key]: (a[key] || 0) + (b[key] || 0)
        };
    }, {});
};

export const weightProbabilities = (
    effectiveScoreProbabilities: EffectiveScoreProbabilities,
    weight: number
): EffectiveScoreProbabilities => {
    return Object.keys(effectiveScoreProbabilities)
        .map((key) => parseInt(key))
        .reduce((reduced, key) => {
            return {
                ...reduced,
                [key]: weight * effectiveScoreProbabilities[key]
            };
        }, {});
};
