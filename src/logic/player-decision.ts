import { PlayerDecision } from '../models';

export const getDisplayPlayerDecision = (playerDecision: PlayerDecision) => {
    return playerDecision === PlayerDecision.doubleHit ||
        playerDecision === PlayerDecision.doubleStand
        ? 'Double'
        : playerDecision;
};
