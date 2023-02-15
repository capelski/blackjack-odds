import React, { CSSProperties, useMemo } from 'react';
import { useMediaQuery } from 'react-responsive';
import { CellProps, Column } from 'react-table';
import {
    colors,
    desktopBreakpoint,
    displayProbabilityTotals,
    probabilityLabels
} from '../constants';
import { getDisplayPlayerDecision, getPrimaryPlayerDecisions } from '../logic';
import { PlayerDecision } from '../models';
import { AllDecisionsData, DecisionData, ScoreStats } from '../types';
import { CustomCell, CustomTable } from './custom-table';
import { RoundedFloat } from './rounded-float';

interface DecisionsProbabilityBreakdownProps {
    decisions: AllDecisionsData;
    playerChoice: PlayerDecision;
    scoreStats: ScoreStats;
}

interface RowData {
    decisionData: DecisionData;
    isSelectedDecision: boolean;
    playerDecision: PlayerDecision;
}

const baseStyles: CSSProperties = {
    padding: '4px'
};

export const DecisionsProbabilityBreakdown: React.FC<DecisionsProbabilityBreakdownProps> = (
    props
) => {
    const effectiveScore = props.scoreStats.representativeHand.effectiveScore;
    const isDesktop = useMediaQuery({ minWidth: desktopBreakpoint });
    const isSoftHand = props.scoreStats.representativeHand.allScores.length > 1;
    const playerLessThanCurrent = probabilityLabels.playerLessThanCurrent(effectiveScore);
    const width = isDesktop ? '500px' : '100%';

    const { breakdownColumns, data, outcomeColumns } = useMemo(() => {
        const breakdownColumns: Column<RowData>[] = [
            {
                accessor: 'playerDecision',
                Cell: (cellProps: CellProps<RowData, RowData['playerDecision']>) => {
                    return <div style={baseStyles}>{cellProps.value}</div>;
                },
                Header: 'Decision',
                id: 'decision'
            },
            {
                accessor: 'decisionData',
                Cell: (cellProps: CellProps<RowData, RowData['decisionData']>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.loss }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.value.probabilityBreakdown.playerBusting}
                            />
                        </div>
                    );
                },
                Header: probabilityLabels.playerBusting,
                id: 'playerBusting'
            },
            {
                accessor: 'decisionData',
                Cell: (cellProps: CellProps<RowData, RowData['decisionData']>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.loss }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.value.probabilityBreakdown.playerLessThanDealer}
                            />
                        </div>
                    );
                },
                Header: probabilityLabels.playerLessThanDealer,
                id: 'playerLessThanDealer'
            },
            {
                accessor: 'decisionData',
                Cell: (cellProps: CellProps<RowData, RowData['decisionData']>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.push }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.value.probabilityBreakdown.playerEqualToDealer}
                            />
                        </div>
                    );
                },
                Header: probabilityLabels.playerEqualToDealer,
                id: 'playerEqualToDealer'
            },
            {
                accessor: 'decisionData',
                Cell: (cellProps: CellProps<RowData, RowData['decisionData']>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.win }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.value.probabilityBreakdown.playerMoreThanDealer}
                            />
                        </div>
                    );
                },
                Header: probabilityLabels.playerMoreThanDealer,
                id: 'playerMoreThanDealer'
            },
            {
                accessor: 'decisionData',
                Cell: (cellProps: CellProps<RowData, RowData['decisionData']>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.win }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.value.probabilityBreakdown.dealerBusting}
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
                accessor: 'decisionData',
                Cell: (cellProps: CellProps<RowData, RowData['decisionData']>) => {
                    return (
                        <div style={{ ...baseStyles }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.value.probabilityBreakdown.total}
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
                accessor: 'decisionData',
                Cell: (cellProps: CellProps<RowData, RowData['decisionData']>) => {
                    return (
                        <div style={{ ...baseStyles }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.value.probabilityBreakdown.playerLessThanCurrent}
                            />
                        </div>
                    );
                },
                Header: playerLessThanCurrent,
                id: 'playerLessThanCurrent'
            });
        }

        const outcomeColumns: Column<RowData>[] = [
            {
                accessor: 'playerDecision',
                Cell: (cellProps: CellProps<RowData, RowData['playerDecision']>) => {
                    return <div style={baseStyles}>{cellProps.value}</div>;
                },
                Header: 'Decision',
                id: 'decision'
            },
            {
                accessor: 'decisionData',
                Cell: (cellProps: CellProps<RowData, RowData['decisionData']>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.loss }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.value.outcome.lossProbability}
                            />
                        </div>
                    );
                },
                Header: 'Loss',
                id: 'lossProbability'
            },
            {
                accessor: 'decisionData',
                Cell: (cellProps: CellProps<RowData, RowData['decisionData']>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.push }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.value.outcome.pushProbability}
                            />
                        </div>
                    );
                },
                Header: 'Push',
                id: 'pushProbability'
            },
            {
                accessor: 'decisionData',
                Cell: (cellProps: CellProps<RowData, RowData['decisionData']>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.win }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.value.outcome.winProbability}
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
                accessor: 'decisionData',
                Cell: (cellProps: CellProps<RowData, RowData['decisionData']>) => {
                    return (
                        <div style={baseStyles}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.value.outcome.totalProbability}
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
                accessor: 'decisionData',
                Cell: (cellProps: CellProps<RowData, RowData['decisionData']>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.advantage }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.value.outcome.playerAdvantage.hands}
                            />
                        </div>
                    );
                },
                Header: 'Advantage',
                id: 'playerAdvantageHands'
            },
            {
                accessor: 'decisionData',
                Cell: (cellProps: CellProps<RowData, RowData['decisionData']>) => {
                    return (
                        <div style={{ ...baseStyles, ...colors.payout }}>
                            <RoundedFloat
                                displayPercent={false}
                                value={cellProps.value.outcome.playerAdvantage.payout}
                            />
                        </div>
                    );
                },
                Header: 'Payout',
                id: 'playerAdvantagePayout'
            }
        );

        const data = getPrimaryPlayerDecisions(props.decisions).map(
            (playerDecision: PlayerDecision) => ({
                decisionData: props.decisions[playerDecision],
                isSelectedDecision: playerDecision === props.playerChoice,
                playerDecision: getDisplayPlayerDecision(playerDecision, { simplify: true })
            })
        );

        return { breakdownColumns, data, outcomeColumns };
    }, [props.decisions, props.playerChoice, props.scoreStats]);

    const playerDecisionRow = (cellProps: CustomCell<RowData, Column<RowData>>) => {
        return {
            borderColor: cellProps.row.original.isSelectedDecision
                ? colors.border.highlight
                : colors.border.regular,
            borderWidth: cellProps.row.original.isSelectedDecision ? 2 : 1
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
