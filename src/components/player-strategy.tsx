import React, { useEffect, useState } from 'react';
import { defaultStandThreshold, maximumScore } from '../constants';
import { playerStrategyLegend } from '../logic';
import { PlayerDecision, PlayerStrategy } from '../models';
import { PlayerSettings } from '../types';

interface PlayerStrategyComponentProps {
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
}

const getHitLimit = (standThreshold: number) => standThreshold - 1;

const parseStandThreshold = (hitLimit: string) => {
    const parsedHitLimit = parseInt(hitLimit) || getHitLimit(defaultStandThreshold);
    const hitLimitMax = maximumScore - 1;
    const hitLimitMin = 3;
    const effectiveHitLimit = Math.min(hitLimitMax, Math.max(hitLimitMin, parsedHitLimit));
    return effectiveHitLimit + 1;
};

export const PlayerStrategyComponent: React.FC<PlayerStrategyComponentProps> = (props) => {
    const actualHitLimit = String(getHitLimit(props.playerSettings.standThreshold));
    const [hitLimit, setHitLimit] = useState(actualHitLimit);

    useEffect(() => {
        setHitLimit(actualHitLimit);
    }, [props.playerSettings]);

    return (
        <React.Fragment>
            <h3>Player strategy</h3>
            {Object.values(PlayerStrategy).map((playerStrategyOption) => (
                <React.Fragment key={playerStrategyOption}>
                    <input
                        checked={props.playerSettings.playerStrategy === playerStrategyOption}
                        disabled={props.processing}
                        name="player-strategy"
                        onChange={(option) => {
                            props.playerSettingsSetter({
                                ...props.playerSettings,
                                playerStrategy: option.target.value as PlayerStrategy
                            });
                        }}
                        type="radio"
                        value={playerStrategyOption}
                    />

                    {playerStrategyOption === PlayerStrategy.standThreshold ? (
                        <React.Fragment>
                            {PlayerDecision.hit} until{' '}
                            <input
                                disabled={
                                    props.processing ||
                                    props.playerSettings.playerStrategy !==
                                        PlayerStrategy.standThreshold
                                }
                                onBlur={() => {
                                    props.playerSettingsSetter({
                                        ...props.playerSettings,
                                        standThreshold: parseStandThreshold(hitLimit)
                                    });
                                }}
                                onChange={(event) => {
                                    setHitLimit(event.target.value);
                                }}
                                type="number"
                                value={hitLimit}
                                style={{ width: 40 }}
                            />{' '}
                            {actualHitLimit !== hitLimit && '⌛️ '}
                            (inclusive) then {PlayerDecision.stand}
                        </React.Fragment>
                    ) : (
                        playerStrategyLegend[playerStrategyOption]
                    )}

                    <br />
                </React.Fragment>
            ))}
        </React.Fragment>
    );
};
