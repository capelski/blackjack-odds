export const colors = {
    border: {
        highlight: 'coral',
        regular: 'black'
    },
    link: {
        default: 'black'
    },
    // Outcomes
    advantage: {
        backgroundColor: 'white',
        color: 'black'
    },
    loss: {
        backgroundColor: '#d9534f',
        color: 'white'
    },
    payout: {
        backgroundColor: '#428bca',
        color: 'white'
    },
    push: {
        backgroundColor: '#f0ad4e',
        color: 'white'
    },
    win: {
        backgroundColor: '#5cb85c',
        color: 'white'
    },
    // Player decision
    doubleHit: {
        backgroundColor: '#daa520',
        color: 'black'
    },
    doubleStand: {
        backgroundColor: '#b8860b',
        color: 'black'
    },
    hit: {
        backgroundColor: '#428bca',
        color: 'white'
    },
    splitHit: {
        backgroundColor: '#9a6f93',
        color: 'white'
    },
    splitStand: {
        backgroundColor: '#80567a',
        color: 'white'
    },
    stand: {
        backgroundColor: '#5cb85c',
        color: 'black'
    }
};

export const dealerStandThreshold = 17;

export const decimalsNumber = 2;

export const defaultStandThreshold = 16;

export const desktopBreakpoint = 768;

// Meant to validate computations during development
export const displayProbabilityTotals = false;

export const handKeySeparator = ',';

export const maximumScore = 21;
// Convenient way to make a blackjack score higher than a hard 21
export const blackjackScore = maximumScore + 0.5;

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

export const scoreKeySeparator = '-';
