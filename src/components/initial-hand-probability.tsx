import React from 'react';
import { isSplitEnabled } from '../logic';
import { ScoreKey } from '../models';
import { ScoreStats, SplitOptions } from '../types';
import { RoundedFloat } from './rounded-float';

interface InitialHandProbabilityProps {
    allScoreStats?: ScoreStats[];
    displayPercent?: boolean;
    scoreStats?: ScoreStats;
    splitOptions: SplitOptions;
}

export const InitialHandProbability: React.FC<InitialHandProbabilityProps> = (props) => {
    const displayPercent = typeof props.displayPercent === undefined ? true : props.displayPercent;

    let value = props.scoreStats?.initialHandProbability || 0;
    let isVirtualProbability = false;

    if (props.scoreStats && props.allScoreStats) {
        if (props.scoreStats.key === ScoreKey.hard21 || props.scoreStats.key === ScoreKey.soft21) {
            value = props.allScoreStats.find(
                (x) => x.key === ScoreKey.blackjack
            )!.initialHandProbability;
            isVirtualProbability = true;
        } else if (isSplitEnabled(props.splitOptions) && props.scoreStats.key === ScoreKey.hard20) {
            value = props.allScoreStats.find(
                (x) => x.key === ScoreKey.split10s
            )!.initialHandProbability;
            isVirtualProbability = true;
        }
    }

    return (
        <span
            style={{
                fontStyle: isVirtualProbability ? 'italic' : undefined,
                opacity: isVirtualProbability ? 0.5 : undefined
            }}
        >
            <RoundedFloat displayPercent={displayPercent} value={value} />
        </span>
    );
};
