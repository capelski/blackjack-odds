import React from 'react';

interface RoundedFloatProps {
    decimals: number;
    isPercentage?: boolean;
    value: number;
}

export const getRoundedFloat = (value: number, decimals: number, isPercentage = true): string => {
    const scale = Math.pow(10, decimals);
    const roundedValue = Math.round(value * scale * (isPercentage ? 100 : 1)) / scale;
    const prefix = value > 0 && roundedValue === 0 ? '~' : '';
    const suffix = isPercentage ? '%' : '';

    return prefix + roundedValue + suffix;
};

export const RoundedFloat: React.FC<RoundedFloatProps> = (props) => {
    const isPercentage = props.isPercentage === undefined || props.isPercentage;
    const roundedValue = getRoundedFloat(props.value, props.decimals, isPercentage);

    return <React.Fragment>{roundedValue}</React.Fragment>;
};
