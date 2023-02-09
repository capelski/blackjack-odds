import { maximumScore } from '../constants';
import { DoublingMode, PlayerDecision, PlayerStrategy, ScoreKey } from '../models';
import {
    AllDecisionsData,
    AllScoreStatsChoices,
    DecisionData,
    Dictionary,
    FinalScoreProbabilities,
    FinalScoresDictionary,
    OutcomesSet,
    ScoreStats,
    SplitHand,
    SplitOptions
} from '../types';
import { getDecisionOutcome } from './decision-outcome';
import { getDecisionProbabilityBreakdown } from './decision-probability-breakdown';
import {
    getApplicableDealerProbabilities,
    weightProbabilities,
    mergeProbabilities
} from './final-score-probabilities';
import { canDouble, canSplit, isBlackjack } from './hand';
import { isSplitEnabled } from './split-options';

type SplitFollowingDecision = {
    decision: PlayerDecision;
    finalProbabilities: FinalScoreProbabilities;
    lossPayout: number;
    splitDescendant: SplitHand;
    winPayout: number;
};

const hitStandComparison = ({ hit, stand }: { hit: DecisionData; stand: DecisionData }) => {
    return hit.outcome.playerAdvantage.payout > stand.outcome.playerAdvantage.payout
        ? PlayerDecision.hit
        : PlayerDecision.stand;
};

const playerStrategyPredicates: Dictionary<
    ({
        double,
        effectiveScore,
        hit,
        split,
        stand,
        standThreshold
    }: {
        double: DecisionData;
        effectiveScore: number;
        hit: DecisionData;
        split: DecisionData;
        stand: DecisionData;
        standThreshold: number;
    }) => PlayerDecision,
    PlayerStrategy
> = {
    [PlayerStrategy.standThreshold]: ({ effectiveScore, standThreshold }) => {
        return effectiveScore < standThreshold ? PlayerDecision.hit : PlayerDecision.stand;
    },
    [PlayerStrategy.hitBusting_standLessThanDealer]: ({ hit, stand }) => {
        return hit.probabilityBreakdown.playerBusting <
            stand.probabilityBreakdown.playerLessThanDealer
            ? PlayerDecision.hit
            : PlayerDecision.stand;
    },
    [PlayerStrategy.hitBustingOrLower_standLessThanDealer]: ({ hit, stand }) => {
        return hit.probabilityBreakdown.playerBusting +
            hit.probabilityBreakdown.playerLessThanCurrent <
            stand.probabilityBreakdown.playerLessThanDealer
            ? PlayerDecision.hit
            : PlayerDecision.stand;
    },
    [PlayerStrategy.minimumLoss_hit_stand]: ({ hit, stand }) => {
        return hit.outcome.lossProbability < stand.outcome.lossProbability
            ? PlayerDecision.hit
            : PlayerDecision.stand;
    },
    [PlayerStrategy.maximumWin_hit_stand]: ({ hit, stand }) => {
        return hit.outcome.winProbability > stand.outcome.winProbability
            ? PlayerDecision.hit
            : PlayerDecision.stand;
    },
    [PlayerStrategy.maximumPayout_hit_stand]: hitStandComparison,
    [PlayerStrategy.maximumPayout_hit_stand_double]: ({ double, hit, stand }) => {
        const shouldDouble =
            double.available &&
            double.outcome.playerAdvantage.payout > hit.outcome.playerAdvantage.payout &&
            double.outcome.playerAdvantage.payout > stand.outcome.playerAdvantage.payout;
        const hitOverStand =
            hit.outcome.playerAdvantage.payout > stand.outcome.playerAdvantage.payout;

        return shouldDouble
            ? hitOverStand
                ? PlayerDecision.doubleHit
                : PlayerDecision.doubleStand
            : hitOverStand
            ? PlayerDecision.hit
            : PlayerDecision.stand;
    },
    [PlayerStrategy.maximumPayout_hit_stand_split]: ({ hit, split, stand }) => {
        const shouldSplit =
            split.available &&
            split.outcome.playerAdvantage.payout > hit.outcome.playerAdvantage.payout &&
            split.outcome.playerAdvantage.payout > stand.outcome.playerAdvantage.payout;
        const hitOverStand =
            hit.outcome.playerAdvantage.payout > stand.outcome.playerAdvantage.payout;

        return shouldSplit
            ? hitOverStand
                ? PlayerDecision.splitHit
                : PlayerDecision.splitStand
            : hitOverStand
            ? PlayerDecision.hit
            : PlayerDecision.stand;
    },
    [PlayerStrategy.maximumPayout_hit_stand_double_split]: ({ double, hit, split, stand }) => {
        const hitOverStand =
            hit.outcome.playerAdvantage.payout > stand.outcome.playerAdvantage.payout;

        const shouldSplit =
            split.available &&
            split.outcome.playerAdvantage.payout > double.outcome.playerAdvantage.payout &&
            split.outcome.playerAdvantage.payout > hit.outcome.playerAdvantage.payout &&
            split.outcome.playerAdvantage.payout > stand.outcome.playerAdvantage.payout;

        const shouldDouble =
            double.available &&
            double.outcome.playerAdvantage.payout > hit.outcome.playerAdvantage.payout &&
            double.outcome.playerAdvantage.payout > stand.outcome.playerAdvantage.payout;

        return shouldSplit
            ? hitOverStand
                ? PlayerDecision.splitHit
                : PlayerDecision.splitStand
            : shouldDouble
            ? hitOverStand
                ? PlayerDecision.doubleHit
                : PlayerDecision.doubleStand
            : hitOverStand
            ? PlayerDecision.hit
            : PlayerDecision.stand;
    }
};

