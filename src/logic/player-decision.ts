import { PlayerDecision } from '../models';

export const getDisplayPlayerDecision = (playerDecision: PlayerDecision) => {
    return playerDecision === PlayerDecision.doubleHit ||
        playerDecision === PlayerDecision.doubleStand
        ? 'Double'
        : playerDecision === PlayerDecision.splitHit || playerDecision === PlayerDecision.splitStand
        ? 'Split'
        : playerDecision;
};

export const isVisibleDecision = (playerDecision: PlayerDecision) => {
    return (
        playerDecision !== PlayerDecision.doubleStand &&
        playerDecision !== PlayerDecision.splitStand
    );
};
