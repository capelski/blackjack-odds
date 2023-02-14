import React, { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { CellProps } from 'react-table';
import { getDisplayPlayerDecision, getPlayerDecisionDealerCardPath } from '../logic';
import { PlayerDecision } from '../models';
import { AllScoreStatsChoicesSummary, CardOutcome, PlayerSettings, ScoreStats } from '../types';

interface ScoreStatsDealerCardChoiceCellProps {
    dealerCard: CardOutcome;
    isDesktop: boolean;
    playerChoices: AllScoreStatsChoicesSummary;
    playerDecisionsEdit: boolean;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
}

const baseStyles: CSSProperties = {
    padding: '4px 0'
};

export const ScoreStatsDealerCardChoiceCell = (props: ScoreStatsDealerCardChoiceCellProps) => {
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
                ? {
                      backgroundColor: 'goldenrod',
                      color: 'black'
                  }
                : choice === PlayerDecision.doubleStand
                ? {
                      backgroundColor: 'darkgoldenrod',
                      color: 'black'
                  }
                : choice === PlayerDecision.hit
                ? {
                      backgroundColor: 'rgb(66, 139, 202)',
                      color: 'white'
                  }
                : choice === PlayerDecision.splitHit
                ? {
                      backgroundColor: '#9A6F93',
                      color: 'white'
                  }
                : choice === PlayerDecision.splitStand
                ? {
                      backgroundColor: '#80567A',
                      color: 'white'
                  }
                : choice === PlayerDecision.stand
                ? {
                      backgroundColor: 'rgb(92, 184, 92)'
                  }
                : {};

        return (
            <div
                style={{
                    ...baseStyles,
                    ...actionStyles
                }}
                key={props.dealerCard.symbol}
            >
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
                                        { isDesktop: props.isDesktop }
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
                            {getDisplayPlayerDecision(choice, { isDesktop: props.isDesktop })}
                        </Link>
                    )}
                </div>
            </div>
        );
    };
};
