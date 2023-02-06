import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { desktopBreakpoint } from '../constants';
import { RoundedFloat } from './rounded-float';

interface BadgeProps {
    backgroundColor?: string;
    color?: string;
    name: string;
    value: number;
}

export const OutcomeBadge: React.FC<BadgeProps> = (props) => {
    const color = props.color || 'white';
    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });

    return (
        <div
            style={{
                backgroundColor: props.backgroundColor,
                border: `1px solid ${color}`,
                borderRadius: 8,
                color,
                flexGrow: 1,
                marginBottom: isDesktop ? 8 : 4,
                marginRight: isDesktop ? 8 : 4,
                paddingBottom: 8,
                paddingLeft: 4,
                paddingRight: 4,
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
