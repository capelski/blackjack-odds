import React, { useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';
import { CellProps } from 'react-table';
import {
    InitialHandProbability,
    OutcomeComponent,
    PlayerDecisionsTable,
    ScoreStatsColumn
} from '../components';
import { desktopBreakpoint, colors } from '../constants';
import { getPlayerDecisionScorePath, getPlayerScoreStats } from '../logic';
import {
    AllScoreStatsChoicesSummary,
    OutcomesSet,
    PlayerSettings,
    ScoreStats,
    SplitOptions
} from '../types';

interface PlayerDecisionsAllProps {
    allScoreStats?: ScoreStats[];
    outcomesSet: OutcomesSet;
    playerChoices?: AllScoreStatsChoicesSummary;
    playerSettings: PlayerSettings;
    playerSettingsSetter: (playerSettings: PlayerSettings) => void;
    processing: boolean;
    splitOptions: SplitOptions;
}

export const PlayerDecisionsAll: React.FC<PlayerDecisionsAllProps> = (props) => {
    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });

    const additionalColumns = useMemo((): ScoreStatsColumn[] => {
        return [
            {
                accessor: 'key',
                Cell: (cellProps: CellProps<ScoreStats, ScoreStats['key']>) => {
                    return (
                        <div>
                            <Link
                                to={getPlayerDecisionScorePath(cellProps.value)}
                                style={{ color: colors.link.default, textDecoration: 'none' }}
                            >
                                {cellProps.value}
                            </Link>
                        </div>
                    );
                },
                id: 'score'
            },
            {
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
            }
        ];
    }, [isDesktop, props.allScoreStats, props.splitOptions]);

    return (
        <div>
            <h3>Player decisions</h3>
            <OutcomeComponent outcome={props.playerChoices?.outcome} />
            {props.allScoreStats !== undefined && props.playerChoices !== undefined ? (
                <PlayerDecisionsTable
                    {...props}
                    additionalColumns={additionalColumns}
                    data={getPlayerScoreStats(props.allScoreStats)}
                    playerChoices={props.playerChoices}
                />
            ) : (
                'Processing...'
            )}
        </div>
    );
};
