import React from 'react';
import { PlayerFact } from '../types';
import { RoundedFloat } from './rounded-float';

interface InitialHandProbabilityProps {
    displayPercent?: boolean;
    playerFact?: PlayerFact;
}

export const InitialHandProbability: React.FC<InitialHandProbabilityProps> = (props) => {
    const displayPercent = typeof props.displayPercent === undefined ? true : props.displayPercent;
    const value = props.playerFact?.weight || 0;

    return <RoundedFloat displayPercent={displayPercent} value={value} />;
};
