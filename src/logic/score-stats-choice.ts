import { DoublingMode, PlayerStrategy, ScoreKey } from '../models';
import {
    AllScoreStatsChoices,
    AllScoreStatsChoicesSummary,
    FinalScoreProbabilities,
    FinalScoresDictionary,
    OutcomesSet,
    PlayerDecisionsOverrides,
    ScoreStats,
    ScoreStatsAllDealerCardChoices,
    ScoreStatsChoice,
    ScoreStatsDealerCardChoice,
    SplitOptions
} from '../types';
import { getAllDecisionsData, getPlayerChoice } from './decision-data';
import { mergeOutcomesByOutcomeSet, mergeOutcomesByInitialHands } from './decision-outcome';
import { mergeProbabilities, weightProbabilities } from './final-score-probabilities';

type ScoreStatsChoiceBaseParameters = {
    blackjackPayout: boolean;
    dealerProbabilities: FinalScoresDictionary;
    doublingMode: DoublingMode;
    outcomesSet: OutcomesSet;
    playerDecisionsOverrides: PlayerDecisionsOverrides;
    playerStrategy: PlayerStrategy;
    splitOptions: SplitOptions;
    standThreshold: number;
};

const getScoreStatsDealerCardChoice = (
    params: ScoreStatsChoiceBaseParameters & {
        dealerCardKey: ScoreKey;
        scoreStats: ScoreStats;
        scoreStatsDealerCardsDictionary: AllScoreStatsChoices;
    }
): ScoreStatsDealerCardChoice => {
    const decisions = getAllDecisionsData(params);

    const choice =
        params.playerDecisionsOverrides[params.scoreStats.key]?.[params.dealerCardKey] ||
        getPlayerChoice({
            allDecisionsData: decisions,
            effectiveScore: params.scoreStats.representativeHand.effectiveScore,
            playerStrategy: params.playerStrategy,
            standThreshold: params.standThreshold
        });

    return {
        choice,
        decisions,
        finalScoreProbabilities: decisions[choice].finalProbabilities
    };
};

const getScoreStatsChoice = (
    params: ScoreStatsChoiceBaseParameters & {
        scoreStats: ScoreStats;
        scoreStatsDealerCardsDictionary: AllScoreStatsChoices;
    }
): ScoreStatsChoice => {
    const dealerCardChoices = params.outcomesSet.allOutcomes
        .map((cardOutcome) => cardOutcome.key)
        .reduce((dealerCardReduced, dealerCardKey) => {
            return {
                ...dealerCardReduced,
                [dealerCardKey]: getScoreStatsDealerCardChoice({
                    dealerCardKey,
                    ...params
                })
            };
        }, <ScoreStatsAllDealerCardChoices>{});

    const decisionOutcome = mergeOutcomesByOutcomeSet({
        outcomesSet: params.outcomesSet,
        scoreStatsAllChoices: dealerCardChoices
    });

    return {
        decisionOutcome,
        dealerCardChoices,
        finalScoreProbabilities: Object.keys(dealerCardChoices)
            .map((dealerCardKey: ScoreKey) =>
                weightProbabilities(
                    dealerCardChoices[dealerCardKey].finalScoreProbabilities,
                    params.outcomesSet.allWeights[dealerCardKey]
                )
            )
            .reduce(mergeProbabilities, <FinalScoreProbabilities>{})
    };
};

export const getAllScoresStatsChoicesSummary = (
    params: ScoreStatsChoiceBaseParameters & {
        allScoreStats: ScoreStats[];
    }
): AllScoreStatsChoicesSummary => {
    const choices = params.allScoreStats.reduce((reduced, scoreStats) => {
        return {
            ...reduced,
            [scoreStats.key]: getScoreStatsChoice({
                ...params,
                scoreStats,
                scoreStatsDealerCardsDictionary: reduced
            })
        };
    }, <AllScoreStatsChoices>{});

    const outcome = mergeOutcomesByInitialHands({
        allScoreStats: params.allScoreStats,
        allScoreStatsChoices: choices
    });

    return {
        choices,
        outcome
    };
};
