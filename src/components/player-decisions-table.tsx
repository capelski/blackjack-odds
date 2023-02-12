import React, { CSSProperties, useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';
import { CellProps } from 'react-table';
import { desktopBreakpoint } from '../constants';
import { getPlayerDecisionScorePath, getPlayerScoreStats } from '../logic';
import { ScoreKey, PlayerDecision } from '../models';
import {
    AllScoreStatsChoicesSummary,
    OutcomesSet,
    PlayerSettings,
    ScoreStats,
    SplitOptions
} from '../types';
import { CustomColumn, CustomTable } from './custom-table';
import { EditPlayerDecisions } from './edit-player-decisions';
import { InitialHandProbability } from './initial-hand-probability';
import { ScoreStatsDealerCardChoiceCell } from './score-stats-dealer-card-choice';

interface PlayerDecisionsTableProps {
    allScoreStats: ScoreStats[];
    outcomesSet: OutcomesSet;
    playerChoices: AllScoreStatsChoicesSummary;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
    skipInitialColumns?: boolean;
    splitOptions: SplitOptions;
}

type ScoreStatsColumn = CustomColumn<
    ScoreStats,
    {
        dealerCardKey?: ScoreKey;
    }
>;

export const PlayerDecisionsTable: React.FC<PlayerDecisionsTableProps> = (props) => {
    const [playerDecisionsEdit, setPlayerDecisionsEdit] = useState(false);
    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });

    const { columns, data } = useMemo(() => {
        const columns: ScoreStatsColumn[] = [];

        if (!props.skipInitialColumns) {
            columns.push({
                accessor: 'key',
                Cell: (cellProps: CellProps<ScoreStats, ScoreStats['key']>) => {
                    return (
                        <div>
                            <Link
                                to={getPlayerDecisionScorePath(cellProps.value)}
                                style={{ color: 'black' }}
                            >
                                {cellProps.value}
                            </Link>
                        </div>
                    );
                },
                id: 'score'
            });

            columns.push({
                Cell: (cellProps: CellProps<ScoreStats>) => {
                    return (
                        <div>
                            <InitialHandProbability
                                allScoreStats={props.allScoreStats}
                                displayPercent={false}
                                scoreStats={cellProps.row.original}
                                splitOptions={props.splitOptions}
                            />
                        </div>
                    );
                },
                Header: '%',
                id: 'initialHandProbability'
            });
        }

        columns.push(
            ...props.outcomesSet.allOutcomes.map<ScoreStatsColumn>((cardOutcome) => ({
                Cell: ScoreStatsDealerCardChoiceCell({
                    dealerCard: cardOutcome,
                    isDesktop,
                    playerChoices: props.playerChoices,
                    playerDecisionsEdit,
                    playerSettings: props.playerSettings,
                    playerSettingsSetter: props.playerSettingsSetter,
                    processing: props.processing
                }),
                Header: cardOutcome.symbol,
                id: cardOutcome.key,
                dealerCardKey: cardOutcome.key
            }))
        );

        const data = getPlayerScoreStats(props.allScoreStats);

        return { columns, data };
    }, [
        isDesktop,
        playerDecisionsEdit,
        props.allScoreStats,
        props.outcomesSet,
        props.playerChoices,
        props.playerSettings
    ]);

    return (
        <React.Fragment>
            <CustomTable
                columns={columns}
                columnStyle={(cellProps) => {
                    const baseStyles: CSSProperties = {
                        border: '1px solid black',
                        padding: '4px 0'
                    };
                    const { key } = cellProps.row.original;
                    const { dealerCardKey } = cellProps.column;
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
            <br />
            <EditPlayerDecisions
                playerDecisionsEdit={playerDecisionsEdit}
                playerDecisionsEditSetter={setPlayerDecisionsEdit}
                playerSettings={props.playerSettings}
                playerSettingsSetter={props.playerSettingsSetter}
                processing={props.processing}
            />
            <br />
            <br />
        </React.Fragment>
    );
};
