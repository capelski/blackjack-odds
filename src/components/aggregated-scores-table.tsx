import React, { useMemo } from 'react';
import { CellProps, Column } from 'react-table';
import { getAggregatedScoreProbabilities } from '../logic/aggregated-score';
import { dealerStandingScore, maximumScore } from '../logic/constants';
import { AggregatedScore, Dictionary, HandProbabilities } from '../types';
import { CustomTable } from './custom-table';
import { RoundedFloat } from './rounded-float';

interface AggregatedScoresTableProps {
    aggregatedScores: Dictionary<AggregatedScore>;
    handsNextCardProbabilities: Dictionary<HandProbabilities>;
    outcomesWeight: number;
}

export const AggregatedScoresTable = (props: AggregatedScoresTableProps) => {
    const columns = useMemo(
        (): Column<AggregatedScore>[] => [
            {
                accessor: 'scores',
                Cell: (cellProps: CellProps<AggregatedScore, AggregatedScore['scores']>) => {
                    return <span>{cellProps.value}</span>;
                },
                Header: 'Score',
                id: 'score'
            },
            {
                accessor: 'combinations',
                Cell: (cellProps: CellProps<AggregatedScore, AggregatedScore['combinations']>) => {
                    return <span>{cellProps.value.length}</span>;
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
                                    value={scoreProbabilities.lower[dealerStandingScore]}
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
                                        scoreProbabilities.equal[dealerStandingScore] +
                                        scoreProbabilities.higher[dealerStandingScore]
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
        [props.handsNextCardProbabilities, props.aggregatedScores]
    );

    const data = useMemo(() => {
        return Object.values(props.aggregatedScores).sort((a, b) => a.score - b.score);
    }, [props.aggregatedScores]);

    return <CustomTable columns={columns} data={data} />;
};
