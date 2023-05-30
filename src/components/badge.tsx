import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { desktopBreakpoint } from '../constants';

export interface BadgeProps {
    backgroundColor: string;
    color: string;
    style?: 'fill' | 'outline';
}

export const Badge: React.FC<BadgeProps> = (props) => {
    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });

    const { color, backgroundColor } =
        props.style === 'outline'
            ? { backgroundColor: props.color, color: props.backgroundColor }
            : props;

    return (
        <div
            style={{
                backgroundColor,
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
            {props.children}
        </div>
    );
};
