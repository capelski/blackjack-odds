import {
    Action,
    AggregatedScore,
    HandProbabilities,
    OptimalActions,
    OutcomesSet,
    Turnover
} from '../types';
import { maximumScore } from './constants';
import {
    getEqualToScoreProbability,
    getHigherThanScoreProbability,
    getLowerThanScoreProbability
} from './hand-probabilities';
import { getDealerScores } from './utils';

export const createEmptyTurnover = (): Turnover => {
    return {
        canHit: true,
        dealerBusting: 0,
        hittingLoss: 0,
        losses: 0,
        playerBusting: 0,
        standingLoss: 0,
        ties: 0,
        wins: 0
    };
};

export const createTurnover = (
    aggregatedScore: AggregatedScore,
    dealerCardProbabilities: HandProbabilities,
    hittingLoss: number,
    playerProbabilities: HandProbabilities,
    optimalAction: Action,
    standingLoss: number
): Turnover => {
    const playerBusting = optimalAction === Action.Hitting ? playerProbabilities.overMaximum : 0;
    const dealerBusting = (1 - playerBusting) * dealerCardProbabilities.overMaximum;

    let losses, ties, wins: number;
    const dealerScores = getDealerScores();

    if (optimalAction === Action.Standing) {
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
                        getLowerThanScoreProbability(playerProbabilities, next)
                );
            }, 0);

        ties = dealerScores.reduce((reduced, next) => {
            return (
                reduced +
                getEqualToScoreProbability(dealerCardProbabilities, next) *
                    getEqualToScoreProbability(playerProbabilities, next)
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
                            getHigherThanScoreProbability(playerProbabilities, next)
                    );
                }, 0);
    }

    return {
        canHit: playerProbabilities.canHit,
        dealerBusting,
        hittingLoss,
        losses,
        playerBusting,
        standingLoss,
        ties,
        wins
    };
};

export const getOverallTurnover = (
    optimalActions: OptimalActions,
    outcomesSet: OutcomesSet
): Turnover => {
    return outcomesSet.allOutcomes
        .map((cardOutcome) => {
            return weightTurnover(
                optimalActions[cardOutcome.key].turnover,
                cardOutcome.weight / outcomesSet.totalWeight
            );
        })
        .reduce(mergeTurnovers, createEmptyTurnover());
};

export const mergeTurnovers = (a: Turnover, b: Turnover): Turnover => {
    return {
        canHit: a.canHit && b.canHit,
        dealerBusting: a.dealerBusting + b.dealerBusting,
        hittingLoss: a.hittingLoss + b.hittingLoss,
        losses: a.losses + b.losses,
        playerBusting: a.playerBusting + b.playerBusting,
        standingLoss: a.standingLoss + b.standingLoss,
        ties: a.ties + b.ties,
        wins: a.wins + b.wins
    };
};

export const weightTurnover = (turnover: Turnover, weight: number): Turnover => {
    return {
        canHit: turnover.canHit,
        dealerBusting: turnover.dealerBusting * weight,
        hittingLoss: turnover.hittingLoss * weight,
        losses: turnover.losses * weight,
        playerBusting: turnover.playerBusting * weight,
        standingLoss: turnover.standingLoss * weight,
        ties: turnover.ties * weight,
        wins: turnover.wins * weight
    };
};
