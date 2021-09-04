import React, { useMemo, useState } from 'react';
import { CellProps, Column } from 'react-table';
import { getAggregatedScoreProbabilities } from '../logic/all-hands-probabilities';
import { dealerStandingScore, maximumScore } from '../logic/constants';
import {
    getEqualToScoreProbability,
    getHigherThanScoreProbability,
    getLowerThanScoreProbability
} from '../logic/hand-probabilities';
import {
    AggregatedScore,
    AllAggregatedScores,
    AllHandsProbabilities,
    ExpandedRows
} from '../types';
import { CustomTable } from './custom-table';
import { RoundedFloat } from './rounded-float';

interface AggregatedScoresTableProps {
    aggregatedScores: AllAggregatedScores;
    decimals: number;
    longRunPlayerProbabilities: AllHandsProbabilities;
    nextCardPlayerProbabilities: AllHandsProbabilities;
    outcomesWeight: number;
}

export const AggregatedScoresTable = (props: AggregatedScoresTableProps) => {
    const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});

    const { columns, data } = useMemo(() => {
        const columns: Column<AggregatedScore>[] = [
            {
                accessor: 'scores',
                Cell: (cellProps: CellProps<AggregatedScore, AggregatedScore['scores']>) => {
                    const isRowExpanded = expandedRows[cellProps.value];

                    return (
                        <span>
                            {cellProps.value}{' '}
                            <span
                                onClick={() => {
                                    setExpandedRows({
                                        ...expandedRows,
                                        [cellProps.value]: !isRowExpanded
                                    });
                                }}
                                style={{
                                    cursor: 'pointer'
                                }}
                            >
                                {isRowExpanded ? '✖️' : '👁️'}
                            </span>
                        </span>
                    );
                },
                Header: 'Score',
                id: 'score'
            },
            {
                accessor: 'combinations',
                Cell: (cellProps: CellProps<AggregatedScore, AggregatedScore['combinations']>) => {
                    const isRowExpanded = expandedRows[cellProps.row.original.scores];
                    return (
                        <span>
                            {cellProps.value.length}
                            {isRowExpanded && (
                                <React.Fragment>
                                    <br />
                                    {cellProps.value.map((combination) => (
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
                columns: [
                    {
                        Cell: (cellProps: CellProps<AggregatedScore>) => {
                            const scoreProbabilities = getAggregatedScoreProbabilities(
                                cellProps.row.original,
                                props.nextCardPlayerProbabilities
                            );
                            return (
                                <RoundedFloat
                                    decimals={props.decimals}
                                    value={getLowerThanScoreProbability(
                                        scoreProbabilities,
                                        dealerStandingScore
                                    )}
                                />
                            );
                        },
                        Header: `<${dealerStandingScore}`,
                        id: 'next-card-lower'
                    },
                    {
                        Cell: (cellProps: CellProps<AggregatedScore>) => {
                            const scoreProbabilities = getAggregatedScoreProbabilities(
                                cellProps.row.original,
                                props.nextCardPlayerProbabilities
                            );
                            return (
                                <RoundedFloat
                                    decimals={props.decimals}
                                    value={
                                        getEqualToScoreProbability(
                                            scoreProbabilities,
                                            dealerStandingScore
                                        ) +
                                        getHigherThanScoreProbability(
                                            scoreProbabilities,
                                            dealerStandingScore
                                        )
                                    }
                                />
                            );
                        },
                        Header: `>=${dealerStandingScore}`,
                        id: 'next-card-equal-or-higher'
                    },
                    {
                        Cell: (cellProps: CellProps<AggregatedScore>) => {
                            const scoreProbabilities = getAggregatedScoreProbabilities(
                                cellProps.row.original,
                                props.nextCardPlayerProbabilities
                            );

                            return (
                                <RoundedFloat
                                    decimals={props.decimals}
                                    value={scoreProbabilities.overMaximum}
                                />
                            );
                        },
                        Header: `>${maximumScore}`,
                        id: 'next-card-over-maximum'
                    }
                ],
                Header: 'Next card',
                id: 'next-card-probabilities'
            },
            {
                columns: [
                    {
                        Cell: (cellProps: CellProps<AggregatedScore>) => {
                            const scoreProbabilities = getAggregatedScoreProbabilities(
                                cellProps.row.original,
                                props.longRunPlayerProbabilities
                            );
                            return (
                                <RoundedFloat
                                    decimals={props.decimals}
                                    value={getLowerThanScoreProbability(
                                        scoreProbabilities,
                                        dealerStandingScore
                                    )}
                                />
                            );
                        },
                        Header: `<${dealerStandingScore}`,
                        id: 'long-run-lower'
                    },
                    {
                        Cell: (cellProps: CellProps<AggregatedScore>) => {
                            const scoreProbabilities = getAggregatedScoreProbabilities(
                                cellProps.row.original,
                                props.longRunPlayerProbabilities
                            );
                            return (
                                <RoundedFloat
                                    decimals={props.decimals}
                                    value={
                                        getEqualToScoreProbability(
                                            scoreProbabilities,
                                            dealerStandingScore
                                        ) +
                                        getHigherThanScoreProbability(
                                            scoreProbabilities,
                                            dealerStandingScore
                                        )
                                    }
                                />
                            );
                        },
                        Header: `>=${dealerStandingScore}`,
                        id: 'long-run-equal-or-higher'
                    },
                    {
                        Cell: (cellProps: CellProps<AggregatedScore>) => {
                            const scoreProbabilities = getAggregatedScoreProbabilities(
                                cellProps.row.original,
                                props.longRunPlayerProbabilities
                            );
                            return (
                                <RoundedFloat
                                    decimals={props.decimals}
                                    value={scoreProbabilities.overMaximum}
                                />
                            );
                        },
                        Header: `>${maximumScore}`,
                        id: 'long-run-over-maximum'
                    }
                ],
                Header: 'Long run',
                id: 'long-run-probabilities'
            }
        ];

        const data = Object.values(props.aggregatedScores).sort((a, b) => a.score - b.score);

        return { columns, data };
    }, [
        expandedRows,
        props.decimals,
        props.longRunPlayerProbabilities,
        props.nextCardPlayerProbabilities,
        props.aggregatedScores
    ]);

    return <CustomTable columns={columns} data={data} />;
};
