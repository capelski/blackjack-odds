import { blackjackScore } from '../constants';
import { PlayerDecision, PlayerStrategy, ScoreKey } from '../models';
import {
    AllEffectiveScoreProbabilities,
    AllScoreDealerCardBasedFacts,
    AllScoreDealerCardBasedProbabilities,
    DealerCardBasedFacts,
    DecisionOutcome,
    Dictionary,
    EffectiveScoreProbabilities,
    Hand,
    OutcomesSet,
    PlayerAdvantage,
    PlayerDecisionsOverrides,
    ScoreAllDealerCardBasedFacts,
    ScoreDealerBasedFacts,
    ScoreStats
} from '../types';
import {
    getApplicableDealerProbabilities,
    getDealerBasedProbabilities
} from './dealer-card-based-probabilities';
import {
    weightProbabilities,
    mergeProbabilities,
    getBustingProbability,
    getRangeProbability,
    getPossibleFinalScores
} from './effective-score-probabilities';
import { isBlackjack, isBustScore } from './hand';

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
    blackjackPayout,
    dealerProbabilities,
    hitMinimalProbabilityGain,
    outcomesSet,
    playerDecisionsOverrides,
    playerStrategy
}: {
    allScoreStats: ScoreStats[];
    blackjackPayout: boolean;
    dealerProbabilities: AllEffectiveScoreProbabilities;
    hitMinimalProbabilityGain: number;
    outcomesSet: OutcomesSet;
    playerDecisionsOverrides: PlayerDecisionsOverrides;
    playerStrategy: PlayerStrategy;
}): AllScoreDealerCardBasedProbabilities => {
    const allScoreStatsFacts = allScoreStats.reduce((reduced, scoreStats) => {
        const scoreAllFacts = outcomesSet.allOutcomes
            .map((cardOutcome) => cardOutcome.key)
            .reduce((dealerCardReduced, dealerCardKey) => {
                const applicableDealerProbabilities = getApplicableDealerProbabilities(
                    dealerProbabilities,
                    dealerCardKey
                );

                const standProbabilities = {
                    [scoreStats.representativeHand.effectiveScore]: 1
                };
                const standDealerProbabilities = {
                    dealerBusting: getBustingProbability(applicableDealerProbabilities),
                    ...getDealerBasedProbabilities(
                        scoreStats.representativeHand.effectiveScore,
                        applicableDealerProbabilities
                    )
                };
                const standDecisionOutcome: DecisionOutcome = {
                    lossProbability: standDealerProbabilities.lessThanDealer,
                    pushProbability: standDealerProbabilities.equalToDealer,
                    totalProbability: 0,
                    winProbability:
                        standDealerProbabilities.moreThanDealer +
                        standDealerProbabilities.dealerBusting
                };

                standDecisionOutcome.totalProbability =
                    standDecisionOutcome.lossProbability +
                    standDecisionOutcome.pushProbability +
                    standDecisionOutcome.winProbability;

                const hitProbabilities = scoreStats.representativeHand.descendants
                    .map((descendant) => {
                        return weightProbabilities(
                            descendant.effectiveScore >= blackjackScore
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
                const hitDealerProbabilities = getPossibleFinalScores(hitProbabilities)
                    .filter((finalScore) => !isBustScore(finalScore))
                    .reduce(
                        (hitReduced, finalScore) => {
                            const dealerBasedProbabilities = getDealerBasedProbabilities(
                                finalScore,
                                applicableDealerProbabilities
                            );
                            return {
                                dealerBusting:
                                    hitReduced.dealerBusting +
                                    hitProbabilities[finalScore] *
                                        getBustingProbability(applicableDealerProbabilities),
                                equalToDealer:
                                    hitReduced.equalToDealer +
                                    hitProbabilities[finalScore] *
                                        dealerBasedProbabilities.equalToDealer,
                                lessThanDealer:
                                    hitReduced.lessThanDealer +
                                    hitProbabilities[finalScore] *
                                        dealerBasedProbabilities.lessThanDealer,
                                moreThanDealer:
                                    hitReduced.moreThanDealer +
                                    hitProbabilities[finalScore] *
                                        dealerBasedProbabilities.moreThanDealer
                            };
                        },
                        { dealerBusting: 0, equalToDealer: 0, lessThanDealer: 0, moreThanDealer: 0 }
                    );

                const hitDecisionOutcome: DecisionOutcome = {
                    lossProbability: hitBustingProbability + hitDealerProbabilities.lessThanDealer,
                    pushProbability: hitDealerProbabilities.equalToDealer,
                    totalProbability: 0,
                    winProbability:
                        hitDealerProbabilities.moreThanDealer + hitDealerProbabilities.dealerBusting
                };

                hitDecisionOutcome.totalProbability =
                    hitDecisionOutcome.lossProbability +
                    hitDecisionOutcome.pushProbability +
                    hitDecisionOutcome.winProbability;

                const decisionComparison =
                    playerStrategy === PlayerStrategy.hitBusting_standLessThanDealer
                        ? standDealerProbabilities.lessThanDealer - hitBustingProbability
                        : playerStrategy === PlayerStrategy.hitBustingOrLower_standLessThanDealer
                        ? standDealerProbabilities.lessThanDealer -
                          (hitBustingProbability + hitLessThanCurrentProbability)
                        : playerStrategy === PlayerStrategy.hitLoss_standLoss
                        ? standDecisionOutcome.lossProbability - hitDecisionOutcome.lossProbability
                        : standDecisionOutcome.lossProbability -
                          standDecisionOutcome.winProbability -
                          (hitDecisionOutcome.lossProbability - hitDecisionOutcome.winProbability);
                const decision: PlayerDecision =
                    playerDecisionsOverrides[scoreStats.key]?.[dealerCardKey] ||
                    (decisionComparison > hitMinimalProbabilityGain
                        ? PlayerDecision.hit
                        : PlayerDecision.stand);

                const dealerCardBasedFacts: DealerCardBasedFacts = {
                    decision,
                    [PlayerDecision.hit]: {
                        decisionOutcome: hitDecisionOutcome,
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
                        decisionOutcome: standDecisionOutcome,
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
            playerAdvantage: {
                hands: 0,
                payout: 0
            },
            ...outcomesSet.allOutcomes.reduce(
                (outcomeReduce, cardOutcome) => {
                    const { decision } = scoreAllFacts[cardOutcome.key];
                    const { decisionOutcome } = scoreAllFacts[cardOutcome.key][decision];
                    return {
                        lossProbability:
                            outcomeReduce.lossProbability +
                            (decisionOutcome.lossProbability * cardOutcome.weight) /
                                outcomesSet.totalWeight,
                        pushProbability:
                            outcomeReduce.pushProbability +
                            (decisionOutcome.pushProbability * cardOutcome.weight) /
                                outcomesSet.totalWeight,
                        totalProbability:
                            outcomeReduce.totalProbability +
                            (decisionOutcome.totalProbability * cardOutcome.weight) /
                                outcomesSet.totalWeight,
                        winProbability:
                            outcomeReduce.winProbability +
                            (decisionOutcome.winProbability * cardOutcome.weight) /
                                outcomesSet.totalWeight
                    };
                },
                { lossProbability: 0, pushProbability: 0, totalProbability: 0, winProbability: 0 }
            )
        };

        scoreDealerBasedFacts.playerAdvantage = {
            hands: scoreDealerBasedFacts.winProbability - scoreDealerBasedFacts.lossProbability,
            payout:
                scoreDealerBasedFacts.winProbability *
                    (isBlackjack(scoreStats.representativeHand.cardSymbols) && blackjackPayout
                        ? 1.5
                        : 1) -
                scoreDealerBasedFacts.lossProbability
        };

        return {
            ...reduced,
            [scoreStats.key]: scoreDealerBasedFacts
        };
    }, <AllScoreDealerCardBasedFacts>{});

    const probabilities: AllScoreDealerCardBasedProbabilities = {
        facts: allScoreStatsFacts,
        lossProbability: Object.values(allScoreStats).reduce(
            (reduced, scoreStats) =>
                reduced +
                scoreStats.initialHandProbability *
                    allScoreStatsFacts[scoreStats.key].lossProbability,
            0
        ),
        playerAdvantage: Object.values(allScoreStats).reduce<PlayerAdvantage>(
            (reduced, scoreStats) => ({
                hands:
                    reduced.hands +
                    scoreStats.initialHandProbability *
                        allScoreStatsFacts[scoreStats.key].playerAdvantage.hands,
                payout:
                    reduced.payout +
                    scoreStats.initialHandProbability *
                        allScoreStatsFacts[scoreStats.key].playerAdvantage.payout
            }),
            { hands: 0, payout: 0 }
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

export const getPlayerScoreStats = (allScoreStats: ScoreStats[]) => {
    return (
        sortScoreStats(allScoreStats)
            // Filter out single card hands when displaying player scores
            .map((scoreStats) => ({
                ...scoreStats,
                combinations: scoreStats.combinations.filter((combination) =>
                    combination.includes(',')
                )
            }))
            .filter((scoreStats) => scoreStats.combinations.length > 0)
    );
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
    return [...allScoreStats].sort((a, b) => {
        const isBlackjackA = a.key === ScoreKey.blackjack;
        const isBlackjackB = b.key === ScoreKey.blackjack;

        return a.representativeHand.allScores.length === b.representativeHand.allScores.length
            ? isBlackjackA
                ? -1
                : isBlackjackB
                ? 1
                : a.representativeHand.effectiveScore - b.representativeHand.effectiveScore
            : a.representativeHand.allScores.length - b.representativeHand.allScores.length;
    });
};
