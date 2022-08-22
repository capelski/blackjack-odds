import React, { useMemo, useState } from 'react';
import { CellProps, Column } from 'react-table';
import { getPlayerScoreStats } from '../logic';
import { ExpandedRows, ScoreStats } from '../types';
import { CustomTable } from './custom-table';
import { RoundedFloat } from './rounded-float';

interface PlayerScoreStatsTableProps {
    allScoreStats: ScoreStats[];
}

export const PlayerScoreStatsTable = (props: PlayerScoreStatsTableProps) => {
    const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});

    const { columns, data } = useMemo(() => {
        const columns: Column<ScoreStats>[] = [
            {
                accessor: 'key',
                Header: 'Score',
                id: 'score'
            },
            {
                Cell: (cellProps: CellProps<ScoreStats>) => {
                    const { combinations, key } = cellProps.row.original;
                    const isRowExpanded = expandedRows[key];
                    return (
                        <span>
                            {combinations.length}{' '}
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
                            {isRowExpanded && (
                                <React.Fragment>
                                    <br />
                                    {combinations.map((combination) => (
                                        <React.Fragment key={combination}>
                                            <br />
                                            <span>{combination}</span>
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            )}
                        </span>
                    );
                },
                Header: 'Combinations',
                id: 'combinations'
            },
            {
                accessor: 'initialHandProbability',
                Cell: (cellProps: CellProps<ScoreStats, ScoreStats['initialHandProbability']>) => {
                    return <RoundedFloat value={cellProps.value} />;
                },
                Header: `P(initial hand)`,
                id: 'initial-hand-probability'
            }
        ];

        const data = getPlayerScoreStats(props.allScoreStats);

        return { columns, data };
    }, [expandedRows, props.allScoreStats]);

    return <CustomTable columns={columns} data={data} />;
};
