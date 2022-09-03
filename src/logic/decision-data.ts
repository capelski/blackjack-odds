import { blackjackScore } from '../constants';
import { PlayerDecision, PlayerStrategy, ScoreKey } from '../models';
import {
    AllDecisionsData,
    FinalScoreProbabilities,
    FinalScoresDictionary,
    OutcomesSet,
    ScoreStats,
    AllScoreStatsChoices
} from '../types';
import { getDecisionOutcome } from './decision-outcome';
import { getDecisionProbabilityBreakdown } from './decision-probability-breakdown';
import {
    getApplicableDealerProbabilities,
    weightProbabilities,
    mergeProbabilities
} from './final-score-probabilities';

export const getAllDecisionsData = ({
    dealerCardKey,
    dealerProbabilities,
    outcomesSet,
    scoreStats,
    scoreStatsDealerCardsDictionary
}: {
    dealerCardKey: ScoreKey;
    dealerProbabilities: FinalScoresDictionary;
    outcomesSet: OutcomesSet;
    scoreStats: ScoreStats;
    scoreStatsDealerCardsDictionary: AllScoreStatsChoices;
}): AllDecisionsData => {
    const applicableDealerProbabilities = getApplicableDealerProbabilities(
        dealerProbabilities,
        dealerCardKey
    );

    const standFinalProbabilities: FinalScoreProbabilities = {
        [scoreStats.representativeHand.effectiveScore]: 1
    };
    const standDecisionProbabilities = getDecisionProbabilityBreakdown({
        dealerProbabilities: applicableDealerProbabilities,
        playerProbabilities: standFinalProbabilities,
        playerScore: scoreStats.representativeHand.effectiveScore
    });
    const standDecisionOutcome = getDecisionOutcome(standDecisionProbabilities);

    const hitFinalProbabilities: FinalScoreProbabilities = scoreStats.representativeHand.descendants
        .map((descendant) => {
            return weightProbabilities(
                descendant.effectiveScore >= blackjackScore
                    ? {
                          [descendant.effectiveScore]: 1
                      }
                    : scoreStatsDealerCardsDictionary[descendant.scoreKey].dealerCardChoices[
                          dealerCardKey
                      ].decisions[
                          scoreStatsDealerCardsDictionary[descendant.scoreKey].dealerCardChoices[
                              dealerCardKey
                          ].choice
                      ].finalProbabilities,
                descendant.lastCard.weight / outcomesSet.totalWeight
            );
        })
        .reduce(mergeProbabilities, <FinalScoreProbabilities>{});
    const hitDecisionProbabilities = getDecisionProbabilityBreakdown({
        dealerProbabilities: applicableDealerProbabilities,
        playerProbabilities: hitFinalProbabilities,
        playerScore: scoreStats.representativeHand.effectiveScore
    });
    const hitDecisionOutcome = getDecisionOutcome(hitDecisionProbabilities);

    return {
        [PlayerDecision.hit]: {
            outcome: hitDecisionOutcome,
            probabilityBreakdown: hitDecisionProbabilities,
            finalProbabilities: hitFinalProbabilities
        },
        [PlayerDecision.stand]: {
            outcome: standDecisionOutcome,
            probabilityBreakdown: standDecisionProbabilities,
            finalProbabilities: standFinalProbabilities
        }
    };
};

export const getPlayerChoice = ({
    allDecisionsData,
    hitMinimalProbabilityGain,
    playerStrategy
}: {
    allDecisionsData: AllDecisionsData;
    hitMinimalProbabilityGain: number;
    playerStrategy: PlayerStrategy;
}): PlayerDecision => {
    const hitDecisionData = allDecisionsData[PlayerDecision.hit];
    const standDecisionData = allDecisionsData[PlayerDecision.stand];

    const decisionComparison =
        playerStrategy === PlayerStrategy.hitBusting_standLessThanDealer
            ? standDecisionData.probabilityBreakdown.playerLessThanDealer -
              hitDecisionData.probabilityBreakdown.playerBusting
            : playerStrategy === PlayerStrategy.hitBustingOrLower_standLessThanDealer
            ? standDecisionData.probabilityBreakdown.playerLessThanDealer -
              (hitDecisionData.probabilityBreakdown.playerBusting +
                  hitDecisionData.probabilityBreakdown.playerLessThanCurrent)
            : playerStrategy === PlayerStrategy.hitLoss_standLoss
            ? standDecisionData.outcome.lossProbability - hitDecisionData.outcome.lossProbability
            : playerStrategy === PlayerStrategy.hitWin_standWin
            ? hitDecisionData.outcome.winProbability - standDecisionData.outcome.winProbability
            : standDecisionData.outcome.lossProbability -
              standDecisionData.outcome.winProbability -
              (hitDecisionData.outcome.lossProbability - hitDecisionData.outcome.winProbability);

    return decisionComparison > hitMinimalProbabilityGain
        ? PlayerDecision.hit
        : PlayerDecision.stand;
};
