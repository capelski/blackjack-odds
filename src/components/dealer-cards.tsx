import React, { useMemo } from 'react';
import { CellProps, Column } from 'react-table';
import { blackjackScore, dealerStandThreshold, maximumScore } from '../constants';
import {
    getApplicableDealerProbabilities,
    getBustingProbability,
    getOutcomesSet,
    getRangeProbability
} from '../logic';
import { CardOutcome, FinalScoresDictionary, ScoreStats } from '../types';
import { CustomTable } from './custom-table';
import { RoundedFloat } from './rounded-float';

interface DealerCardsProps {
    dealerProbabilities: FinalScoresDictionary;
}

export const DealerCards = (props: DealerCardsProps) => {
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

        const data = getOutcomesSet().allOutcomes;

        return { columns, data };
    }, [props.dealerProbabilities]);

    return <CustomTable columns={columns} data={data} />;
};
