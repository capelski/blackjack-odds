import React from 'react';
import { Badge, BadgeProps } from './badge';
import { RoundedFloat } from './rounded-float';

interface OutcomeBadgeProps extends BadgeProps {
    name: string;
    value: number;
}

export const OutcomeBadge: React.FC<OutcomeBadgeProps> = (props) => {
    return (
        <Badge {...props}>
            <div>{props.name}</div>
            <div>
                <span style={{ fontSize: 24 }}>
                    <RoundedFloat displayPercent={false} value={props.value} />
                </span>{' '}
                %
            </div>
        </Badge>
    );
};
