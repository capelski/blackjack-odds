import React, { useMemo, useState } from 'react';
import { CellProps, Column } from 'react-table';
import { dealerStandThreshold, maximumScore } from '../constants';
import { getBustingProbability, getRangeProbability, sortScoreStats } from '../logic';
import { ExpandedRows, ScoreStats, AllEffectiveScoreProbabilities } from '../types';
import { CustomTable } from './custom-table';
import { RoundedFloat } from './rounded-float';

interface AllScoreStatsTableProps {
    allScoreStats: ScoreStats[];
    dealerProbabilities: AllEffectiveScoreProbabilities;
    oneMoreCardProbabilities: AllEffectiveScoreProbabilities;
}

export const AllScoreStatsTable = (props: AllScoreStatsTableProps) => {
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
            },
            {
                accessor: 'key',
                Cell: (cellProps: CellProps<ScoreStats, ScoreStats['key']>) => {
                    return (
                        <RoundedFloat
                            value={getBustingProbability(
                                props.oneMoreCardProbabilities[cellProps.value]
                            )}
                        />
                    );
                },
                Header: `P(>${maximumScore}) on next card`,
                id: 'one-more-card-busting-risk'
            },
            {
                accessor: 'key',
                Cell: (cellProps: CellProps<ScoreStats, ScoreStats['key']>) => {
                    return (
                        <RoundedFloat
                            value={getRangeProbability(
                                props.dealerProbabilities[cellProps.value],
                                dealerStandThreshold,
                                maximumScore
                            )}
                        />
                    );
                },
                Header: `Dealer P(${dealerStandThreshold}-${maximumScore}) on nth card`,
                id: 'dealer-stand-threshold'
            }
        ];

        const data = sortScoreStats(props.allScoreStats);

        return { columns, data };
    }, [
        expandedRows,
        props.allScoreStats,
        props.dealerProbabilities,
        props.oneMoreCardProbabilities
    ]);

    return <CustomTable columns={columns} data={data} />;
};
