import React, { useEffect, useState } from 'react';
import { maximumScore } from '../constants';
import { Action, PlayerStrategy } from '../models';
import { PlayerStrategyData } from '../types';

interface PlayerStrategyComponentProps {
    playerStrategy: PlayerStrategyData;
    playerStrategySetter: (playerStrategy: PlayerStrategyData) => void;
    processing: boolean;
}

const parseStandThreshold = (value: string) => {
    const standThreshold = parseInt(value);

    const effectiveStandThreshold = Math.min(maximumScore, Math.max(4, standThreshold));
    return effectiveStandThreshold;
};

export const PlayerStrategyComponent: React.FC<PlayerStrategyComponentProps> = (props) => {
    const incomingStandThreshold = String(props.playerStrategy.standThreshold.value);
    const [standThreshold, setStandThreshold] = useState(incomingStandThreshold);

    useEffect(() => {
        if (incomingStandThreshold !== standThreshold) {
            setStandThreshold(incomingStandThreshold);
        }
    }, [props.playerStrategy]);

    return (
        <React.Fragment>
            <h3>Player strategy</h3>
            <ul>
                <li>
                    Decision criteria
                    <br />
                    {Object.values(PlayerStrategy).map((playerStrategyOption) => (
                        <React.Fragment key={playerStrategyOption}>
                            <input
                                checked={props.playerStrategy.strategy === playerStrategyOption}
                                disabled={props.processing}
                                name="player-strategy"
                                onChange={(option) => {
                                    props.playerStrategySetter({
                                        ...props.playerStrategy,
                                        strategy: option.target.value as PlayerStrategy
                                    });
                                }}
                                type="radio"
                                value={playerStrategyOption}
                            />
                            {playerStrategyOption === PlayerStrategy.maximumAdvantageHands
                                ? 'Maximize advantage'
                                : playerStrategyOption === PlayerStrategy.maximumAdvantagePayout
                                ? 'Maximize payout'
                                : playerStrategyOption === PlayerStrategy.maximumWin
                                ? 'Maximize winning'
                                : playerStrategyOption === PlayerStrategy.minimumLoss
                                ? 'Minimize losing'
                                : '-'}

                            <br />
                        </React.Fragment>
                    ))}
                    <br />
                </li>
                <li>
                    Optional actions
                    <br />
                    {Object.keys(props.playerStrategy.optionalActions).map(
                        (action: Action.double | Action.split) => (
                            <React.Fragment key={action}>
                                <input
                                    checked={props.playerStrategy.optionalActions[action]}
                                    disabled={props.processing}
                                    onChange={() => {
                                        props.playerStrategySetter({
                                            ...props.playerStrategy,
                                            optionalActions: {
                                                ...props.playerStrategy.optionalActions,
                                                [action]:
                                                    !props.playerStrategy.optionalActions[action]
                                            }
                                        });
                                    }}
                                    type="checkbox"
                                />
                                {action}
                                <br />
                            </React.Fragment>
                        )
                    )}
                    <br />
                </li>
                <li>
                    <input
                        checked={props.playerStrategy.standThreshold.active}
                        disabled={props.processing}
                        onChange={() => {
                            props.playerStrategySetter({
                                ...props.playerStrategy,
                                standThreshold: {
                                    ...props.playerStrategy.standThreshold,
                                    active: !props.playerStrategy.standThreshold.active
                                }
                            });
                        }}
                        type="checkbox"
                    />{' '}
                    Stand threshold
                    <br />
                    Always stand from{' '}
                    <input
                        disabled={props.processing || !props.playerStrategy.standThreshold.active}
                        onBlur={() => {
                            props.playerStrategySetter({
                                ...props.playerStrategy,
                                standThreshold: {
                                    ...props.playerStrategy.standThreshold,
                                    value: parseStandThreshold(standThreshold)
                                }
                            });
                        }}
                        onChange={(event) => {
                            setStandThreshold(event.target.value);
                        }}
                        type="number"
                        value={standThreshold}
                        style={{ width: 40 }}
                    />{' '}
                    {standThreshold !== incomingStandThreshold && '⌛️ '}
                    onwards
                    <br />
                    <input
                        checked={props.playerStrategy.standThreshold.useInSoftHands}
                        disabled={props.processing || !props.playerStrategy.standThreshold.active}
                        onChange={() => {
                            props.playerStrategySetter({
                                ...props.playerStrategy,
                                standThreshold: {
                                    ...props.playerStrategy.standThreshold,
                                    useInSoftHands:
                                        !props.playerStrategy.standThreshold.useInSoftHands
                                }
                            });
                        }}
                        type="checkbox"
                    />{' '}
                    Apply to soft hands
                </li>
            </ul>
        </React.Fragment>
    );
};
