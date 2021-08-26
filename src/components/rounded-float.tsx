import React from 'react';

interface RoundedFloatProps {
    isPercentage?: boolean;
    value: number;
}

export const RoundedFloat: React.FC<RoundedFloatProps> = (props) => {
    const isPercentage = props.isPercentage === undefined || props.isPercentage;
    const multiplier = isPercentage ? 10000 : 100;
    const value = Math.round(props.value * multiplier) / 100;

    return (
        <React.Fragment>
            {props.value > 0 && value === 0 && '~'}
            {value}
            {isPercentage && '%'}
        </React.Fragment>
    );
};
