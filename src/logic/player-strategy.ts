import { probabilityLabels } from '../constants';
import { PlayerStrategy, PlayerDecision } from '../models';
import { Dictionary } from '../types';
import { getDisplayPlayerDecision } from './player-decision';

export const playerStrategyLegend: Dictionary<string, PlayerStrategy> = {
    [PlayerStrategy.standThreshold]: `${PlayerDecision.hit} when score is LOWER than `,
    [PlayerStrategy.bustingThreshold]: `${PlayerDecision.hit} when [ ${probabilityLabels.playerBusting} ] for ${PlayerDecision.hit} is LOWER than `,
    [PlayerStrategy.hitBusting_standLessThanDealer]: `${PlayerDecision.hit} when [ ${probabilityLabels.playerBusting} ] for ${PlayerDecision.hit} is LOWER than [ ${probabilityLabels.playerLessThanDealer} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.hitBustingOrLower_standLessThanDealer]: `${PlayerDecision.hit} when [ ${
        probabilityLabels.playerBusting
    } + ${probabilityLabels.playerLessThanCurrent('X')} ] for ${
        PlayerDecision.hit
    } is LOWER than [ ${probabilityLabels.playerLessThanDealer} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.hitLoss_standLoss]: `${PlayerDecision.hit} when [ ${probabilityLabels.playerLoss} ] for ${PlayerDecision.hit} is LOWER than [ ${probabilityLabels.playerLoss} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.hitWin_standWin]: `${PlayerDecision.hit} when [ ${probabilityLabels.playerWin} ] for ${PlayerDecision.hit} is HIGHER than [ ${probabilityLabels.playerWin} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.hitLossMinusWin_standLossMinusWin]: `${PlayerDecision.hit} when [ ${probabilityLabels.playerAdvantagePayout} ] for ${PlayerDecision.hit} is HIGHER than [ ${probabilityLabels.playerAdvantagePayout} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.doubleLossMinusWin_hitLossMinusWin_standLossMinusWin]: `${
        PlayerDecision.hit
    } when [ ${probabilityLabels.playerAdvantagePayout} ] for ${
        PlayerDecision.hit
    } is HIGHER than [ ${probabilityLabels.playerAdvantagePayout} ] for ${
        PlayerDecision.stand
    }; ${getDisplayPlayerDecision(PlayerDecision.doubleHit)} when [ ${
        probabilityLabels.playerAdvantagePayout
    } ] for ${getDisplayPlayerDecision(PlayerDecision.doubleHit)} is HIGHER than [ ${
        probabilityLabels.playerAdvantagePayout
    } ] for both ${PlayerDecision.hit} and ${PlayerDecision.stand}`
};
