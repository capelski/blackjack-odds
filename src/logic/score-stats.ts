import { maximumScore } from '../constants';
import { HitStrategy, PlayerDecision } from '../models';
import {
    ActionOutcome,
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

    allScoreStats.forEach((scoreStats) => {
        scoreStats.combinations.sort((a, b) => a.split(',').length - b.split(',').length);
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
                const standActionOutcome: ActionOutcome = {
                    lossProbability: standDealerProbabilities.lessThanDealer,
                    pushProbability: standDealerProbabilities.equalToDealer,
                    totalProbability: 0,
                    winProbability:
                        standDealerProbabilities.moreThanDealer +
                        standDealerProbabilities.dealerBusting
                };

                standActionOutcome.totalProbability =
                    standActionOutcome.lossProbability +
                    standActionOutcome.pushProbability +
                    standActionOutcome.winProbability;

                const hitProbabilities = scoreStats.representativeHand.descendants
                    .map((descendant) => {
                        return weightProbabilities(
                            descendant.effectiveScore >= maximumScore
                                ? {
                                      [descendant.effectiveScore]: 1
                                  }
                                : reduced[descendant.scoreKey].facts[dealerCardKey][
                                      reduced[descendant.scoreKey].facts[dealerCardKey].decision
                                  ].probabilities,
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

                const hitActionOutcome: ActionOutcome = {
                    lossProbability: hitBustingProbability + hitDealerProbabilities.lessThanDealer,
                    pushProbability: hitDealerProbabilities.equalToDealer,
                    totalProbability: 0,
                    winProbability:
                        hitDealerProbabilities.moreThanDealer + hitDealerProbabilities.dealerBusting
                };

                hitActionOutcome.totalProbability =
                    hitActionOutcome.lossProbability +
                    hitActionOutcome.pushProbability +
                    hitActionOutcome.winProbability;

                const decision: PlayerDecision =
                    standDealerProbabilities.lessThanDealer - hitStrategyProbability >
                    hitMinimalProbabilityGain
                        ? PlayerDecision.hit
                        : PlayerDecision.stand;

                const dealerCardBasedFacts: DealerCardBasedFacts = {
                    decision,
                    [PlayerDecision.hit]: {
                        actionOutcome: hitActionOutcome,
                        probabilities: hitProbabilities
                    },
                    hitBustingProbability,
                    hitDealerBustingProbability: hitDealerProbabilities.dealerBusting,
                    hitEqualToDealerProbability: hitDealerProbabilities.equalToDealer,
                    hitLessThanCurrentProbability,
                    hitLessThanDealerProbability: hitDealerProbabilities.lessThanDealer,
                    hitMoreThanDealerProbability: hitDealerProbabilities.moreThanDealer,
                    hitTotalProbability:
                        hitBustingProbability +
                        hitDealerProbabilities.dealerBusting +
                        hitDealerProbabilities.equalToDealer +
                        hitDealerProbabilities.lessThanDealer +
                        hitDealerProbabilities.moreThanDealer,
                    [PlayerDecision.stand]: {
                        actionOutcome: standActionOutcome,
                        probabilities: standProbabilities
                    },
                    standDealerBustingProbability: standDealerProbabilities.dealerBusting,
                    standEqualToDealerProbability: standDealerProbabilities.equalToDealer,
                    standLessThanDealerProbability: standDealerProbabilities.lessThanDealer,
                    standMoreThanDealerProbability: standDealerProbabilities.moreThanDealer,
                    standTotalProbability:
                        standDealerProbabilities.dealerBusting +
                        standDealerProbabilities.equalToDealer +
                        standDealerProbabilities.lessThanDealer +
                        standDealerProbabilities.moreThanDealer
                };

                return {
                    ...dealerCardReduced,
                    [dealerCardKey]: dealerCardBasedFacts
                };
            }, <ScoreAllDealerCardBasedFacts>{});

        const scoreDealerBasedFacts: ScoreDealerBasedFacts = {
            facts: scoreAllFacts,
            ...outcomesSet.allOutcomes.reduce(
                (outcomeReduce, cardOutcome) => {
                    const { decision } = scoreAllFacts[cardOutcome.key];
                    const { actionOutcome } = scoreAllFacts[cardOutcome.key][decision];
                    return {
                        lossProbability:
                            outcomeReduce.lossProbability +
                            (actionOutcome.lossProbability * cardOutcome.weight) /
                                outcomesSet.totalWeight,
                        pushProbability:
                            outcomeReduce.pushProbability +
                            (actionOutcome.pushProbability * cardOutcome.weight) /
                                outcomesSet.totalWeight,
                        totalProbability:
                            outcomeReduce.totalProbability +
                            (actionOutcome.totalProbability * cardOutcome.weight) /
                                outcomesSet.totalWeight,
                        winProbability:
                            outcomeReduce.winProbability +
                            (actionOutcome.winProbability * cardOutcome.weight) /
                                outcomesSet.totalWeight
                    };
                },
                { lossProbability: 0, pushProbability: 0, totalProbability: 0, winProbability: 0 }
            )
        };

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

// /**
//  * Returns a dictionary with the effective score probabilities when hitting ONCE for each score
//  */
// export const getOneMoreCardProbabilities = ({
//     allScoreStats,
//     outcomesSet
// }: {
//     allScoreStats: ScoreStats[];
//     outcomesSet: OutcomesSet;
// }) => {
//     return allScoreStats.reduce((reduced, scoreStats) => {
//         return {
//             ...reduced,
//             [scoreStats.key]: scoreStats.representativeHand.descendants.reduce(
//                 (handReduced, descendant) => {
//                     return {
//                         ...handReduced,
//                         [descendant.effectiveScore]:
//                             descendant.lastCard.weight / outcomesSet.totalWeight
//                     };
//                 },
//                 <EffectiveScoreProbabilities>{}
//             )
//         };
//     }, <AllEffectiveScoreProbabilities>{});
// };

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
