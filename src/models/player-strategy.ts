export enum PlayerStrategy {
    standThreshold = 'standThreshold',
    hitBusting_standLessThanDealer = 'hitBusting_standLessThanDealer',
    hitBustingOrLower_standLessThanDealer = 'hitBustingOrLower_standLessThanDealer',
    minimumLoss_hit_stand = 'minimumLoss_hit_stand',
    maximumWin_hit_stand = 'maximumWin_hit_stand',
    maximumPayout_hit_stand = 'maximumPayout_hit_stand',
    maximumPayout_hit_stand_double = 'maximumPayout_hit_stand_double',
    maximumPayout_hit_stand_split = 'maximumPayout_hit_stand_split',
    maximumPayout_hit_stand_double_split = 'maximumPayout_hit_stand_double_split'
}
