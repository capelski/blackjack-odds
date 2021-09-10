import { AggregatedScore, HandProbabilities, PlayerAction, Turnover } from '../types';
import { maximumScore } from './constants';
import {
    getEqualToScoreProbability,
    getHigherThanScoreProbability,
    getLowerThanScoreProbability
} from './hand-probabilities';
import { getDealerScores } from './utils';

export const createEmptyTurnover = (): Turnover => {
    return {
        dealerBusting: 0,
        isHittingBelowMaximumRisk: true,
        losses: 0,
        playerBusting: 0,
        ties: 0,
        wins: 0
    };
};

export const createTurnover = ({
    aggregatedScore,
    dealerCardProbabilities,
    playerAction,
    scoreProbabilities
}: {
    aggregatedScore: AggregatedScore;
    dealerCardProbabilities: HandProbabilities;
    playerAction: PlayerAction;
    scoreProbabilities: HandProbabilities;
}): Turnover => {
    const playerBusting =
        playerAction === PlayerAction.Hitting ? scoreProbabilities.overMaximum : 0;
    const dealerBusting = (1 - playerBusting) * dealerCardProbabilities.overMaximum;

    let losses, ties, wins: number;
    const dealerScores = getDealerScores();

    if (playerAction === PlayerAction.Standing) {
        losses = getHigherThanScoreProbability(dealerCardProbabilities, aggregatedScore.score);
        ties = getEqualToScoreProbability(dealerCardProbabilities, aggregatedScore.score);
        wins =
            getLowerThanScoreProbability(dealerCardProbabilities, aggregatedScore.score) +
            dealerBusting;
    } else {
        losses =
            playerBusting +
            dealerScores.reduce((reduced, next) => {
                return (
                    reduced +
                    getEqualToScoreProbability(dealerCardProbabilities, next) *
                        getLowerThanScoreProbability(scoreProbabilities, next)
                );
            }, 0);

        ties = dealerScores.reduce((reduced, next) => {
            return (
                reduced +
                getEqualToScoreProbability(dealerCardProbabilities, next) *
                    getEqualToScoreProbability(scoreProbabilities, next)
            );
        }, 0);

        wins =
            dealerBusting +
            dealerScores
                .filter((x) => x < maximumScore)
                .reduce((reduced, next) => {
                    return (
                        reduced +
                        getEqualToScoreProbability(dealerCardProbabilities, next) *
                            getHigherThanScoreProbability(scoreProbabilities, next)
                    );
                }, 0);
    }

    return {
        dealerBusting,
        isHittingBelowMaximumRisk: scoreProbabilities.isHittingBelowMaximumRisk,
        losses,
        playerBusting,
        ties,
        wins
    };
};

export const mergeTurnovers = (a: Turnover, b: Turnover): Turnover => {
    return {
        dealerBusting: a.dealerBusting + b.dealerBusting,
        isHittingBelowMaximumRisk: a.isHittingBelowMaximumRisk && b.isHittingBelowMaximumRisk,
        losses: a.losses + b.losses,
        playerBusting: a.playerBusting + b.playerBusting,
        ties: a.ties + b.ties,
        wins: a.wins + b.wins
    };
};

export const weightTurnover = (turnover: Turnover, weight: number): Turnover => {
    return {
        dealerBusting: turnover.dealerBusting * weight,
        isHittingBelowMaximumRisk: turnover.isHittingBelowMaximumRisk,
        losses: turnover.losses * weight,
        playerBusting: turnover.playerBusting * weight,
        ties: turnover.ties * weight,
        wins: turnover.wins * weight
    };
};
