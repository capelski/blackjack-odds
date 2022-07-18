import { maximumScore } from '../constants';
import { HitStrategy, PlayerDecision } from '../models';
import {
    AllEffectiveScoreProbabilities,
    AllScoreDealerCardBasedProbabilities,
    DealerCardBasedFacts,
    Dictionary,
    EffectiveScoreProbabilities,
    Hand,
    OutcomesSet,
    ScoreAllDealerCardBasedFacts,
    ScoreDealerBasedFacts,
    ScoreStats
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
    dealerProbabilities,
    hitMinimalProbabilityGain,
    hitStrategy,
    outcomesSet
}: {
    allScoreStats: ScoreStats[];
    dealerProbabilities: AllEffectiveScoreProbabilities;
    hitMinimalProbabilityGain: number;
    hitStrategy: HitStrategy;
    outcomesSet: OutcomesSet;
}) => {
    return allScoreStats.reduce((reduced, scoreStats) => {
        const scoreAllFacts = outcomesSet.allOutcomes
            .map((cardOutcome) => cardOutcome.key)
            .reduce((dealerCardReduced, dealerCardKey) => {
                const standProbabilities = {
                    [scoreStats.representativeHand.effectiveScore]: 1
                };
                const standDealerProbabilities = {
                    dealerBusting: getBustingProbability(dealerProbabilities[dealerCardKey]),
                    equalOrMoreThanDealer: getRangeProbability(
                        dealerProbabilities[dealerCardKey],
                        0,
                        scoreStats.representativeHand.effectiveScore
                    ),
                    lessThanDealer: getRangeProbability(
                        dealerProbabilities[dealerCardKey],
                        scoreStats.representativeHand.effectiveScore + 1,
                        maximumScore
                    )
                };

                const hitProbabilities = scoreStats.representativeHand.descendants
                    .map((descendant) => {
                        return weightProbabilities(
                            descendant.effectiveScore >= maximumScore
                                ? {
                                      [descendant.effectiveScore]: 1
                                  }
                                : reduced[descendant.scoreKey].facts[dealerCardKey][
                                      reduced[descendant.scoreKey].facts[dealerCardKey].decision
                                  ],
                            descendant.lastCard.weight / outcomesSet.totalWeight
                        );
                    })
                    .reduce(mergeProbabilities, <EffectiveScoreProbabilities>{});
                const hitBustingProbability = getBustingProbability(hitProbabilities);
                const hitLessThanCurrentProbability = getRangeProbability(
                    hitProbabilities,
                    0,
                    scoreStats.representativeHand.effectiveScore - 1
                );
                const hitDealerProbabilities = Object.keys(hitProbabilities)
                    .map((key) => parseInt(key))
                    .filter((key) => !isBustScore(key))
                    .reduce(
                        (hitReduced, key) => {
                            return {
                                dealerBusting:
                                    hitReduced.dealerBusting +
                                    hitProbabilities[key] *
                                        getBustingProbability(dealerProbabilities[dealerCardKey]),
                                equalOrMoreThanDealer:
                                    hitReduced.equalOrMoreThanDealer +
                                    hitProbabilities[key] *
                                        getRangeProbability(
                                            dealerProbabilities[dealerCardKey],
                                            0,
                                            key
                                        ),
                                lessThanDealer:
                                    hitReduced.lessThanDealer +
                                    hitProbabilities[key] *
                                        getRangeProbability(
                                            dealerProbabilities[dealerCardKey],
                                            key + 1,
                                            maximumScore
                                        )
                            };
                        },
                        { dealerBusting: 0, equalOrMoreThanDealer: 0, lessThanDealer: 0 }
                    );

                const hitStrategyProbability =
                    hitStrategy === HitStrategy.busting
                        ? hitBustingProbability
                        : hitStrategy === HitStrategy.lowerThanCurrent
                        ? hitBustingProbability + hitLessThanCurrentProbability
                        : hitBustingProbability + hitDealerProbabilities.lessThanDealer;

                const decision: PlayerDecision =
                    standDealerProbabilities.lessThanDealer - hitStrategyProbability >
                    hitMinimalProbabilityGain
                        ? PlayerDecision.hit
                        : PlayerDecision.stand;

                const dealerCardBasedFacts: DealerCardBasedFacts = {
                    decision,
                    hit: hitProbabilities,
                    hitBustingProbability,
                    hitDealerBustingProbability: hitDealerProbabilities.dealerBusting,
                    hitEqualOrMoreThanDealerProbability:
                        hitDealerProbabilities.equalOrMoreThanDealer,
                    hitLessThanCurrentProbability,
                    hitLessThanDealerProbability: hitDealerProbabilities.lessThanDealer,
                    lossProbability:
                        decision === PlayerDecision.hit
                            ? hitBustingProbability + hitDealerProbabilities.lessThanDealer
                            : standDealerProbabilities.lessThanDealer,
                    stand: standProbabilities,
                    standDealerBustingProbability: standDealerProbabilities.dealerBusting,
                    standEqualOrMoreThanDealerProbability:
                        standDealerProbabilities.equalOrMoreThanDealer,
                    standLessThanDealerProbability: standDealerProbabilities.lessThanDealer
                };

                return {
                    ...dealerCardReduced,
                    [dealerCardKey]: dealerCardBasedFacts
                };
            }, <ScoreAllDealerCardBasedFacts>{});

        const scoreDealerBasedFacts: ScoreDealerBasedFacts = {
            facts: scoreAllFacts,
            lossProbability:
                outcomesSet.allOutcomes.reduce(
                    (lossReduced, cardOutcome) =>
                        lossReduced +
                        scoreAllFacts[cardOutcome.key].lossProbability * cardOutcome.weight,
                    0
                ) / outcomesSet.totalWeight
        };

        return {
            ...reduced,
            [scoreStats.key]: scoreDealerBasedFacts
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
