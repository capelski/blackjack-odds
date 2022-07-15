import { maximumScore } from '../constants';
import { PlayerDecision } from '../models';
import {
    AllEffectiveScoreProbabilities,
    AllScoreDealerCardBasedProbabilities,
    DealerCardBasedProbabilities,
    Dictionary,
    Hand,
    OutcomesSet,
    ScoreStats,
    ScoreDealerCardBasedProbabilities,
    EffectiveScoreProbabilities
} from '../types';
import {
    weightProbabilities,
    mergeProbabilities,
    getBustingProbability,
    getRangeProbability
} from './effective-score-probabilities';
import { isBustScore } from './hand';

/**
 * Returns a list of all possible valid scores' stats
 */
export const getAllScoreStats = (allHands: Hand[]): ScoreStats[] => {
    const allScoresStatsMap = <Dictionary<ScoreStats>>{};
    const allScoreStats: ScoreStats[] = [];

    allHands.forEach((hand) => {
        const handSymbols = hand.cardSymbols.join(',');

        if (allScoresStatsMap[hand.scoreKey] === undefined) {
            allScoresStatsMap[hand.scoreKey] = {
                combinations: [handSymbols],
                key: hand.scoreKey,
                representativeHand: hand
            };
            allScoreStats.push(allScoresStatsMap[hand.scoreKey]);
        } else {
            allScoresStatsMap[hand.scoreKey].combinations.push(handSymbols);
        }
    });

    return allScoreStats;
};

/**
 * Returns a dictionary with the dealer card based probabilities when hitting BASED on the dealer card for each score
 */
export const getDealerCardBasedProbabilities = ({
    allScoreStats,
    outcomesSet,
    dealerProbabilities
}: {
    allScoreStats: ScoreStats[];
    outcomesSet: OutcomesSet;
    dealerProbabilities: AllEffectiveScoreProbabilities;
}) => {
    return allScoreStats.reduce((reduced, scoreStats) => {
        return {
            ...reduced,
            [scoreStats.key]: outcomesSet.allOutcomes
                .map((cardOutcome) => cardOutcome.key)
                .reduce((dealerCardReduced, dealerCardKey) => {
                    const hitProbabilities = scoreStats.representativeHand.descendants
                        .map((descendant) => {
                            return weightProbabilities(
                                descendant.effectiveScore >= maximumScore
                                    ? {
                                          [descendant.effectiveScore]: 1
                                      }
                                    : reduced[descendant.scoreKey][dealerCardKey][
                                          reduced[descendant.scoreKey][dealerCardKey].decision
                                      ],
                                descendant.lastCard.weight / outcomesSet.totalWeight
                            );
                        })
                        .reduce(mergeProbabilities, <EffectiveScoreProbabilities>{});
                    const standProbabilities = {
                        [scoreStats.representativeHand.effectiveScore]: 1
                    };

                    const bustingProbability = getBustingProbability(hitProbabilities);
                    const lessThanDealerProbability = getRangeProbability(
                        dealerProbabilities[dealerCardKey],
                        scoreStats.representativeHand.effectiveScore + 1,
                        maximumScore
                    );
                    const lowerScoreProbability = getRangeProbability(
                        hitProbabilities,
                        0,
                        scoreStats.representativeHand.effectiveScore - 1
                    );

                    // TODO Config item to include/exclude probability of lower score
                    // TODO Config item to demand minimal margin of gain for hitting?

                    const decision: PlayerDecision =
                        bustingProbability + lowerScoreProbability - lessThanDealerProbability < 0
                            ? PlayerDecision.hit
                            : PlayerDecision.stand;

                    const dealerCardBasedProbabilities: DealerCardBasedProbabilities = {
                        bustingProbability,
                        decision,
                        hit: hitProbabilities,
                        lowerScoreProbability,
                        lessThanDealerProbability,
                        stand: standProbabilities
                    };

                    return {
                        ...dealerCardReduced,
                        [dealerCardKey]: dealerCardBasedProbabilities
                    };
                }, <ScoreDealerCardBasedProbabilities>{})
        };
    }, <AllScoreDealerCardBasedProbabilities>{});
};

/**
 * Returns a dictionary with the effective score probabilities when hitting ONCE for each score
 */
export const getOneMoreCardProbabilities = ({
    allScoreStats,
    outcomesSet
}: {
    allScoreStats: ScoreStats[];
    outcomesSet: OutcomesSet;
}) => {
    return allScoreStats.reduce((reduced, scoreStats) => {
        return {
            ...reduced,
            [scoreStats.key]: scoreStats.representativeHand.descendants.reduce(
                (handReduced, descendant) => {
                    return {
                        ...handReduced,
                        [descendant.effectiveScore]:
                            descendant.lastCard.weight / outcomesSet.totalWeight
                    };
                },
                <EffectiveScoreProbabilities>{}
            )
        };
    }, <AllEffectiveScoreProbabilities>{});
};

/**
 * Returns a dictionary with the effective score probabilities when hitting WHILE below a threshold for each score
 */
export const getStandThresholdProbabilities = ({
    allScoreStats,
    outcomesSet,
    standThreshold
}: {
    allScoreStats: ScoreStats[];
    outcomesSet: OutcomesSet;
    standThreshold: number;
}) => {
    return allScoreStats.reduce((reduced, scoreStats) => {
        return {
            ...reduced,
            [scoreStats.key]:
                scoreStats.representativeHand.effectiveScore >= standThreshold
                    ? {
                          [scoreStats.representativeHand.effectiveScore]: 1
                      }
                    : scoreStats.representativeHand.descendants
                          .map((descendant) => {
                              return weightProbabilities(
                                  isBustScore(descendant.effectiveScore)
                                      ? {
                                            [descendant.effectiveScore]: 1
                                        }
                                      : reduced[descendant.scoreKey],
                                  descendant.lastCard.weight / outcomesSet.totalWeight
                              );
                          })
                          .reduce(mergeProbabilities, <EffectiveScoreProbabilities>{})
        };
    }, <AllEffectiveScoreProbabilities>{});
};

export const sortScoreStats = (allScoreStats: ScoreStats[]) => {
    return [...allScoreStats].sort((a, b) =>
        a.representativeHand.allScores.length === b.representativeHand.allScores.length
            ? a.representativeHand.effectiveScore - b.representativeHand.effectiveScore
            : a.representativeHand.allScores.length - b.representativeHand.allScores.length
    );
};
