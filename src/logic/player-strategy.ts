import { probabilityLabels } from '../constants';
import { PlayerStrategy, PlayerDecision } from '../models';
import { Dictionary } from '../types';
import { getDisplayPlayerDecision } from './player-decision';

export const playerStrategyLegend: Dictionary<string, PlayerStrategy> = {
    [PlayerStrategy.standThreshold]: `${PlayerDecision.hit} only when score is LOWER than `,
    [PlayerStrategy.bustingThreshold]: `${PlayerDecision.hit} only when [ ${probabilityLabels.playerBusting} ] for ${PlayerDecision.hit} is LOWER than `,
    [PlayerStrategy.hitBusting_standLessThanDealer]: `${PlayerDecision.hit} only when [ ${probabilityLabels.playerBusting} ] for ${PlayerDecision.hit} is LOWER than [ ${probabilityLabels.playerLessThanDealer} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.hitBustingOrLower_standLessThanDealer]: `${PlayerDecision.hit} only when [ ${
        probabilityLabels.playerBusting
    } + ${probabilityLabels.playerLessThanCurrent('X')} ] for ${
        PlayerDecision.hit
    } is LOWER than [ ${probabilityLabels.playerLessThanDealer} ] for ${PlayerDecision.stand}`,
    [PlayerStrategy.hitLoss_standLoss]: `Minimum ${probabilityLabels.playerLoss}: ${PlayerDecision.hit} / ${PlayerDecision.stand}`,
    [PlayerStrategy.hitWin_standWin]: `Maximum ${probabilityLabels.playerWin}: ${PlayerDecision.hit} / ${PlayerDecision.stand}`,
    [PlayerStrategy.hitLossMinusWin_standLossMinusWin]: `Maximum ${probabilityLabels.playerAdvantagePayout}: ${PlayerDecision.hit} / ${PlayerDecision.stand}`,
    [PlayerStrategy.doubleLossMinusWin_hitLossMinusWin_standLossMinusWin]: `Maximum ${
        probabilityLabels.playerAdvantagePayout
    }: ${PlayerDecision.hit} / ${PlayerDecision.stand} / ${getDisplayPlayerDecision(
        PlayerDecision.doubleHit
    )}`
};
