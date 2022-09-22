import { maximumScore } from '../constants';
import { DoublingMode, PlayerDecision, PlayerStrategy, ScoreKey } from '../models';
import {
    AllDecisionsData,
    FinalScoreProbabilities,
    FinalScoresDictionary,
    OutcomesSet,
    ScoreStats,
    AllScoreStatsChoices,
    Dictionary,
    DecisionData
} from '../types';
import { getDecisionOutcome } from './decision-outcome';
import { getDecisionProbabilityBreakdown } from './decision-probability-breakdown';
import { canDouble } from './doubling-mode';
import {
    getApplicableDealerProbabilities,
    weightProbabilities,
    mergeProbabilities
} from './final-score-probabilities';
import { isBlackjack } from './hand';

const playerStrategyPredicates: Dictionary<
    ({
        bustingThreshold,
        double,
        effectiveScore,
        hit,
        stand,
        standThreshold
    }: {
        bustingThreshold: number;
        double: DecisionData;
        effectiveScore: number;
        hit: DecisionData;
        stand: DecisionData;
        standThreshold: number;
    }) => PlayerDecision,
    PlayerStrategy
> = {
    [PlayerStrategy.standThreshold]: ({ effectiveScore, standThreshold }) => {
        return effectiveScore < standThreshold ? PlayerDecision.hit : PlayerDecision.stand;
    },
    [PlayerStrategy.bustingThreshold]: ({ bustingThreshold, hit }) => {
        return hit.probabilityBreakdown.playerBusting < bustingThreshold / 100 && hit.available
            ? PlayerDecision.hit
            : PlayerDecision.stand;
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
    [PlayerStrategy.maximumPayout_hit_stand]: ({ hit, stand }) => {
        return hit.outcome.playerAdvantage.payout > stand.outcome.playerAdvantage.payout
            ? PlayerDecision.hit
            : PlayerDecision.stand;
    },
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
    }
};

export const getAllDecisionsData = ({
    blackjackPayout,
    dealerCardKey,
    dealerProbabilities,
    doublingMode,
    outcomesSet,
    scoreStats,
    scoreStatsDealerCardsDictionary
}: {
    blackjackPayout: boolean;
    dealerCardKey: ScoreKey;
    dealerProbabilities: FinalScoresDictionary;
    doublingMode: DoublingMode;
    outcomesSet: OutcomesSet;
    scoreStats: ScoreStats;
    scoreStatsDealerCardsDictionary: AllScoreStatsChoices;
}): AllDecisionsData => {
    const applicableDealerProbabilities = getApplicableDealerProbabilities(
        dealerProbabilities,
        dealerCardKey
    );

    const doubleFinalProbabilities: FinalScoreProbabilities =
        scoreStats.representativeHand.descendants
            .map((descendant) => ({
                [descendant.effectiveScore]: descendant.lastCard.weight / outcomesSet.totalWeight
            }))
            .reduce(mergeProbabilities, <FinalScoreProbabilities>{});
    const hitFinalProbabilities: FinalScoreProbabilities = scoreStats.representativeHand.descendants
        .map((descendant) => {
            let finalProbabilities: FinalScoreProbabilities = {
                [descendant.effectiveScore]: 1
            };

            if (descendant.effectiveScore < maximumScore) {
                const { dealerCardChoices } = scoreStatsDealerCardsDictionary[descendant.scoreKey];
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
                descendant.lastCard.weight / outcomesSet.totalWeight
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

    const _canDouble = canDouble(scoreStats, doublingMode);

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

    return {
        [PlayerDecision.doubleHit]: doubleDecisionData,
        [PlayerDecision.doubleStand]: doubleDecisionData,
        [PlayerDecision.hit]: hitDecisionData,
        [PlayerDecision.stand]: standDecisionData
    };
};

export const getPlayerChoice = ({
    allDecisionsData,
    bustingThreshold,
    effectiveScore,
    playerStrategy,
    standThreshold
}: {
    allDecisionsData: AllDecisionsData;
    bustingThreshold: number;
    effectiveScore: number;
    playerStrategy: PlayerStrategy;
    standThreshold: number;
}): PlayerDecision => {
    const double = allDecisionsData[PlayerDecision.doubleHit];
    const hit = allDecisionsData[PlayerDecision.hit];
    const stand = allDecisionsData[PlayerDecision.stand];

    return playerStrategyPredicates[playerStrategy]({
        bustingThreshold,
        double,
        effectiveScore,
        hit,
        stand,
        standThreshold
    });
};
