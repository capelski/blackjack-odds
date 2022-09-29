import React, { CSSProperties, useMemo, useState } from 'react';
import { Column, CellProps } from 'react-table';
import { displayProbabilityTotals, probabilityLabels } from '../constants';
import { getDisplayPlayerDecision, getPlayerScoreStats, isVisibleDecision } from '../logic';
import { PlayerDecision, ScoreKey } from '../models';
import {
    AllScoreStatsChoicesSummary,
    ExpandedRows,
    OutcomesSet,
    PlayerSettings,
    ScoreStats
} from '../types';
import { CustomTable } from './custom-table';
import { RoundedFloat } from './rounded-float';

interface ComponentCoreProps {
    allScoreStats: ScoreStats[];
    outcomesSet: OutcomesSet;
    playerChoices: AllScoreStatsChoicesSummary;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
}

const ComponentCore: React.FC<ComponentCoreProps> = (props) => {
    const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});
    const [playerDecisionsEdit, setPlayerDecisionsEdit] = useState(false);

    const { columns, data } = useMemo(() => {
        const columns: Column<ScoreStats>[] = [
            {
                Cell: (cellProps: CellProps<ScoreStats>) => {
                    const { key } = cellProps.row.original;
                    const scoreStatsChoice = props.playerChoices.choices[key];
                    /* scoreStatsChoice might be undefined during settings re-processing */
                    const decisionOutcome = scoreStatsChoice?.decisionOutcome;
                    const isRowExpanded = expandedRows[key];
                    return (
                        <div>
                            {key}{' '}
                            <span
                                onClick={() => {
                                    setExpandedRows({
                                        ...expandedRows,
                                        [key]: !isRowExpanded
                                    });
                                }}
                                style={{
                                    cursor: 'pointer'
                                }}
                            >
                                {isRowExpanded ? '✖️' : '👁️'}
                            </span>
                            {isRowExpanded && decisionOutcome && (
                                <React.Fragment>
                                    <br />
                                    {probabilityLabels.playerLoss}:{' '}
                                    <RoundedFloat value={decisionOutcome.lossProbability} />
                                    <br />
                                    {probabilityLabels.playerPush}:{' '}
                                    <RoundedFloat value={decisionOutcome.pushProbability} />
                                    <br />
                                    {probabilityLabels.playerWin}:{' '}
                                    <RoundedFloat value={decisionOutcome.winProbability} />
                                    <br />
                                    {probabilityLabels.playerAdvantageHands}:{' '}
                                    <RoundedFloat value={decisionOutcome.playerAdvantage.hands} />
                                    <br />
                                    {probabilityLabels.playerAdvantagePayout}:{' '}
                                    <RoundedFloat value={decisionOutcome.playerAdvantage.payout} />
                                    {displayProbabilityTotals && (
                                        <React.Fragment>
                                            <br />
                                            {probabilityLabels.playerTotal}:{' '}
                                            <RoundedFloat
                                                value={decisionOutcome.totalProbability}
                                            />
                                        </React.Fragment>
                                    )}
                                </React.Fragment>
                            )}
                        </div>
                    );
                },
                Header: 'Score',
                id: 'score'
            },
            ...props.outcomesSet.allOutcomes.map((cardOutcome) => ({
                Cell: (cellProps: CellProps<ScoreStats>) => {
                    const { key: scoreKey, representativeHand } = cellProps.row.original;
                    const scoreStatsChoice = props.playerChoices.choices[scoreKey];

                    /* scoreStatsChoice might be undefined during settings re-processing */
                    if (!scoreStatsChoice) {
                        return <div key={cardOutcome.symbol}>-</div>;
                    }

                    const { choice, decisions } =
                        scoreStatsChoice.dealerCardChoices[cardOutcome.key];
                    const isRowExpanded = expandedRows[scoreKey];

                    return (
                        <div key={cardOutcome.symbol}>
                            <div>
                                {!props.processing && playerDecisionsEdit ? (
                                    <select
                                        onChange={(event) => {
                                            props.playerSettingsSetter({
                                                ...props.playerSettings,
                                                playerDecisionsOverrides: {
                                                    ...props.playerSettings
                                                        .playerDecisionsOverrides,
                                                    [scoreKey]: {
                                                        ...props.playerSettings
                                                            .playerDecisionsOverrides[scoreKey],
                                                        [cardOutcome.key]: event.target
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
                                            .map((playerDecision) => (
                                                <option key={playerDecision} value={playerDecision}>
                                                    {playerDecision}
                                                </option>
                                            ))}
                                    </select>
                                ) : (
                                    choice
                                )}
                            </div>
                            {isRowExpanded && (
                                <div
                                    style={{
                                        paddingLeft: 4,
                                        paddingTop: 16,
                                        textAlign: 'left'
                                    }}
                                >
                                    {Object.keys(decisions)
                                        .filter(
                                            (playerDecision: PlayerDecision) =>
                                                decisions[playerDecision].available &&
                                                isVisibleDecision(playerDecision)
                                        )
                                        .map((playerDecision: PlayerDecision) => {
                                            const { outcome, probabilityBreakdown } =
                                                decisions[playerDecision];
                                            return (
                                                <React.Fragment key={playerDecision}>
                                                    {getDisplayPlayerDecision(playerDecision)}{' '}
                                                    -------
                                                    <br />
                                                    {`${probabilityLabels.playerBusting}: `}
                                                    <RoundedFloat
                                                        value={probabilityBreakdown.playerBusting}
                                                    />
                                                    <br />
                                                    {`${probabilityLabels.dealerBusting}: `}
                                                    <RoundedFloat
                                                        value={probabilityBreakdown.dealerBusting}
                                                    />
                                                    <br />
                                                    {`${probabilityLabels.playerLessThanDealer}: `}
                                                    <RoundedFloat
                                                        value={
                                                            probabilityBreakdown.playerLessThanDealer
                                                        }
                                                    />
                                                    <br />
                                                    {`${probabilityLabels.playerEqualToDealer}: `}
                                                    <RoundedFloat
                                                        value={
                                                            probabilityBreakdown.playerEqualToDealer
                                                        }
                                                    />
                                                    <br />
                                                    {`${probabilityLabels.playerMoreThanDealer}: `}
                                                    <RoundedFloat
                                                        value={
                                                            probabilityBreakdown.playerMoreThanDealer
                                                        }
                                                    />
                                                    {displayProbabilityTotals && (
                                                        <React.Fragment>
                                                            <br />
                                                            Total:{' '}
                                                            <RoundedFloat
                                                                value={probabilityBreakdown.total}
                                                            />
                                                        </React.Fragment>
                                                    )}
                                                    {representativeHand.allScores.length > 1 && (
                                                        <i>
                                                            <br />
                                                            {`${probabilityLabels.playerLessThanCurrent(
                                                                representativeHand.effectiveScore
                                                            )}: `}
                                                            <RoundedFloat
                                                                value={
                                                                    probabilityBreakdown.playerLessThanCurrent
                                                                }
                                                            />
                                                        </i>
                                                    )}
                                                    <br />
                                                    <br />
                                                    {probabilityLabels.playerLoss}:{' '}
                                                    <RoundedFloat value={outcome.lossProbability} />
                                                    <br />
                                                    {probabilityLabels.playerPush}:{' '}
                                                    <RoundedFloat value={outcome.pushProbability} />
                                                    <br />
                                                    {probabilityLabels.playerWin}:{' '}
                                                    <RoundedFloat value={outcome.winProbability} />
                                                    <br />
                                                    {probabilityLabels.playerAdvantageHands}:{' '}
                                                    <RoundedFloat
                                                        value={outcome.playerAdvantage.hands}
                                                    />
                                                    <br />
                                                    {probabilityLabels.playerAdvantagePayout}:{' '}
                                                    <RoundedFloat
                                                        value={outcome.playerAdvantage.payout}
                                                    />
                                                    {displayProbabilityTotals && (
                                                        <React.Fragment>
                                                            <br />
                                                            {probabilityLabels.playerTotal}:{' '}
                                                            <RoundedFloat
                                                                value={outcome.totalProbability}
                                                            />
                                                        </React.Fragment>
                                                    )}
                                                    <br />
                                                    <br />
                                                </React.Fragment>
                                            );
                                        })}
                                </div>
                            )}
                        </div>
                    );
                },
                Header: cardOutcome.symbol,
                id: cardOutcome.key // The column id must be the dealer card key for columnStyle to have access to it below
            }))
        ];

        const data = getPlayerScoreStats(props.allScoreStats);

        return { columns, data };
    }, [
        expandedRows,
        playerDecisionsEdit,
        props.allScoreStats,
        props.outcomesSet,
        props.playerChoices,
        props.playerSettings
    ]);

    return (
        <React.Fragment>
            {probabilityLabels.playerLoss}:{' '}
            <RoundedFloat value={props.playerChoices.outcome.lossProbability} />
            <br />
            {probabilityLabels.playerPush}:{' '}
            <RoundedFloat value={props.playerChoices.outcome.pushProbability} />
            <br />
            {probabilityLabels.playerWin}:{' '}
            <RoundedFloat value={props.playerChoices.outcome.winProbability} />
            <br />
            {displayProbabilityTotals && (
                <React.Fragment>
                    {probabilityLabels.playerTotal}:{' '}
                    <RoundedFloat value={props.playerChoices.outcome.totalProbability} />
                    <br />
                </React.Fragment>
            )}
            <br />
            {probabilityLabels.playerAdvantageHands}:{' '}
            <RoundedFloat value={props.playerChoices.outcome.playerAdvantage.hands} />
            <br />
            {probabilityLabels.playerAdvantagePayout}:{' '}
            <RoundedFloat value={props.playerChoices.outcome.playerAdvantage.payout} />
            <br />
            <br />
            <input
                checked={playerDecisionsEdit}
                disabled={props.processing}
                onChange={(event) => setPlayerDecisionsEdit(event.target.checked)}
                type="checkbox"
            />
            Edit player decisions{' '}
            <button
                disabled={
                    props.processing ||
                    Object.keys(props.playerSettings.playerDecisionsOverrides).length === 0
                }
                onClick={() => {
                    props.playerSettingsSetter({
                        ...props.playerSettings,
                        playerDecisionsOverrides: {}
                    });
                }}
                type="button"
            >
                Clear edits
            </button>
            <br />
            <CustomTable
                columns={columns}
                columnStyle={(cellProps) => {
                    const baseStyles: CSSProperties = {
                        border: '1px solid black',
                        padding: 0
                    };
                    const { key } = cellProps.row.original;
                    const dealerCardKey =
                        cellProps.column.id === 'score'
                            ? undefined
                            : (cellProps.column.id as ScoreKey);
                    const scoreStatsChoice = props.playerChoices.choices[key];

                    /* scoreStatsChoice might be undefined during settings re-processing */
                    if (!scoreStatsChoice || !dealerCardKey) {
                        return baseStyles;
                    }

                    if (props.playerSettings.playerDecisionsOverrides[key]?.[dealerCardKey]) {
                        baseStyles.border = '2px solid coral';
                    }

                    const { choice } = scoreStatsChoice.dealerCardChoices[dealerCardKey];
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

                    return {
                        ...baseStyles,
                        ...actionStyles
                    };
                }}
                data={data}
                width="100%"
            />
        </React.Fragment>
    );
};

interface PlayerDecisionsComponentProps {
    allScoreStats?: ScoreStats[];
    outcomesSet?: OutcomesSet;
    playerChoices?: AllScoreStatsChoicesSummary;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
}

export const PlayerDecisionsComponent: React.FC<PlayerDecisionsComponentProps> = (props) => {
    return (
        <div>
            <h3>Player decisions</h3>
            {props.allScoreStats !== undefined &&
            props.outcomesSet !== undefined &&
            props.playerChoices !== undefined ? (
                <ComponentCore
                    {...props}
                    allScoreStats={props.allScoreStats}
                    outcomesSet={props.outcomesSet}
                    playerChoices={props.playerChoices}
                />
            ) : (
                'Processing...'
            )}
        </div>
    );
};
