import { blackjackScore } from '../constants';
import { PlayerDecision, PlayerStrategy, ScoreKey } from '../models';
import {
    AllScoreDealerCardBasedFacts,
    AllScoreDealerCardBasedProbabilities,
    DealerCardBasedFacts,
    Dictionary,
    FinalScoreProbabilities,
    FinalScoresDictionary,
    Hand,
    OutcomesSet,
    PlayerAdvantage,
    PlayerDecisionsOverrides,
    ScoreAllDealerCardBasedFacts,
    ScoreDealerBasedFacts,
    ScoreStats
} from '../types';
import { getDecisionOutcome } from './decision-outcome';
import { getDecisionProbabilities } from './decision-probabilities';
import {
    getApplicableDealerProbabilities,
    mergeProbabilities,
    weightProbabilities
} from './final-score-probabilities';
import { isBlackjack } from './hand';

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
    dealerProbabilities: FinalScoresDictionary;
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

                const standFinalProbabilities: FinalScoreProbabilities = {
                    [scoreStats.representativeHand.effectiveScore]: 1
                };
                const standDecisionProbabilities = getDecisionProbabilities({
                    dealerProbabilities: applicableDealerProbabilities,
                    playerProbabilities: standFinalProbabilities,
                    playerScore: scoreStats.representativeHand.effectiveScore
                });
                const standDecisionOutcome = getDecisionOutcome(standDecisionProbabilities);

                const hitFinalProbabilities: FinalScoreProbabilities =
                    scoreStats.representativeHand.descendants
                        .map((descendant) => {
                            return weightProbabilities(
                                descendant.effectiveScore >= blackjackScore
                                    ? {
                                          [descendant.effectiveScore]: 1
                                      }
                                    : reduced[descendant.scoreKey].facts[dealerCardKey].decisions[
                                          reduced[descendant.scoreKey].facts[dealerCardKey].choice
                                      ].probabilities,
                                descendant.lastCard.weight / outcomesSet.totalWeight
                            );
                        })
                        .reduce(mergeProbabilities, <FinalScoreProbabilities>{});
                const hitDecisionProbabilities = getDecisionProbabilities({
                    dealerProbabilities: applicableDealerProbabilities,
                    playerProbabilities: hitFinalProbabilities,
                    playerScore: scoreStats.representativeHand.effectiveScore
                });
                const hitDecisionOutcome = getDecisionOutcome(hitDecisionProbabilities);

                const decisionComparison =
                    playerStrategy === PlayerStrategy.hitBusting_standLessThanDealer
                        ? standDecisionProbabilities.playerLessThanDealer -
                          hitDecisionProbabilities.playerBusting
                        : playerStrategy === PlayerStrategy.hitBustingOrLower_standLessThanDealer
                        ? standDecisionProbabilities.playerLessThanDealer -
                          (hitDecisionProbabilities.playerBusting +
                              hitDecisionProbabilities.playerLessThanCurrent)
                        : playerStrategy === PlayerStrategy.hitLoss_standLoss
                        ? standDecisionOutcome.lossProbability - hitDecisionOutcome.lossProbability
                        : playerStrategy === PlayerStrategy.hitWin_standWin
                        ? hitDecisionOutcome.winProbability - standDecisionOutcome.winProbability
                        : standDecisionOutcome.lossProbability -
                          standDecisionOutcome.winProbability -
                          (hitDecisionOutcome.lossProbability - hitDecisionOutcome.winProbability);

                const choice: PlayerDecision =
                    playerDecisionsOverrides[scoreStats.key]?.[dealerCardKey] ||
                    (decisionComparison > hitMinimalProbabilityGain
                        ? PlayerDecision.hit
                        : PlayerDecision.stand);

                const dealerCardBasedFacts: DealerCardBasedFacts = {
                    choice,
                    decisions: {
                        [PlayerDecision.hit]: {
                            decisionOutcome: hitDecisionOutcome,
                            decisionProbabilities: hitDecisionProbabilities,
                            probabilities: hitFinalProbabilities
                        },
                        [PlayerDecision.stand]: {
                            decisionOutcome: standDecisionOutcome,
                            decisionProbabilities: standDecisionProbabilities,
                            probabilities: standFinalProbabilities
                        }
                    }
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
                    const { choice } = scoreAllFacts[cardOutcome.key];
                    const { decisionOutcome } = scoreAllFacts[cardOutcome.key].decisions[choice];
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
