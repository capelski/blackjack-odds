export enum PlayerStrategy {
    hitBusting_standLessThanDealer = 'hitBusting_standLessThanDealer',
    hitBustingOrLower_standLessThanDealer = 'hitBustingOrLower_standLessThanDealer',
    hitLoss_standLoss = 'hitLoss_standLoss',
    hitWin_standWin = 'hitWin_standWin',
    hitLossMinusWin_standLossMinusWin = 'hitLossMinusWin_standLossMinusWin',
    doubleLossMinusWin_hitLossMinusWin_standLossMinusWin = 'doubleLossMinusWin_hitLossMinusWin_standLossMinusWin'
}
