import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { CellProps } from 'react-table';
import { colors } from '../constants';
import { getDisplayPlayerDecision, getPlayerDecisionDealerCardPath } from '../logic';
import { PlayerDecision } from '../models';
import { AllScoreStatsChoicesSummary, CardOutcome, PlayerSettings, ScoreStats } from '../types';

interface PlayerDecisionsTableCellProps {
    abbreviate: boolean;
    dealerCard: CardOutcome;
    playerChoices: AllScoreStatsChoicesSummary;
    playerDecisionsEdit: boolean;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
}

const baseStyles: CSSProperties = {
    padding: '4px 0'
};

export const PlayerDecisionsTableCell = (props: PlayerDecisionsTableCellProps) => {
    return (cellProps: CellProps<ScoreStats>) => {
        const { key: scoreKey } = cellProps.row.original;
        const scoreStatsChoice = props.playerChoices.choices[scoreKey];

        /* scoreStatsChoice might be undefined during settings re-processing */
        if (!scoreStatsChoice) {
            return (
                <div style={baseStyles} key={props.dealerCard.symbol}>
                    -
                </div>
            );
        }

        const { choice, decisions } = scoreStatsChoice.dealerCardChoices[props.dealerCard.key];

        const actionStyles: CSSProperties =
            choice === PlayerDecision.doubleHit
                ? colors.doubleHit
                : choice === PlayerDecision.doubleStand
                ? colors.doubleStand
                : choice === PlayerDecision.hit
                ? colors.hit
                : choice === PlayerDecision.splitHit
                ? colors.splitHit
                : choice === PlayerDecision.splitStand
                ? colors.splitStand
                : choice === PlayerDecision.stand
                ? colors.stand
                : {};

        return (
            <div style={{ ...baseStyles, ...actionStyles }} key={props.dealerCard.symbol}>
                <div>
                    {!props.processing && props.playerDecisionsEdit ? (
                        <select
                            onChange={(event) => {
                                props.playerSettingsSetter({
                                    ...props.playerSettings,
                                    playerDecisionsOverrides: {
                                        ...props.playerSettings.playerDecisionsOverrides,
                                        [scoreKey]: {
                                            ...props.playerSettings.playerDecisionsOverrides[
                                                scoreKey
                                            ],
                                            [props.dealerCard.key]: event.target
                                                .value as PlayerDecision
                                        }
                                    }
                                });
                            }}
                            value={choice}
                        >
                            {Object.keys(decisions)
                                .filter(
                                    (playerDecision: PlayerDecision) =>
                                        decisions[playerDecision].available
                                )
                                .map((playerDecision) => {
                                    const option = getDisplayPlayerDecision(
                                        playerDecision as PlayerDecision,
                                        { abbreviate: props.abbreviate }
                                    );

                                    return (
                                        <option key={option} value={playerDecision}>
                                            {option}
                                        </option>
                                    );
                                })}
                        </select>
                    ) : (
                        <Link
                            to={getPlayerDecisionDealerCardPath(scoreKey, props.dealerCard.key)}
                            style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                            {getDisplayPlayerDecision(choice, { abbreviate: props.abbreviate })}
                        </Link>
                    )}
                </div>
            </div>
        );
    };
};
