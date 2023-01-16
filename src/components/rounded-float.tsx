import React from 'react';
import { decimalsNumber } from '../constants';

interface RoundedFloatProps {
    isPercentage?: boolean;
    value: number;
}

export const getRoundedFloat = (value: number, isPercentage = true): string => {
    const scale = Math.pow(10, decimalsNumber);
    const roundedValue = Math.round(value * scale * (isPercentage ? 100 : 1)) / scale;
    const prefix = value > 0 && roundedValue === 0 ? '~' : '';
    const suffix = isPercentage ? '%' : '';

    return prefix + roundedValue + suffix;
};

export const RoundedFloat: React.FC<RoundedFloatProps> = (props) => {
    const isPercentage = props.isPercentage === undefined || props.isPercentage;
    const roundedValue = getRoundedFloat(props.value, isPercentage);

    return <React.Fragment>{roundedValue}</React.Fragment>;
};
