import { maximumScore } from '../constants';
import { HitStrategy, PlayerDecision } from '../models';
import {
    AllEffectiveScoreProbabilities,
    AllScoreDealerCardBasedFacts,
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
export const getAllScoreStats = ({
    allHands,
    outcomesSet
}: {
    allHands: Hand[];
    outcomesSet: OutcomesSet;
}): ScoreStats[] => {
    const allScoresStatsMap = <Dictionary<ScoreStats>>{};
    const allScoreStats: ScoreStats[] = [];

    allHands.forEach((hand) => {
        const handSymbols = hand.cardSymbols.join(',');

        if (allScoresStatsMap[hand.scoreKey] === undefined) {
            allScoresStatsMap[hand.scoreKey] = {
                combinations: [handSymbols],
                initialHandProbability: 0,
                key: hand.scoreKey,
                representativeHand: hand
            };
            allScoreStats.push(allScoresStatsMap[hand.scoreKey]);
        } else {
            allScoresStatsMap[hand.scoreKey].combinations.push(handSymbols);
        }

        if (hand.cardSymbols.length === 2) {
            const cardWeights = hand.cardSymbols.map(
                (cardSymbol) =>
                    outcomesSet.allOutcomes.find((o) => o.symbol === cardSymbol)!.weight /
                    outcomesSet.totalWeight
            );

            // Because equivalent hands are filtered out (e.g. A,2 and 2,A are the same hand)
            // the initialHandProbability must consider the filtered out hands
            const initialProbability =
                hand.cardSymbols[0] === hand.cardSymbols[1]
                    ? cardWeights[0] * cardWeights[1]
                    : 2 * (cardWeights[0] * cardWeights[1]);

            allScoresStatsMap[hand.scoreKey].initialHandProbability += initialProbability;
        }
    });

    // const totalProbability = allScoreStats.reduce((x, y) => x + y.initialHandProbability, 0);
    // console.log('totalProbability', totalProbability);

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
}): AllScoreDealerCardBasedProbabilities => {
    const allScoreStatsFacts = allScoreStats.reduce((reduced, scoreStats) => {
        const scoreAllFacts = outcomesSet.allOutcomes
            .map((cardOutcome) => cardOutcome.key)
            .reduce((dealerCardReduced, dealerCardKey) => {
                const standProbabilities = {
                    [scoreStats.representativeHand.effectiveScore]: 1
                };
                const standDealerProbabilities = {
                    dealerBusting: getBustingProbability(dealerProbabilities[dealerCardKey]),
                    equalToDealer: getRangeProbability(
                        dealerProbabilities[dealerCardKey],
                        scoreStats.representativeHand.effectiveScore,
                        scoreStats.representativeHand.effectiveScore
                    ),
                    lessThanDealer: getRangeProbability(
                        dealerProbabilities[dealerCardKey],
                        scoreStats.representativeHand.effectiveScore + 1,
                        maximumScore
                    ),
                    moreThanDealer: getRangeProbability(
                        dealerProbabilities[dealerCardKey],
                        0,
                        scoreStats.representativeHand.effectiveScore - 1
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
                                equalToDealer:
                                    hitReduced.equalToDealer +
                                    hitProbabilities[key] *
                                        getRangeProbability(
                                            dealerProbabilities[dealerCardKey],
                                            key,
                                            key
                                        ),
                                lessThanDealer:
                                    hitReduced.lessThanDealer +
                                    hitProbabilities[key] *
                                        getRangeProbability(
                                            dealerProbabilities[dealerCardKey],
                                            key + 1,
                                            maximumScore
                                        ),
                                moreThanDealer:
                                    hitReduced.moreThanDealer +
                                    hitProbabilities[key] *
                                        getRangeProbability(
                                            dealerProbabilities[dealerCardKey],
                                            0,
                                            key - 1
                                        )
                            };
                        },
                        { dealerBusting: 0, equalToDealer: 0, lessThanDealer: 0, moreThanDealer: 0 }
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
                    hitEqualToDealerProbability: hitDealerProbabilities.equalToDealer,
                    hitMoreThanDealerProbability: hitDealerProbabilities.moreThanDealer,
                    hitLessThanCurrentProbability,
                    hitLessThanDealerProbability: hitDealerProbabilities.lessThanDealer,
                    lossProbability:
                        decision === PlayerDecision.hit
                            ? hitBustingProbability + hitDealerProbabilities.lessThanDealer
                            : standDealerProbabilities.lessThanDealer,
                    pushProbability:
                        decision === PlayerDecision.hit
                            ? hitDealerProbabilities.equalToDealer
                            : standDealerProbabilities.equalToDealer,
                    stand: standProbabilities,
                    standDealerBustingProbability: standDealerProbabilities.dealerBusting,
                    standEqualToDealerProbability: standDealerProbabilities.equalToDealer,
                    standMoreThanDealerProbability: standDealerProbabilities.moreThanDealer,
                    standLessThanDealerProbability: standDealerProbabilities.lessThanDealer,
                    totalProbability: 0,
                    winProbability:
                        decision === PlayerDecision.hit
                            ? hitDealerProbabilities.moreThanDealer +
                              hitDealerProbabilities.dealerBusting
                            : standDealerProbabilities.moreThanDealer +
                              standDealerProbabilities.dealerBusting
                };

                dealerCardBasedFacts.totalProbability =
                    dealerCardBasedFacts.lossProbability +
                    dealerCardBasedFacts.pushProbability +
                    dealerCardBasedFacts.winProbability;

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
                ) / outcomesSet.totalWeight,
            pushProbability:
                outcomesSet.allOutcomes.reduce(
                    (pushReduced, cardOutcome) =>
                        pushReduced +
                        scoreAllFacts[cardOutcome.key].pushProbability * cardOutcome.weight,
                    0
                ) / outcomesSet.totalWeight,
            totalProbability: 0,
            winProbability:
                outcomesSet.allOutcomes.reduce(
                    (winReduced, cardOutcome) =>
                        winReduced +
                        scoreAllFacts[cardOutcome.key].winProbability * cardOutcome.weight,
                    0
                ) / outcomesSet.totalWeight
        };

        scoreDealerBasedFacts.totalProbability =
            scoreDealerBasedFacts.lossProbability +
            scoreDealerBasedFacts.pushProbability +
            scoreDealerBasedFacts.winProbability;

        return {
            ...reduced,
            [scoreStats.key]: scoreDealerBasedFacts
        };
    }, <AllScoreDealerCardBasedFacts>{});

    const probabilities = {
        facts: allScoreStatsFacts,
        lossProbability: Object.values(allScoreStats).reduce(
            (reduced, scoreStats) =>
                reduced +
                scoreStats.initialHandProbability *
                    allScoreStatsFacts[scoreStats.key].lossProbability,
            0
        ),
        pushProbability: Object.values(allScoreStats).reduce(
            (reduced, scoreStats) =>
                reduced +
                scoreStats.initialHandProbability *
                    allScoreStatsFacts[scoreStats.key].pushProbability,
            0
        ),
        totalProbability: 0,
        winProbability: Object.values(allScoreStats).reduce(
            (reduced, scoreStats) =>
                reduced +
                scoreStats.initialHandProbability *
                    allScoreStatsFacts[scoreStats.key].winProbability,
            0
        )
    };

    probabilities.totalProbability =
        probabilities.lossProbability +
        probabilities.pushProbability +
        probabilities.winProbability;

    return probabilities;
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
        // TODO Blackjack must be sorted after 21 and before 2/12
        a.representativeHand.allScores.length === b.representativeHand.allScores.length
            ? a.representativeHand.effectiveScore - b.representativeHand.effectiveScore
            : a.representativeHand.allScores.length - b.representativeHand.allScores.length
    );
};
