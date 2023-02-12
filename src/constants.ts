export const dealerStandThreshold = 17;
export const decimalsNumber = 2;
// Meant to validate computations during development
export const displayProbabilityTotals = false;
export const maximumScore = 21;
// Convenient way to make a blackjack score higher than a hard 21
export const blackjackScore = maximumScore + 0.5;

export const defaultStandThreshold = 16;

export const desktopBreakpoint = 768;

export const handKeySeparator = ',';
export const scoreKeySeparator = '-';

export const probabilityLabels = {
    dealerBusting: `D > ${maximumScore}`,
    playerAdvantageHands: 'PA (hands)',
    playerAdvantagePayout: 'PA (payout)',
    playerBusting: `P > ${maximumScore}`,
    playerEqualToDealer: 'P = D',
    playerLessThanCurrent: (current: string | number) => `P < ${current}`,
    playerLessThanDealer: 'P < D',
    playerLoss: 'P (loss)',
    playerMoreThanDealer: 'P > D',
    playerPush: 'P (push)',
    playerWin: 'P (win)',
    playerTotal: 'P (total)'
};
