import { PlayerStrategy, PlayerDecision } from '../models';
import { Dictionary } from '../types';
import { getDisplayPlayerDecision } from './player-decision';

export const playerStrategyLegend: Dictionary<string, PlayerStrategy> = {
    [PlayerStrategy.standThreshold]: '-',
    [PlayerStrategy.hitBusting_standLessThanDealer]: `Lower probability: Score lower than dealer by ${PlayerDecision.stand}, Busting by ${PlayerDecision.hit}`,
    [PlayerStrategy.hitBustingOrLower_standLessThanDealer]: `Lower probability: Score lower than dealer by ${PlayerDecision.stand}, Busting + Score lower than current by ${PlayerDecision.hit}`,
    [PlayerStrategy.minimumLoss_hit_stand]: `Minimize loss: ${PlayerDecision.hit}, ${PlayerDecision.stand}`,
    [PlayerStrategy.maximumWin_hit_stand]: `Maximize win: ${PlayerDecision.hit}, ${PlayerDecision.stand}`,
    [PlayerStrategy.maximumPayout_hit_stand]: `Maximize payout: ${PlayerDecision.hit}, ${PlayerDecision.stand}`,
    [PlayerStrategy.maximumPayout_hit_stand_double]: `Maximize payout: ${PlayerDecision.hit}, ${
        PlayerDecision.stand
    }, ${getDisplayPlayerDecision(PlayerDecision.doubleHit, { simplify: true })}`,
    [PlayerStrategy.maximumPayout_hit_stand_split]: `Maximize payout: ${PlayerDecision.hit}, ${
        PlayerDecision.stand
    }, ${getDisplayPlayerDecision(PlayerDecision.splitHit, { simplify: true })}`,
    [PlayerStrategy.maximumPayout_hit_stand_double_split]: `Maximize payout: ${
        PlayerDecision.hit
    }, ${PlayerDecision.stand}, ${getDisplayPlayerDecision(PlayerDecision.doubleHit, {
        simplify: true
    })}, ${getDisplayPlayerDecision(PlayerDecision.splitHit, { simplify: true })}`
};
