import React, { useMemo, useState } from 'react';
import { CellProps, Column } from 'react-table';
import { dealerStandingScore, maximumScore } from '../logic/constants';
import { getHandProbabilities, getHandScores, getHandSymbols } from '../logic/hand';
import { Dictionary, Hand, HandProbabilities } from '../types';
import { CustomTable } from './custom-table';
import { RoundedFloat } from './rounded-float';

interface HandsTableProps {
    handsNextCardProbabilities: Dictionary<HandProbabilities>;
    outcomesWeight: number;
    rootHands: Hand[];
}

const getHandRows = (hand: Hand, expandedRows: Dictionary<boolean>): Hand[] => {
    const handRows = [hand];
    const handSymbols = getHandSymbols(hand);

    if (expandedRows[handSymbols]) {
        hand.followingHands.forEach((followingHand) => {
            handRows.push(...getHandRows(followingHand, expandedRows));
        });
    }

    return handRows;
};

export const HandsTable = (props: HandsTableProps) => {
    const [expandedRows, setExpandedRows] = useState<Dictionary<boolean>>({});

    const { columns, data } = useMemo((): { columns: Column<Hand>[]; data: Hand[] } => {
        const columns: Column<Hand>[] = [
            {
                accessor: 'followingHands',
                Cell: (cellProps: CellProps<Hand, Hand['followingHands']>) => {
                    const cardSymbols = getHandSymbols(cellProps.row.original);
                    const symbolsNumber = cellProps.row.original.cardSymbols.length;
                    const hasChildRows = cellProps.value.length > 0;

                    return (
                        <span
                            onClick={
                                hasChildRows
                                    ? () => {
                                          setExpandedRows({
                                              ...expandedRows,
                                              [cardSymbols]: !expandedRows[cardSymbols]
                                          });
                                      }
                                    : undefined
                            }
                            style={{
                                cursor: 'pointer',
                                paddingLeft: `${(symbolsNumber - 1) * 24}px`
                            }}
                        >
                            {hasChildRows ? (expandedRows[cardSymbols] ? '👇' : '👉') : '-'}
                        </span>
                    );
                },
                id: 'expander'
            },
            {
                Cell: (cellProps: CellProps<Hand>) => (
                    <span>{getHandSymbols(cellProps.row.original)}</span>
                ),
                Header: 'Cards',
                id: 'cards'
            },
            {
                Cell: (cellProps: CellProps<Hand>) => {
                    return (
                        <span
                            style={{
                                color:
                                    cellProps.row.original.score > maximumScore ? 'red' : 'black',
                                fontWeight: 'bold'
                            }}
                        >
                            {getHandScores(cellProps.row.original)}
                        </span>
                    );
                },
                Header: 'Score',
                id: 'score'
            },
            {
                accessor: 'lastCard',
                Cell: (cellProps: CellProps<Hand, Hand['lastCard']>) => (
                    <RoundedFloat
                        value={cellProps.value.weight / props.outcomesWeight}
                        isPercentage={true}
                    />
                ),
                Header: 'Probability',
                id: 'probability'
            },
            {
                columns: [
                    {
                        Cell: (cellProps: CellProps<Hand>) => {
                            const handProbabilities = getHandProbabilities(
                                cellProps.row.original,
                                props.handsNextCardProbabilities
                            );
                            return cellProps.row.original.score < maximumScore ? (
                                <RoundedFloat
                                    value={handProbabilities.lower[dealerStandingScore]}
                                />
                            ) : (
                                '-'
                            );
                        },
                        Header: `<${dealerStandingScore}`,
                        id: 'lower'
                    },
                    {
                        Cell: (cellProps: CellProps<Hand>) => {
                            const handProbabilities = getHandProbabilities(
                                cellProps.row.original,
                                props.handsNextCardProbabilities
                            );
                            return cellProps.row.original.score < maximumScore ? (
                                <RoundedFloat
                                    value={
                                        handProbabilities.equal[dealerStandingScore] +
                                        handProbabilities.higher[dealerStandingScore]
                                    }
                                />
                            ) : (
                                '-'
                            );
                        },
                        Header: `>=${dealerStandingScore}`,
                        id: 'equal-or-higher'
                    },
                    {
                        Cell: (cellProps: CellProps<Hand>) => {
                            const handProbabilities = getHandProbabilities(
                                cellProps.row.original,
                                props.handsNextCardProbabilities
                            );
                            return cellProps.row.original.score < maximumScore ? (
                                <RoundedFloat value={handProbabilities.overMaximum} />
                            ) : (
                                '-'
                            );
                        },
                        Header: `>${maximumScore}`,
                        id: 'over-maximum'
                    }
                ],
                Header: 'Next card',
                id: 'next-card-probabilities'
            }
        ];

        const data = props.rootHands
            .map((hand) => getHandRows(hand, expandedRows))
            .reduce((reduced, row) => reduced.concat(row), []);

        return { columns, data };
    }, [expandedRows, props.rootHands]);

    return (
        <CustomTable
            columns={columns}
            columnStyle={(cell) =>
                cell.column.id === 'expander' ? { textAlign: 'left' } : undefined
            }
            data={data}
        />
    );
};
