import { PlayerStrategy, ScoreKey } from '../models';
import {
    AllScoreStatsChoices,
    AllScoreStatsChoicesSummary,
    FinalScoresDictionary,
    OutcomesSet,
    PlayerDecisionsOverrides,
    ScoreStats,
    ScoreStatsAllDealerCardChoices,
    ScoreStatsChoice,
    ScoreStatsDealerCardChoice
} from '../types';
import { getAllDecisionsData, getPlayerChoice } from './decision-data';
import { mergeOutcomesByOutcomeSet, mergeOutcomesByInitialHands } from './decision-outcome';
import { getPlayerAdvantage, mergePlayerAdvantages } from './player-advantage';

type ScoreStatsChoiceBaseParameters = {
    dealerProbabilities: FinalScoresDictionary;
    hitMinimalProbabilityGain: number;
    outcomesSet: OutcomesSet;
    playerDecisionsOverrides: PlayerDecisionsOverrides;
    playerStrategy: PlayerStrategy;
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
            hitMinimalProbabilityGain: params.hitMinimalProbabilityGain,
            playerStrategy: params.playerStrategy
        });

    return {
        choice,
        decisions
    };
};

const getScoreStatsChoice = (
    params: ScoreStatsChoiceBaseParameters & {
        blackjackPayout: boolean;
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

    const playerAdvantage = getPlayerAdvantage({
        blackjackPayout: params.blackjackPayout,
        decisionOutcome,
        scoreStats: params.scoreStats
    });

    return {
        decisionOutcome,
        dealerCardChoices,
        playerAdvantage
    };
};

export const getAllScoresStatsChoicesSummary = (
    params: ScoreStatsChoiceBaseParameters & {
        allScoreStats: ScoreStats[];
        blackjackPayout: boolean;
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

    const playerAdvantage = mergePlayerAdvantages({
        allScoreStats: params.allScoreStats,
        allScoreStatsChoices: choices
    });

    return {
        choices,
        outcome,
        playerAdvantage
    };
};
