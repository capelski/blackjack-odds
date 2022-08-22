import React, { useMemo } from 'react';
import { CellProps, Column } from 'react-table';
import { dealerStandThreshold, maximumScore } from '../constants';
import { getBustingProbability, getRangeProbability } from '../logic';
import { ScoreStats, AllEffectiveScoreProbabilities, OutcomesSet, CardOutcome } from '../types';
import { CustomTable } from './custom-table';
import { RoundedFloat } from './rounded-float';

interface DealerScoreStatsTableProps {
    dealerProbabilities: AllEffectiveScoreProbabilities;
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
                                        props.dealerProbabilities[cellProps.value],
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
                                    value={getBustingProbability(
                                        props.dealerProbabilities[cellProps.value]
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
