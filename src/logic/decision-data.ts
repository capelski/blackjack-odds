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
        double,
        effectiveScore,
        hit,
        stand,
        standThreshold
    }: {
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
    [PlayerStrategy.hitLoss_standLoss]: ({ hit, stand }) => {
        return hit.outcome.lossProbability < stand.outcome.lossProbability
            ? PlayerDecision.hit
            : PlayerDecision.stand;
    },
    [PlayerStrategy.hitWin_standWin]: ({ hit, stand }) => {
        return hit.outcome.winProbability > stand.outcome.winProbability
            ? PlayerDecision.hit
            : PlayerDecision.stand;
    },
    [PlayerStrategy.hitLossMinusWin_standLossMinusWin]: ({ hit, stand }) => {
        return hit.outcome.playerAdvantage.payout > stand.outcome.playerAdvantage.payout
            ? PlayerDecision.hit
            : PlayerDecision.stand;
    },
    [PlayerStrategy.doubleLossMinusWin_hitLossMinusWin_standLossMinusWin]: ({
        double,
        hit,
        stand
    }) => {
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

    const doubleDecisionProbabilities = getDecisionProbabilityBreakdown({
        dealerProbabilities: applicableDealerProbabilities,
        playerProbabilities: doubleFinalProbabilities,
        playerScore: scoreStats.representativeHand.effectiveScore
    });
    const hitDecisionProbabilities = getDecisionProbabilityBreakdown({
        dealerProbabilities: applicableDealerProbabilities,
        playerProbabilities: hitFinalProbabilities,
        playerScore: scoreStats.representativeHand.effectiveScore
    });
    const standDecisionProbabilities = getDecisionProbabilityBreakdown({
        dealerProbabilities: applicableDealerProbabilities,
        playerProbabilities: standFinalProbabilities,
        playerScore: scoreStats.representativeHand.effectiveScore
    });

    const doubleDecisionOutcome = getDecisionOutcome({
        decisionProbabilities: doubleDecisionProbabilities,
        lossPayout: 2,
        winPayout: 2
    });
    const hitDecisionOutcome = getDecisionOutcome({
        decisionProbabilities: hitDecisionProbabilities,
        lossPayout: 1,
        winPayout: 1
    });
    const standDecisionOutcome = getDecisionOutcome({
        decisionProbabilities: standDecisionProbabilities,
        lossPayout: 1,
        winPayout:
            isBlackjack(scoreStats.representativeHand.cardSymbols) && blackjackPayout ? 1.5 : 1
    });

    const _canDouble = canDouble(scoreStats, doublingMode);

    return {
        [PlayerDecision.doubleHit]: {
            available: _canDouble,
            finalProbabilities: doubleFinalProbabilities,
            outcome: doubleDecisionOutcome,
            probabilityBreakdown: doubleDecisionProbabilities
        },
        [PlayerDecision.doubleStand]: {
            available: _canDouble,
            finalProbabilities: doubleFinalProbabilities,
            outcome: doubleDecisionOutcome,
            probabilityBreakdown: doubleDecisionProbabilities
        },
        [PlayerDecision.hit]: {
            available: scoreStats.representativeHand.effectiveScore < maximumScore,
            finalProbabilities: hitFinalProbabilities,
            outcome: hitDecisionOutcome,
            probabilityBreakdown: hitDecisionProbabilities
        },
        [PlayerDecision.stand]: {
            available: true,
            finalProbabilities: standFinalProbabilities,
            outcome: standDecisionOutcome,
            probabilityBreakdown: standDecisionProbabilities
        }
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
    const stand = allDecisionsData[PlayerDecision.stand];

    return playerStrategyPredicates[playerStrategy]({
        double,
        effectiveScore,
        hit,
        stand,
        standThreshold
    });
};
