import React, { useMemo, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { Link } from 'react-router-dom';
import { CellProps } from 'react-table';
import { desktopBreakpoint } from '../constants';
import { getPlayerDecisionScorePath, getPlayerScoreStats } from '../logic';
import { ScoreKey } from '../models';
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
                                style={{ color: 'black', textDecoration: 'none' }}
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
                cellStyle={(cellProps) => {
                    const { dealerCardKey } = cellProps.column;
                    const { key: scoreKey } = cellProps.row.original;
                    return {
                        borderColor:
                            dealerCardKey &&
                            props.playerSettings.playerDecisionsOverrides[scoreKey]?.[
                                dealerCardKey
                            ] !== undefined
                                ? 'coral'
                                : 'black'
                    };
                }}
                columns={columns}
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
