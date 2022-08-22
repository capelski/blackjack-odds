import { blackjackScore, maximumScore } from '../constants';
import { ScoreKey } from '../models';
import { AllEffectiveScoreProbabilities, EffectiveScoreProbabilities } from '../types';
import { getRangeProbability } from './effective-score-probabilities';

export const getApplicableDealerProbabilities = (
    dealerProbabilities: AllEffectiveScoreProbabilities,
    dealerCardKey: ScoreKey
): EffectiveScoreProbabilities => {
    return dealerProbabilities[dealerCardKey === ScoreKey.hard10 ? ScoreKey.figure : dealerCardKey];
};

export const getDealerBasedProbabilities = (
    playerScore: number,
    dealerProbabilities: EffectiveScoreProbabilities
) => {
    return {
        equalToDealer: getRangeProbability(dealerProbabilities, playerScore, playerScore),
        lessThanDealer: getRangeProbability(
            dealerProbabilities,
            playerScore + (playerScore === maximumScore ? 0.5 : 1),
            blackjackScore
        ),
        moreThanDealer: getRangeProbability(
            dealerProbabilities,
            0,
            playerScore - (playerScore === blackjackScore ? 0.5 : 1)
        )
    };
};
