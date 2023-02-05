export const dealerStandThreshold = 17;
export const decimalsNumber = 2;
// Meant to validate computations during development
export const displayProbabilityTotals = false;
export const maximumScore = 21;
// Convenient way to make a blackjack score higher than a hard 21
export const blackjackScore = maximumScore + 0.5;

export const defaultBustingThreshold = 50;
export const defaultStandThreshold = 16;

export const handKeySeparator = ',';
export const scoreKeySeparator = '-';

export const probabilityLabels = {
    dealerBusting: `P (d > ${maximumScore})`,
    playerAdvantageHands: 'PA (hands)',
    playerAdvantagePayout: 'PA (payout)',
    playerBusting: `P (p > ${maximumScore})`,
    playerEqualToDealer: 'P (p = d)',
    playerLessThanCurrent: (current: string | number) => `P (p < ${current})`,
    playerLessThanDealer: 'P (p < d)',
    playerLoss: 'P (loss)',
    playerMoreThanDealer: 'P (p > d)',
    playerPush: 'P (push)',
    playerWin: 'P (win)',
    playerTotal: 'P (total)'
};
