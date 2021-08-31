import { Action, Dictionary } from '../types';

export const dealerStandingScore = 17;
export const decksNumber = 6;
export const maximumScore = 21;

export const actionColors: Dictionary<string, Action> = {
    [Action.Hitting]: 'rgb(66, 139, 202)',
    [Action.Standing]: 'rgb(92, 184, 92)'
};
