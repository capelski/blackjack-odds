import React, { useEffect, useState } from 'react';
import { defaultBustingThreshold, defaultStandThreshold, maximumScore } from '../constants';
import { playerStrategyLegend } from '../logic';
import { PlayerDecision, PlayerStrategy } from '../models';
import { PlayerSettings } from '../types';

interface PlayerStrategyComponentProps {
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
}

const getHitLimit = (standThreshold: number) => standThreshold - 1;

const parseBustingThreshold = (bustingThreshold: string) => {
    const parsedThreshold = parseFloat(bustingThreshold) ?? defaultBustingThreshold;
    const effectiveThreshold = Math.min(100, Math.max(0, parsedThreshold));
    return effectiveThreshold;
};

const parseStandThreshold = (hitLimit: string) => {
    const parsedHitLimit = parseInt(hitLimit) || getHitLimit(defaultStandThreshold);
    const hitLimitMax = maximumScore - 1;
    const hitLimitMin = 3;
    const effectiveHitLimit = Math.min(hitLimitMax, Math.max(hitLimitMin, parsedHitLimit));
    return effectiveHitLimit + 1;
};

export const PlayerStrategyComponent: React.FC<PlayerStrategyComponentProps> = (props) => {
    const [bustingThreshold, setBustingThreshold] = useState(
        String(props.playerSettings.bustingThreshold)
    );
    const [hitLimit, setHitLimit] = useState(
        String(getHitLimit(props.playerSettings.standThreshold))
    );
    const [pendingChanges, setPendingChanges] = useState(false);

    useEffect(() => {
        setBustingThreshold(String(props.playerSettings.bustingThreshold));
        setHitLimit(String(getHitLimit(props.playerSettings.standThreshold)));
        setPendingChanges(false);
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
                                    setPendingChanges(true);
                                }}
                                type="number"
                                value={hitLimit}
                                style={{ width: 40 }}
                            />{' '}
                            {props.playerSettings.playerStrategy ===
                                PlayerStrategy.standThreshold &&
                                pendingChanges &&
                                '⌛️ '}
                            (inclusive) then {PlayerDecision.stand}
                        </React.Fragment>
                    ) : playerStrategyOption === PlayerStrategy.bustingThreshold ? (
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
                                    setPendingChanges(true);
                                }}
                                step={10}
                                type="number"
                                value={bustingThreshold}
                                style={{ width: 40 }}
                            />
                            %{' '}
                            {props.playerSettings.playerStrategy ===
                                PlayerStrategy.bustingThreshold &&
                                pendingChanges &&
                                '⌛️ '}
                            (0 to 100)
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
