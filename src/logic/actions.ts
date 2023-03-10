import { CSSProperties } from 'react';
import { colors } from '../constants';
import { Action } from '../models';

type PlayerDecisionDisplayOptions = {
    /** When set to true, returns abbreviated player decisions. Defaults to false */
    abbreviate?: boolean;
};

export const getDisplayActions = (
    actions: Action[],
    options: PlayerDecisionDisplayOptions = {}
) => {
    const relevantActions =
        actions[0] === Action.split || actions[0] === Action.double
            ? actions.slice(0, 2)
            : [actions[0]];

    const mergedActions = relevantActions.join(' / ');

    const actionStyles: CSSProperties =
        mergedActions === `${Action.double} / ${Action.hit}`
            ? colors.doubleHit
            : mergedActions === `${Action.double} / ${Action.stand}`
            ? colors.doubleStand
            : mergedActions === Action.hit
            ? colors.hit
            : mergedActions === `${Action.split} / ${Action.hit}`
            ? colors.splitHit
            : mergedActions === `${Action.split} / ${Action.stand}`
            ? colors.splitStand
            : mergedActions === Action.stand
            ? colors.stand
            : {};

    const abbreviate = options.abbreviate === undefined ? false : options.abbreviate;

    let displayActions = mergedActions;
    if (abbreviate) {
        const [first, ...rest] = relevantActions.map((x) => x.substring(0, 1));
        displayActions = `${first}${rest.map((x) => x.toLowerCase()).join('')}`;
    }

    return { actionStyles, displayActions };
};

export const getOverrideActions = (availableActions: Action[]): Action[][] => {
    return availableActions
        .map((action) => {
            return action === Action.double
                ? [
                      [Action.double, Action.hit],
                      [Action.double, Action.stand]
                  ]
                : action === Action.split
                ? [
                      [Action.split, Action.hit],
                      [Action.split, Action.stand]
                  ]
                : [[action]];
        })
        .flat()
        .sort();
};
