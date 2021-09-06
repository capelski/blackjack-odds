import {
    Action,
    AggregatedScore,
    HandProbabilities,
    OptimalActions,
    OutcomesSet,
    Turnover
} from '../types';
import { dealerStandingScore } from './constants';
import {
    getEqualToScoreProbability,
    getHigherThanScoreProbability,
    getLowerThanScoreProbability
} from './hand-probabilities';

export const createEmptyTurnover = (): Turnover => {
    return {
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

    const losses =
        optimalAction === Action.Hitting
            ? playerBusting + getLowerThanScoreProbability(playerProbabilities, dealerStandingScore)
            : getHigherThanScoreProbability(dealerCardProbabilities, aggregatedScore.score);

    const ties =
        optimalAction === Action.Hitting
            ? getEqualToScoreProbability(playerProbabilities, dealerStandingScore)
            : getEqualToScoreProbability(dealerCardProbabilities, aggregatedScore.score);

    const wins =
        optimalAction === Action.Hitting
            ? getHigherThanScoreProbability(playerProbabilities, dealerStandingScore)
            : getLowerThanScoreProbability(dealerCardProbabilities, aggregatedScore.score) +
              dealerBusting;

    return {
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
        dealerBusting: turnover.dealerBusting * weight,
        hittingLoss: turnover.hittingLoss * weight,
        losses: turnover.losses * weight,
        playerBusting: turnover.playerBusting * weight,
        standingLoss: turnover.standingLoss * weight,
        ties: turnover.ties * weight,
        wins: turnover.wins * weight
    };
};
