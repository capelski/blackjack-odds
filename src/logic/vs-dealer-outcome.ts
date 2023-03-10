import { VsDealerBreakdown, VsDealerOutcome } from '../types';

export const aggregateOutcomes = <T extends { vsDealerOutcome: VsDealerOutcome; weight: number }>(
    weightedOutcomes: T[]
): VsDealerOutcome => {
    return weightedOutcomes
        .map((weightedOutcome) => {
            return weightOutcomes(weightedOutcome.vsDealerOutcome, weightedOutcome.weight);
        })
        .reduce(mergeOutcomes, undefined!);
};

export const getVsDealerOutcome = ({
    vsDealerBreakdown,
    lossPayout,
    winPayout
}: {
    vsDealerBreakdown: VsDealerBreakdown;
    lossPayout: number;
    winPayout: number;
}): VsDealerOutcome => {
    const lossProbability =
        vsDealerBreakdown.playerBusting + vsDealerBreakdown.playerLessThanDealer;
    const winProbability = vsDealerBreakdown.playerMoreThanDealer + vsDealerBreakdown.dealerBusting;

    const vsDealerOutcome: VsDealerOutcome = {
        lossPayout,
        lossProbability,
        playerAdvantage: {
            hands: winProbability - lossProbability,
            payout: winProbability * winPayout - lossProbability * lossPayout
        },
        pushProbability: vsDealerBreakdown.playerEqualToDealer,
        totalProbability: 0,
        winPayout,
        winProbability
    };

    vsDealerOutcome.totalProbability =
        vsDealerOutcome.lossProbability +
        vsDealerOutcome.pushProbability +
        vsDealerOutcome.winProbability;

    return vsDealerOutcome;
};

const mergeOutcomes = (a: VsDealerOutcome | undefined, b: VsDealerOutcome): VsDealerOutcome => {
    return a
        ? {
              lossPayout: a.lossPayout + b.lossPayout,
              lossProbability: a.lossProbability + b.lossProbability,
              playerAdvantage: {
                  hands: a.playerAdvantage.hands + b.playerAdvantage.hands,
                  payout: a.playerAdvantage.payout + b.playerAdvantage.payout
              },
              pushProbability: a.pushProbability + b.pushProbability,
              totalProbability: a.totalProbability + b.totalProbability,
              winPayout: a.winPayout + b.winPayout,
              winProbability: a.winProbability + b.winProbability
          }
        : b;
};

const weightOutcomes = (vsDealerOutcome: VsDealerOutcome, weight: number): VsDealerOutcome => {
    return {
        lossPayout: vsDealerOutcome.lossPayout * weight,
        lossProbability: vsDealerOutcome.lossProbability * weight,
        playerAdvantage: {
            hands: vsDealerOutcome.playerAdvantage.hands * weight,
            payout: vsDealerOutcome.playerAdvantage.payout * weight
        },
        pushProbability: vsDealerOutcome.pushProbability * weight,
        totalProbability: vsDealerOutcome.totalProbability * weight,
        winPayout: vsDealerOutcome.winPayout * weight,
        winProbability: vsDealerOutcome.winProbability * weight
    };
};
