import React, { useMemo, useState } from 'react';
import { CellProps, Column } from 'react-table';
import { maximumScore } from '../logic/constants';
import { getHandKey } from '../logic/hand';
import { Dictionary, Hand } from '../types';
import { CustomTable } from './custom-table';
import { RoundedFloat } from './rounded-float';

interface HandsTableProps {
    hands: Hand[];
    outcomesWeight: number;
}

const getHandRows = (hand: Hand, expandedRows: Dictionary<boolean>): Hand[] => {
    const handRows = [hand];
    const handKey = getHandKey(hand);

    if (expandedRows[handKey]) {
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
                    const cardSymbols = cellProps.row.original.cardSymbols.join(',');
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
                accessor: 'cardSymbols',
                Cell: (cellProps: CellProps<Hand, Hand['cardSymbols']>) => (
                    <span>{cellProps.value.join(',')}</span>
                ),
                Header: 'Cards',
                id: 'cards'
            },
            {
                accessor: 'values',
                Cell: (cellProps: CellProps<Hand, Hand['values']>) => {
                    return (
                        <span
                            style={{
                                color:
                                    cellProps.row.original.value > maximumScore ? 'red' : 'black',
                                fontWeight: 'bold'
                            }}
                        >
                            {cellProps.value.join('/')}
                        </span>
                    );
                },
                Header: 'Score',
                id: 'value'
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
            }
        ];

        const data = props.hands
            .map((hand) => getHandRows(hand, expandedRows))
            .reduce((reduced, row) => reduced.concat(row), []);

        return { columns, data };
    }, [expandedRows, props.hands]);

    return <CustomTable columns={columns} data={data} />;
};
