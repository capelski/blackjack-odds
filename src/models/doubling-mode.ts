import { scoreKeySeparator } from '../constants';
import { Dictionary } from '../types';

export enum DoublingMode {
    none = 'none',
    nine_ten_eleven = 'nine_ten_eleven',
    nine_ten_eleven_plus_soft = 'nine_ten_eleven_plus_soft',
    any_pair = 'any_pair'
}

export const displayDoublingModes: Dictionary<string, DoublingMode> = {
    [DoublingMode.none]: 'None',
    [DoublingMode.nine_ten_eleven]: '9, 10, 11',
    [DoublingMode.nine_ten_eleven_plus_soft]: `9, 10, 11, 9${scoreKeySeparator}19, 10${scoreKeySeparator}20`,
    [DoublingMode.any_pair]: 'Any pair'
};
