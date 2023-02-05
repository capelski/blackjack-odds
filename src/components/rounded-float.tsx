import React from 'react';
import { decimalsNumber } from '../constants';

interface RoundedFloatProps {
    displayPercent?: boolean;
    isPercentage?: boolean;
    value: number;
}

export const getRoundedFloat = (
    value: number,
    isPercentage = true,
    displayPercent = true
): string => {
    const scale = Math.pow(10, decimalsNumber);
    const roundedValue = Math.round(value * scale * (isPercentage ? 100 : 1)) / scale;
    const prefix = value > 0 && roundedValue === 0 ? '~' : '';
    const suffix = isPercentage ? '%' : '';

    return `${prefix}${roundedValue}${displayPercent ? suffix : ''}`;
};

export const RoundedFloat: React.FC<RoundedFloatProps> = (props) => {
    const displayPercent = props.displayPercent === undefined || props.displayPercent;
    const isPercentage = props.isPercentage === undefined || props.isPercentage;
    const roundedValue = getRoundedFloat(props.value, isPercentage, displayPercent);

    return <React.Fragment>{roundedValue}</React.Fragment>;
};
