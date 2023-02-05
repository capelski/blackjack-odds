import React from 'react';
import { RoundedFloat } from './rounded-float';

interface BadgeProps {
    backgroundColor?: string;
    color?: string;
    name: string;
    value: number;
}

export const OutcomeBadge: React.FC<BadgeProps> = (props) => {
    const color = props.color || 'white';
    return (
        <div
            style={{
                backgroundColor: props.backgroundColor,
                border: `1px solid ${color}`,
                borderRadius: 8,
                color,
                flexGrow: 1,
                margin: 8,
                paddingBottom: 8,
                paddingTop: 8,
                textAlign: 'center'
            }}
        >
            <div>{props.name}</div>
            <div>
                <span style={{ fontSize: 24 }}>
                    <RoundedFloat displayPercent={false} value={props.value} />
                </span>{' '}
                %
            </div>
        </div>
    );
};
