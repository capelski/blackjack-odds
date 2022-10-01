import React, { useMemo, CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { Column, CellProps } from 'react-table';
import { getPlayerScoreStats } from '../logic';
import { getScorePlayerDecisionPath } from '../logic/paths';
import { ScoreKey, PlayerDecision } from '../models';
import { ScoreStats, OutcomesSet, AllScoreStatsChoicesSummary, PlayerSettings } from '../types';
import { CustomTable } from './custom-table';
import { ScoreStatsDealerCardChoiceCell } from './score-stats-dealer-card-choice';

interface PlayerDecisionsTableProps {
    allScoreStats: ScoreStats[];
    expandedCells: boolean;
    outcomesSet: OutcomesSet;
    playerChoices: AllScoreStatsChoicesSummary;
    playerDecisionsEdit: boolean;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
    skipIndexColumn?: boolean;
}

export const PlayerDecisionsTable: React.FC<PlayerDecisionsTableProps> = (props) => {
    const { columns, data } = useMemo(() => {
        const columns: Column<ScoreStats>[] = [];

        if (!props.skipIndexColumn) {
            columns.push({
                accessor: 'key',
                Cell: (cellProps: CellProps<ScoreStats, ScoreStats['key']>) => {
                    return (
                        <div>
                            {cellProps.value}{' '}
                            <span
                                style={{
                                    cursor: 'pointer'
                                }}
                            >
                                <Link
                                    to={getScorePlayerDecisionPath(cellProps.value)}
                                    style={{ color: 'black', textDecoration: 'unset' }}
                                >
                                    👁️
                                </Link>
                            </span>
                        </div>
                    );
                },
                Header: 'Score',
                id: 'score'
            });
        }

        columns.push(
            ...props.outcomesSet.allOutcomes.map((cardOutcome) => ({
                Cell: ScoreStatsDealerCardChoiceCell({
                    dealerCard: cardOutcome,
                    isExpanded: props.expandedCells,
                    playerChoices: props.playerChoices,
                    playerDecisionsEdit: props.playerDecisionsEdit,
                    playerSettings: props.playerSettings,
                    playerSettingsSetter: props.playerSettingsSetter,
                    processing: props.processing
                }),
                Header: cardOutcome.symbol,
                id: cardOutcome.key // The column id must be the dealer card key for columnStyle to have access to it below
            }))
        );

        const data = getPlayerScoreStats(props.allScoreStats);

        return { columns, data };
    }, [
        props.allScoreStats,
        props.outcomesSet,
        props.playerChoices,
        props.playerDecisionsEdit,
        props.playerSettings
    ]);

    return (
        <CustomTable
            columns={columns}
            columnStyle={(cellProps) => {
                const baseStyles: CSSProperties = {
                    border: '1px solid black',
                    padding: 0
                };
                const { key } = cellProps.row.original;
                const dealerCardKey =
                    cellProps.column.id === 'score' ? undefined : (cellProps.column.id as ScoreKey);
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
    );
};
