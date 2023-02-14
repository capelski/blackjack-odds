import { PlayerDecision } from '../models';
import { AllDecisionsData } from '../types';

type PlayerDecisionDisplayOptions = {
    /** When set to true, returns abbreviated player decisions. Defaults to false */
    abbreviate?: boolean;
    /** When set to true, omits secondary player decisions (e.g. turns "Double / Hit" into "Double"). Defaults to false */
    simplify?: boolean;
};

export const getDisplayPlayerDecision = (
    playerDecision: PlayerDecision,
    options: PlayerDecisionDisplayOptions = {}
) => {
    const abbreviate = options.abbreviate === undefined ? false : options.abbreviate;
    const simplify = options.simplify === undefined ? false : options.simplify;

    const decisionText = simplify
        ? playerDecision === PlayerDecision.doubleHit ||
          playerDecision === PlayerDecision.doubleStand
            ? 'Double'
            : playerDecision === PlayerDecision.splitHit ||
              playerDecision === PlayerDecision.splitStand
            ? 'Split'
            : playerDecision
        : playerDecision;

    const displayDecision =
        // simplify has priority over abbreviate; when using both, abbreviate will be ignored
        simplify || !abbreviate
            ? decisionText
            : playerDecision === PlayerDecision.doubleHit
            ? 'Dh'
            : playerDecision === PlayerDecision.doubleStand
            ? 'Ds'
            : playerDecision === PlayerDecision.splitHit
            ? 'Sh'
            : playerDecision === PlayerDecision.splitStand
            ? 'Ss'
            : playerDecision.substring(0, 1);

    return displayDecision;
};

export const getPrimaryPlayerDecisions = (decisions: AllDecisionsData) => {
    return Object.keys(decisions).filter(
        (playerDecision: PlayerDecision) =>
            decisions[playerDecision].available &&
            playerDecision !== PlayerDecision.doubleStand &&
            playerDecision !== PlayerDecision.splitStand
    );
};
