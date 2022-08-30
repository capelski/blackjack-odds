import { probabilityLabels } from '../constants';
import { Dictionary } from '../types';
import { PlayerDecision } from './player-decision';

export enum PlayerStrategy {
    hitBusting_standLessThanDealer = 'hitBusting_standLessThanDealer',
    hitBustingOrLower_standLessThanDealer = 'hitBustingOrLower_standLessThanDealer',
    hitLoss_standLoss = 'hitLoss_standLoss',
    hitWin_standWin = 'hitWin_standWin',
    hitLossMinusWin_standLossMinusWin = 'hitLossMinusWin_standLossMinusWin'
}

export const playerStrategyLegend: Dictionary<string, PlayerStrategy> = {
    [PlayerStrategy.hitBusting_standLessThanDealer]: `${PlayerDecision.hit} when [ ${probabilityLabels.playerBusting} ] for ${PlayerDecision.hit} is LOWER than [ ${probabilityLabels.playerLessThanDealer} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.hitBustingOrLower_standLessThanDealer]: `${PlayerDecision.hit} when [ ${
        probabilityLabels.playerBusting
    } + ${probabilityLabels.playerLessThanCurrent('X')} ] for ${
        PlayerDecision.hit
    } is LOWER than [ ${probabilityLabels.playerLessThanDealer} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.hitLoss_standLoss]: `${PlayerDecision.hit} when [ ${probabilityLabels.playerLoss} ] for ${PlayerDecision.hit} is LOWER than [ ${probabilityLabels.playerLoss} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.hitWin_standWin]: `${PlayerDecision.hit} when [ ${probabilityLabels.playerWin} ] for ${PlayerDecision.hit} is HIGHER than [ ${probabilityLabels.playerWin} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.hitLossMinusWin_standLossMinusWin]: `${PlayerDecision.hit} when [ ${probabilityLabels.playerLoss} - ${probabilityLabels.playerWin} ] for ${PlayerDecision.hit} is LOWER than [ ${probabilityLabels.playerLoss} - ${probabilityLabels.playerWin} ] for ${PlayerDecision.stand}`
};
