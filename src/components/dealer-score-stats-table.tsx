import React, { useMemo } from 'react';
import { CellProps, Column } from 'react-table';
import { blackjackScore, dealerStandThreshold, maximumScore } from '../constants';
import {
    getApplicableDealerProbabilities,
    getBustingProbability,
    getRangeProbability
} from '../logic';
import { CardOutcome, FinalScoresDictionary, OutcomesSet, ScoreStats } from '../types';
import { CustomTable } from './custom-table';
import { RoundedFloat } from './rounded-float';

interface DealerScoreStatsTableProps {
    dealerProbabilities: FinalScoresDictionary;
    outcomeSet: OutcomesSet;
}

export const DealerScoreStatsTable = (props: DealerScoreStatsTableProps) => {
    const { columns, data } = useMemo(() => {
        const columns: Column<CardOutcome>[] = [
            {
                accessor: 'symbol',
                Header: 'Card',
                id: 'dealer-card'
            },
            {
                columns: [
                    {
                        accessor: 'key',
                        Cell: (cellProps: CellProps<ScoreStats, ScoreStats['key']>) => {
                            return (
                                <RoundedFloat
                                    value={getRangeProbability(
                                        getApplicableDealerProbabilities(
                                            props.dealerProbabilities,
                                            cellProps.value
                                        ),
                                        dealerStandThreshold,
                                        maximumScore
                                    )}
                                />
                            );
                        },
                        Header: `P(${dealerStandThreshold}-${maximumScore})`,
                        id: 'dealer-nth-card-non-busting'
                    },
                    {
                        accessor: 'key',
                        Cell: (cellProps: CellProps<ScoreStats, ScoreStats['key']>) => {
                            return (
                                <RoundedFloat
                                    value={getRangeProbability(
                                        getApplicableDealerProbabilities(
                                            props.dealerProbabilities,
                                            cellProps.value
                                        ),
                                        blackjackScore,
                                        blackjackScore
                                    )}
                                />
                            );
                        },
                        Header: `P(BJ)`,
                        id: 'dealer-nth-card-blackjack'
                    },
                    {
                        accessor: 'key',
                        Cell: (cellProps: CellProps<ScoreStats, ScoreStats['key']>) => {
                            return (
                                <RoundedFloat
                                    value={getBustingProbability(
                                        getApplicableDealerProbabilities(
                                            props.dealerProbabilities,
                                            cellProps.value
                                        )
                                    )}
                                />
                            );
                        },
                        Header: `P(>${maximumScore})`,
                        id: 'dealer-nth-card-busting'
                    }
                ],
                Header: `Nth card`,
                id: 'dealer-nth-card'
            }
        ];

        const data = props.outcomeSet.allOutcomes;

        return { columns, data };
    }, [props.dealerProbabilities, props.outcomeSet]);

    return <CustomTable columns={columns} data={data} />;
};
