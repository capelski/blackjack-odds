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
    handsNextCardProbabilities: AllHandsProbabilities;
    outcomesWeight: number;
}

export const AggregatedScoresTable = (props: AggregatedScoresTableProps) => {
    const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});

    const columns = useMemo(
        (): Column<AggregatedScore>[] => [
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
                                props.handsNextCardProbabilities
                            );
                            return (
                                <RoundedFloat
                                    value={getLowerThanScoreProbability(
                                        scoreProbabilities,
                                        dealerStandingScore
                                    )}
                                />
                            );
                        },
                        Header: `<${dealerStandingScore}`,
                        id: 'lower'
                    },
                    {
                        Cell: (cellProps: CellProps<AggregatedScore>) => {
                            const scoreProbabilities = getAggregatedScoreProbabilities(
                                cellProps.row.original,
                                props.handsNextCardProbabilities
                            );
                            return (
                                <RoundedFloat
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
                        id: 'equal-or-higher'
                    },
                    {
                        Cell: (cellProps: CellProps<AggregatedScore>) => {
                            const scoreProbabilities = getAggregatedScoreProbabilities(
                                cellProps.row.original,
                                props.handsNextCardProbabilities
                            );
                            return <RoundedFloat value={scoreProbabilities.overMaximum} />;
                        },
                        Header: `>${maximumScore}`,
                        id: 'over-maximum'
                    }
                ],
                Header: 'Next card',
                id: 'next-card-probabilities'
            }
        ],
        [expandedRows, props.handsNextCardProbabilities, props.aggregatedScores]
    );

    const data = useMemo(() => {
        return Object.values(props.aggregatedScores).sort((a, b) => a.score - b.score);
    }, [expandedRows, props.handsNextCardProbabilities, props.aggregatedScores]);

    return <CustomTable columns={columns} data={data} />;
};
