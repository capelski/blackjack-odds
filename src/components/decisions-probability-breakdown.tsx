import React, { CSSProperties, useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { CellProps, Column } from 'react-table';
import {
    colors,
    desktopBreakpoint,
    displayProbabilityTotals,
    probabilityLabels
} from '../constants';
import { PlayerActionData, PlayerFact } from '../types';
import { CustomCell, CustomTable } from './custom-table';
import { RoundedFloat } from './rounded-float';

interface DecisionsProbabilityBreakdownProps {
    dealerCardKey?: string;
    playerFact: PlayerFact;
}

const baseStyles: CSSProperties = {
    padding: '4px'
};

export const DecisionsProbabilityBreakdown: React.FC<DecisionsProbabilityBreakdownProps> = (
    props
) => {
    const effectiveScore = props.playerFact.hand.effectiveScore;
    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });
    const isSoftHand = props.playerFact.hand.allScores.length > 1;
    const playerLessThanCurrent = probabilityLabels.playerLessThanCurrent(effectiveScore);
    const width = isDesktop ? '500px' : '100%';

    const { breakdownColumns, data, outcomeColumns } = useMemo(() => {
        const breakdownColumns: Column<PlayerActionData>[] = [
            {
                Cell: (cellProps: CellProps<PlayerActionData>) => {
                    return <div style={baseStyles}>{cellProps.row.original.action}</div>;
                },
                Header: 'Action',
                id: 'action'
            },
            {
                Cell: (cellProps: CellProps<PlayerActionData>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.loss }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.row.original.vsDealerBreakdown.playerBusting}
                            />
                        </div>
                    );
                },
                Header: probabilityLabels.playerBusting,
                id: 'playerBusting'
            },
            {
                Cell: (cellProps: CellProps<PlayerActionData>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.loss }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={
                                    cellProps.row.original.vsDealerBreakdown.playerLessThanDealer
                                }
                            />
                        </div>
                    );
                },
                Header: probabilityLabels.playerLessThanDealer,
                id: 'playerLessThanDealer'
            },
            {
                Cell: (cellProps: CellProps<PlayerActionData>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.push }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.row.original.vsDealerBreakdown.playerEqualToDealer}
                            />
                        </div>
                    );
                },
                Header: probabilityLabels.playerEqualToDealer,
                id: 'playerEqualToDealer'
            },
            {
                Cell: (cellProps: CellProps<PlayerActionData>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.win }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={
                                    cellProps.row.original.vsDealerBreakdown.playerMoreThanDealer
                                }
                            />
                        </div>
                    );
                },
                Header: probabilityLabels.playerMoreThanDealer,
                id: 'playerMoreThanDealer'
            },
            {
                Cell: (cellProps: CellProps<PlayerActionData>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.win }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.row.original.vsDealerBreakdown.dealerBusting}
                            />
                        </div>
                    );
                },
                Header: probabilityLabels.dealerBusting,
                id: 'dealerBusting'
            }
        ];

        if (displayProbabilityTotals) {
            breakdownColumns.push({
                Cell: (cellProps: CellProps<PlayerActionData>) => {
                    return (
                        <div style={{ ...baseStyles }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.row.original.vsDealerBreakdown.total}
                            />
                        </div>
                    );
                },
                Header: 'Total',
                id: 'breakdownTotal'
            });
        }

        if (isSoftHand) {
            breakdownColumns.push({
                Cell: (cellProps: CellProps<PlayerActionData>) => {
                    return (
                        <div style={{ ...baseStyles }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={
                                    cellProps.row.original.vsDealerBreakdown.playerLessThanCurrent
                                }
                            />
                        </div>
                    );
                },
                Header: playerLessThanCurrent,
                id: 'playerLessThanCurrent'
            });
        }

        const outcomeColumns: Column<PlayerActionData>[] = [
            {
                Cell: (cellProps: CellProps<PlayerActionData>) => {
                    return <div style={baseStyles}>{cellProps.row.original.action}</div>;
                },
                Header: 'Action',
                id: 'action'
            },
            {
                Cell: (cellProps: CellProps<PlayerActionData>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.loss }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.row.original.vsDealerOutcome.lossProbability}
                            />
                        </div>
                    );
                },
                Header: 'Loss',
                id: 'lossProbability'
            },
            {
                Cell: (cellProps: CellProps<PlayerActionData>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.push }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.row.original.vsDealerOutcome.pushProbability}
                            />
                        </div>
                    );
                },
                Header: 'Push',
                id: 'pushProbability'
            },
            {
                Cell: (cellProps: CellProps<PlayerActionData>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.win }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.row.original.vsDealerOutcome.winProbability}
                            />
                        </div>
                    );
                },
                Header: 'Win',
                id: 'winProbability'
            }
        ];

        if (displayProbabilityTotals) {
            outcomeColumns.push({
                Cell: (cellProps: CellProps<PlayerActionData>) => {
                    return (
                        <div style={baseStyles}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.row.original.vsDealerOutcome.totalProbability}
                            />
                        </div>
                    );
                },
                Header: 'Total',
                id: 'outcomeTotal'
            });
        }

        outcomeColumns.push(
            {
                Cell: (cellProps: CellProps<PlayerActionData>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.advantage }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.row.original.vsDealerOutcome.playerAdvantage.hands}
                            />
                        </div>
                    );
                },
                Header: 'Advantage',
                id: 'playerAdvantageHands'
            },
            {
                Cell: (cellProps: CellProps<PlayerActionData>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.payout }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={
                                    cellProps.row.original.vsDealerOutcome.playerAdvantage.payout
                                }
                            />
                        </div>
                    );
                },
                Header: 'Payout',
                id: 'playerAdvantagePayout'
            }
        );

        const data = props.dealerCardKey
            ? props.playerFact.vsDealerCard[props.dealerCardKey].preferences
            : props.playerFact.vsDealerAverage.preferences;

        return { breakdownColumns, data, outcomeColumns };
    }, [props.playerFact, props.dealerCardKey]);

    const playerDecisionRow = (
        cellProps: CustomCell<PlayerActionData, Column<PlayerActionData>>
    ) => {
        return {
            borderColor:
                cellProps.row.index === 0 ? colors.border.highlight : colors.border.regular,
            borderWidth: cellProps.row.index === 0 ? 2 : 1
        };
    };

    return (
        <React.Fragment>
            <h4>Hand outcome probability</h4>
            <CustomTable
                cellStyle={playerDecisionRow}
                columns={outcomeColumns}
                data={data}
                width={width}
            />
            <h4>Hand probability breakdown</h4>
            <CustomTable
                cellStyle={playerDecisionRow}
                columns={breakdownColumns}
                data={data}
                width={width}
            />
            <p>{probabilityLabels.playerBusting} = probability of player busting</p>
            <p>
                {probabilityLabels.playerLessThanDealer} = probability of player getting a score
                lower than dealer's score
            </p>
            <p>
                {probabilityLabels.playerEqualToDealer} = probability of player getting the same
                score as dealer's score
            </p>
            <p>
                {probabilityLabels.playerMoreThanDealer} = probability of player getting a score
                higher than dealer's score
            </p>
            <p>
                {probabilityLabels.dealerBusting} = probability of dealer busting (when player hand
                is not bust)
            </p>
            {isSoftHand && (
                <p>
                    {playerLessThanCurrent} = probability of player getting a score lower than{' '}
                    {effectiveScore}
                </p>
            )}
        </React.Fragment>
    );
};
