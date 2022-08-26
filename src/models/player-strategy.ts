import { probabilityLabels } from '../constants';
import { Dictionary } from '../types';
import { PlayerDecision } from './player-decision';

export enum PlayerStrategy {
    hitBusting_standLessThanDealer = 'hitBusting_standLessThanDealer',
    hitBustingOrLower_standLessThanDealer = 'hitBustingOrLower_standLessThanDealer',
    hitBustingOrLessThanDealer_standLessThanDealer = 'hitBustingOrLessThanDealer_standLessThanDealer',
    hit2WinAndPush_stand2WinAndPush = 'hit2WinAndPush_stand2WinAndPush'
}

export const playerStrategyLegend: Dictionary<string, PlayerStrategy> = {
    [PlayerStrategy.hitBusting_standLessThanDealer]: `${PlayerDecision.hit} when [ ${probabilityLabels.playerBusting} ] for ${PlayerDecision.hit} is lower than [ ${probabilityLabels.playerLessThanDealer} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.hitBustingOrLower_standLessThanDealer]: `${PlayerDecision.hit} when [ ${
        probabilityLabels.playerBusting
    } + ${probabilityLabels.playerLessThanCurrent('X')} ] for ${
        PlayerDecision.hit
    } is lower than [ ${probabilityLabels.playerLessThanDealer} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.hitBustingOrLessThanDealer_standLessThanDealer]: `${PlayerDecision.hit} when [ ${probabilityLabels.playerBusting} + ${probabilityLabels.playerLessThanDealer} ] for ${PlayerDecision.hit} is lower than [ ${probabilityLabels.playerLessThanDealer} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.hit2WinAndPush_stand2WinAndPush]: `${PlayerDecision.hit} when [ 2 * ${probabilityLabels.playerWin} + ${probabilityLabels.playerPush} ] for ${PlayerDecision.hit} is higher than [ 2 * ${probabilityLabels.playerWin} + ${probabilityLabels.playerPush} ] for ${PlayerDecision.stand}`
};
