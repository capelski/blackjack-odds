import { ScoreKey } from '../models';
import { FinalScoresDictionary, FinalScoreProbabilities, ScoreStats } from '../types';
import { isBustScore } from './hand';
import { getOutcomesSet } from './outcomes-set';

export const getApplicableDealerProbabilities = (
    dealerProbabilities: FinalScoresDictionary,
    dealerCardKey: ScoreKey
): FinalScoreProbabilities => {
    return dealerProbabilities[dealerCardKey === ScoreKey.hard10 ? ScoreKey.figure : dealerCardKey];
};

export const getBustingProbability = (finalScoreProbabilities: FinalScoreProbabilities): number => {
    return getPossibleFinalScores(finalScoreProbabilities)
        .filter((finalScore) => isBustScore(finalScore))
        .reduce((reduced, finalScore) => {
            return reduced + finalScoreProbabilities[finalScore];
        }, 0);
};

export const getPossibleFinalScores = (finalScoreProbabilities: FinalScoreProbabilities) =>
    Object.keys(finalScoreProbabilities).map((finalScore) => parseFloat(finalScore));

export const getRangeProbability = (
    finalScoreProbabilities: FinalScoreProbabilities,
    rangeStart: number,
    rangeEnd: number
): number => {
    return getPossibleFinalScores(finalScoreProbabilities)
        .filter((finalScore) => finalScore >= rangeStart && finalScore <= rangeEnd)
        .reduce((reduced, finalScore) => {
            return reduced + finalScoreProbabilities[finalScore];
        }, 0);
};

/**
 * Returns a dictionary with the final score probabilities when hitting WHILE below a threshold for each score
 */
export const getStandThresholdProbabilities = ({
    allScoreStats,
    standThreshold
}: {
    allScoreStats: ScoreStats[];
    standThreshold: number;
}): FinalScoresDictionary => {
    const outcomesSet = getOutcomesSet();

    return allScoreStats.reduce((reduced, scoreStats) => {
        return {
            ...reduced,
            [scoreStats.key]:
                scoreStats.representativeHand.effectiveScore >= standThreshold
                    ? {
                          [scoreStats.representativeHand.effectiveScore]: 1
                      }
                    : scoreStats.representativeHand.hitDescendants
                          .map((hitDescendant) => {
                              return weightProbabilities(
                                  isBustScore(hitDescendant.effectiveScore)
                                      ? {
                                            [hitDescendant.effectiveScore]: 1
                                        }
                                      : reduced[hitDescendant.scoreKey],
                                  hitDescendant.lastCard.weight / outcomesSet.totalWeight
                              );
                          })
                          .reduce(mergeProbabilities, <FinalScoreProbabilities>{})
        };
    }, <FinalScoresDictionary>{});
};

export const mergeProbabilities = (
    a: FinalScoreProbabilities,
    b: FinalScoreProbabilities
): FinalScoreProbabilities => {
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
    finalScoreProbabilities: FinalScoreProbabilities,
    weight: number
): FinalScoreProbabilities => {
    return getPossibleFinalScores(finalScoreProbabilities).reduce((reduced, finalScore) => {
        return {
            ...reduced,
            [finalScore]: weight * finalScoreProbabilities[finalScore]
        };
    }, {});
};
