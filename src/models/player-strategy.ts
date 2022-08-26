import { probabilityLabels } from '../constants';
import { Dictionary } from '../types';
import { PlayerDecision } from './player-decision';

export enum PlayerStrategy {
    busting = 'busting',
    lowerThanCurrent = 'lowerThanCurrent',
    lowerThanDealer = 'lowerThanDealer',
    winPushProbabilityComparison = 'winPushProbabilityComparison'
}

export const playerStrategyLegend: Dictionary<string, PlayerStrategy> = {
    [PlayerStrategy.busting]: `${PlayerDecision.hit} when [ ${probabilityLabels.playerBusting} ] for ${PlayerDecision.hit} is lower than [ ${probabilityLabels.playerLessThanDealer} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.lowerThanCurrent]: `${PlayerDecision.hit} when [ ${
        probabilityLabels.playerBusting
    } + ${probabilityLabels.playerLessThanCurrent('X')} ] for ${
        PlayerDecision.hit
    } is lower than [ ${probabilityLabels.playerLessThanDealer} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.lowerThanDealer]: `${PlayerDecision.hit} when [ ${probabilityLabels.playerBusting} + ${probabilityLabels.playerLessThanDealer} ] for ${PlayerDecision.hit} is lower than [ ${probabilityLabels.playerLessThanDealer} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.winPushProbabilityComparison]: `${PlayerDecision.hit} when [ 2 * ${probabilityLabels.playerWin} + ${probabilityLabels.playerPush} ] for ${PlayerDecision.hit} is higher than [ 2 * ${probabilityLabels.playerWin} + ${probabilityLabels.playerPush} ] for ${PlayerDecision.stand}`
};
