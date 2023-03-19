import { CSSProperties } from 'react';
import { colors } from '../constants';
import { Action } from '../models';

export const getDisplayActions = (
    actions: Action[],
    /** When set to true, returns abbreviated player decisions. Defaults to false */
    abbreviate = false
) => {
    const [first, ...rest] = actions.map((x) => x.substring(0, 1));
    const displayActions = abbreviate
        ? `${first}${rest.map((x) => x.toLowerCase()).join('')}`
        : actions.join(' / ');

    const styles: CSSProperties =
        actions[0] === Action.double && actions[1] === Action.stand
            ? colors.doubleStand
            : actions[0] === Action.double
            ? colors.doubleHit
            : actions[0] === Action.hit
            ? colors.hit
            : actions[0] === Action.split && actions[1] === Action.stand
            ? colors.splitStand
            : actions[0] === Action.split
            ? colors.splitHit
            : actions[0] === Action.stand
            ? colors.stand
            : {};

    return { displayActions, styles };
};