export const getAllDecisionsData = ({
    blackjackPayout,
    dealerCardKey,
    dealerProbabilities,
    doublingMode,
    outcomesSet,
    scoreStats,
    scoreStatsDealerCardsDictionary,
    splitOptions
}: {
    blackjackPayout: boolean;
    dealerCardKey: ScoreKey;
    dealerProbabilities: FinalScoresDictionary;
    doublingMode: DoublingMode;
    outcomesSet: OutcomesSet;
    scoreStats: ScoreStats;
    scoreStatsDealerCardsDictionary: AllScoreStatsChoices;
    splitOptions: SplitOptions;
}): AllDecisionsData => {
    const applicableDealerProbabilities = getApplicableDealerProbabilities(
        dealerProbabilities,
        dealerCardKey
    );
    const _canDouble = canDouble(scoreStats.representativeHand, doublingMode);
    const _isSplitEnabled = isSplitEnabled(splitOptions);
    const _canSplit = canSplit(scoreStats.representativeHand.cardSymbols, _isSplitEnabled);

    const doubleFinalProbabilities: FinalScoreProbabilities =
        scoreStats.representativeHand.hitDescendants
            .map((hitDescendant) => ({
                [hitDescendant.effectiveScore]:
                    hitDescendant.lastCard.weight / outcomesSet.totalWeight
            }))
            .reduce(mergeProbabilities, <FinalScoreProbabilities>{});
    const hitFinalProbabilities: FinalScoreProbabilities =
        scoreStats.representativeHand.hitDescendants
            .map((hitDescendant) => {
                let finalProbabilities: FinalScoreProbabilities = {
                    [hitDescendant.effectiveScore]: 1
                };

                if (hitDescendant.effectiveScore < maximumScore) {
                    const { dealerCardChoices } =
                        scoreStatsDealerCardsDictionary[hitDescendant.scoreKey];
                    const { choice, decisions } = dealerCardChoices[dealerCardKey];
                    finalProbabilities =
                        decisions[
                            choice === PlayerDecision.doubleHit
                                ? PlayerDecision.hit
                                : choice === PlayerDecision.doubleStand
                                ? PlayerDecision.stand
                                : choice
                        ].finalProbabilities;
                }

                return weightProbabilities(
                    finalProbabilities,
                    hitDescendant.lastCard.weight / outcomesSet.totalWeight
                );
            })
            .reduce(mergeProbabilities, <FinalScoreProbabilities>{});
    const standFinalProbabilities: FinalScoreProbabilities = {
        [scoreStats.representativeHand.effectiveScore]: 1
    };

    const doubleProbabilityBreakdown = getDecisionProbabilityBreakdown({
        dealerProbabilities: applicableDealerProbabilities,
        playerProbabilities: doubleFinalProbabilities,
        playerScore: scoreStats.representativeHand.effectiveScore
    });
    const hitProbabilityBreakdown = getDecisionProbabilityBreakdown({
        dealerProbabilities: applicableDealerProbabilities,
        playerProbabilities: hitFinalProbabilities,
        playerScore: scoreStats.representativeHand.effectiveScore
    });
    const standProbabilityBreakdown = getDecisionProbabilityBreakdown({
        dealerProbabilities: applicableDealerProbabilities,
        playerProbabilities: standFinalProbabilities,
        playerScore: scoreStats.representativeHand.effectiveScore
    });

    const doubleDecisionOutcome = getDecisionOutcome({
        decisionProbabilities: doubleProbabilityBreakdown,
        lossPayout: 2,
        winPayout: 2
    });
    const hitDecisionOutcome = getDecisionOutcome({
        decisionProbabilities: hitProbabilityBreakdown,
        lossPayout: 1,
        winPayout: 1
    });
    const standDecisionOutcome = getDecisionOutcome({
        decisionProbabilities: standProbabilityBreakdown,
        lossPayout: 1,
        winPayout:
            isBlackjack(scoreStats.representativeHand.cardSymbols) && blackjackPayout ? 1.5 : 1
    });

    const doubleDecisionData: DecisionData = {
        available: _canDouble,
        finalProbabilities: doubleFinalProbabilities,
        outcome: doubleDecisionOutcome,
        probabilityBreakdown: doubleProbabilityBreakdown
    };
    const hitDecisionData: DecisionData = {
        available: scoreStats.representativeHand.effectiveScore < maximumScore,
        finalProbabilities: hitFinalProbabilities,
        outcome: hitDecisionOutcome,
        probabilityBreakdown: hitProbabilityBreakdown
    };
    const standDecisionData: DecisionData = {
        available: true,
        finalProbabilities: standFinalProbabilities,
        outcome: standDecisionOutcome,
        probabilityBreakdown: standProbabilityBreakdown
    };

    /* Split final probabilities depend on each split hand following decision, but the following decision
    hasn't been computed yet for the current score stats: we need to access the DecisionData computed above */
    const currentScoreStatsDecisions = {
        [PlayerDecision.hit]: hitDecisionData,
        [PlayerDecision.stand]: hitDecisionData
    };
    const noSplitHitAllowed = !splitOptions.hitSplitAces && scoreStats.key === <ScoreKey>'A,A';
    const splitFollowingDecisions =
        scoreStats.representativeHand.splitDescendants.map<SplitFollowingDecision>(
            (splitDescendant) => {
                let decision: PlayerDecision;
                let decisionData: DecisionData;

                if (splitDescendant.key === scoreStats.key) {
                    decision = noSplitHitAllowed
                        ? PlayerDecision.stand
                        : hitStandComparison({
                              hit: hitDecisionData,
                              stand: standDecisionData
                          });
                    decisionData = currentScoreStatsDecisions[decision];
                } else {
                    const { dealerCardChoices } =
                        scoreStatsDealerCardsDictionary[splitDescendant.scoreKey];
                    const { choice, decisions } = dealerCardChoices[dealerCardKey];
                    decision = noSplitHitAllowed
                        ? PlayerDecision.stand
                        : choice === PlayerDecision.doubleHit
                        ? PlayerDecision.hit
                        : choice === PlayerDecision.doubleStand
                        ? PlayerDecision.stand
                        : choice;
                    decisionData = decisions[decision];
                }

                const lossPayout = 1 + decisionData.outcome.lossPayout;
                const winPayout = 1 + decisionData.outcome.winPayout;

                return {
                    decision,
                    finalProbabilities: decisionData.finalProbabilities,
                    lossPayout,
                    splitDescendant,
                    winPayout
                };
            }
        );
    const splitFinalProbabilities: FinalScoreProbabilities = splitFollowingDecisions
        .map((followingDecision) => {
            return weightProbabilities(
                followingDecision.finalProbabilities,
                followingDecision.splitDescendant.lastCard.weight / outcomesSet.totalWeight
            );
        })
        .reduce(mergeProbabilities, <FinalScoreProbabilities>{});
    const splitProbabilityBreakdown = getDecisionProbabilityBreakdown({
        dealerProbabilities: applicableDealerProbabilities,
        playerProbabilities: splitFinalProbabilities,
        playerScore: scoreStats.representativeHand.effectiveScore
    });
    const splitDecisionOutcome = getDecisionOutcome({
        decisionProbabilities: splitProbabilityBreakdown,
        lossPayout: splitFollowingDecisions.reduce((reduced, followingDecision) => {
            return (
                reduced +
                (followingDecision.lossPayout * followingDecision.splitDescendant.lastCard.weight) /
                    outcomesSet.totalWeight
            );
        }, 0),
        winPayout: splitFollowingDecisions.reduce((reduced, followingDecision) => {
            return (
                reduced +
                (followingDecision.winPayout * followingDecision.splitDescendant.lastCard.weight) /
                    outcomesSet.totalWeight
            );
        }, 0)
    });
    const splitDecisionData: DecisionData = {
        available: _canSplit,
        finalProbabilities: splitFinalProbabilities,
        outcome: splitDecisionOutcome,
        probabilityBreakdown: splitProbabilityBreakdown
    };

    return {
        [PlayerDecision.doubleHit]: doubleDecisionData,
        [PlayerDecision.doubleStand]: doubleDecisionData,
        [PlayerDecision.hit]: hitDecisionData,
        [PlayerDecision.splitHit]: splitDecisionData,
        [PlayerDecision.splitStand]: splitDecisionData,
        [PlayerDecision.stand]: standDecisionData
    };
};

export const getPlayerChoice = ({
    allDecisionsData,
    effectiveScore,
    playerStrategy,
    standThreshold
}: {
    allDecisionsData: AllDecisionsData;
    effectiveScore: number;
    playerStrategy: PlayerStrategy;
    standThreshold: number;
}): PlayerDecision => {
    const double = allDecisionsData[PlayerDecision.doubleHit];
    const hit = allDecisionsData[PlayerDecision.hit];
    const split = allDecisionsData[PlayerDecision.splitHit];
    const stand = allDecisionsData[PlayerDecision.stand];

    return playerStrategyPredicates[playerStrategy]({
        double,
        effectiveScore,
        hit,
        split,
        stand,
        standThreshold
    });
};
