import React, { useEffect, useState } from 'react';
import { maximumScore } from '../constants';
import { playerStrategyLegend } from '../logic';
import { PlayerStrategy } from '../models';
import { PlayerSettings } from '../types';

interface PlayerStrategyComponentProps {
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
}

const parseBustingThreshold = (bustingThreshold: string) => {
    const parsedThreshold = parseFloat(bustingThreshold) ?? 50;
    const effectiveThreshold = Math.min(100, Math.max(0, parsedThreshold));
    return effectiveThreshold;
};

const parseStandThreshold = (standThreshold: string) => {
    const parsedThreshold = parseInt(standThreshold) || 16;
    const effectiveThreshold = Math.min(maximumScore, Math.max(4, parsedThreshold));
    return effectiveThreshold;
};

export const PlayerStrategyComponent: React.FC<PlayerStrategyComponentProps> = (props) => {
    const [bustingThreshold, setBustingThreshold] = useState(
        String(props.playerSettings.bustingThreshold)
    );
    const [standThreshold, setStandThreshold] = useState(
        String(props.playerSettings.standThreshold)
    );

    useEffect(() => {
        setBustingThreshold(String(props.playerSettings.bustingThreshold));
        setStandThreshold(String(props.playerSettings.standThreshold));
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
                    {playerStrategyLegend[playerStrategyOption]}

                    {playerStrategyOption === PlayerStrategy.standThreshold && (
                        <React.Fragment>
                            <input
                                disabled={
                                    props.processing ||
                                    props.playerSettings.playerStrategy !==
                                        PlayerStrategy.standThreshold
                                }
                                onBlur={() => {
                                    props.playerSettingsSetter({
                                        ...props.playerSettings,
                                        standThreshold: parseStandThreshold(standThreshold)
                                    });
                                }}
                                onChange={(event) => {
                                    setStandThreshold(event.target.value);
                                }}
                                type="number"
                                value={standThreshold}
                                style={{ width: 40 }}
                            />{' '}
                            (4 to 21)
                        </React.Fragment>
                    )}

                    {playerStrategyOption === PlayerStrategy.bustingThreshold && (
                        <React.Fragment>
                            <input
                                disabled={
                                    props.processing ||
                                    props.playerSettings.playerStrategy !==
                                        PlayerStrategy.bustingThreshold
                                }
                                onBlur={() => {
                                    props.playerSettingsSetter({
                                        ...props.playerSettings,
                                        bustingThreshold: parseBustingThreshold(bustingThreshold)
                                    });
                                }}
                                onChange={(event) => {
                                    setBustingThreshold(event.target.value);
                                }}
                                step={10}
                                type="number"
                                value={bustingThreshold}
                                style={{ width: 40 }}
                            />
                            % (0 to 100)
                        </React.Fragment>
                    )}

                    <br />
                </React.Fragment>
            ))}
        </React.Fragment>
    );
};
